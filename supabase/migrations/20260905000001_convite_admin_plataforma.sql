-- ============================================================
-- 0011: Convite seguro para admin_plataforma
-- Hoje a promoção a admin_plataforma é um UPDATE manual direto no
-- SQL Editor: funciona para um responsável técnico único, mas não
-- escala pra múltiplos admins nem deixa trilha de quem promoveu quem.
-- Este migration troca isso por um convite por e-mail, no mesmo
-- espírito do convite de colaborador: um admin_plataforma existente
-- registra o e-mail; quando essa pessoa se cadastra (com qualquer
-- papel escolhido no formulário), o trigger de criação de perfil
-- detecta o convite pendente e promove automaticamente, sem update
-- manual e com registro de quem convidou.
-- ============================================================

create table if not exists public.convites_admin_plataforma (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  convidado_por uuid not null references public.profiles(id),
  aceito boolean not null default false,
  criado_em timestamptz not null default now(),
  aceito_em timestamptz
);

alter table public.convites_admin_plataforma enable row level security;

-- Índice parcial: um e-mail só pode ter um convite pendente por vez,
-- mas pode ser reconvidado depois que um convite anterior for aceito
-- (por exemplo, se essa pessoa perder o papel de admin_plataforma).
create unique index if not exists convites_admin_email_pendente_idx
  on public.convites_admin_plataforma (email)
  where not aceito;

-- Só admin_plataforma vê a lista de convites (quem convidou, quando, se já foi aceito)
create policy "convites_admin_select"
  on public.convites_admin_plataforma for select
  using (public.is_admin_plataforma());

-- Emitir um convite é uma função, não um INSERT direto: assim a checagem
-- "só admin_plataforma pode convidar outro admin_plataforma" fica garantida
-- num único lugar, e conseguimos fazer upsert (reconvidar um e-mail que
-- ainda não aceitou) sem expor policy de INSERT/UPDATE direta na tabela.
create or replace function public.convidar_admin_plataforma(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_plataforma() then
    raise exception 'Apenas administradores da plataforma podem convidar outro administrador.';
  end if;

  if exists (
    select 1 from public.profiles where lower(email) = lower(p_email) and role = 'admin_plataforma'
  ) then
    raise exception 'Este e-mail já pertence a um administrador da plataforma.';
  end if;

  insert into public.convites_admin_plataforma (email, convidado_por)
  values (lower(p_email), auth.uid())
  on conflict (email) where not aceito
    do update set convidado_por = excluded.convidado_por, criado_em = now();
end;
$$;

-- Upsert acima depende do índice único parcial criado logo após a tabela
-- (`convites_admin_email_pendente_idx`), que só existe entre convites
-- ainda não aceitos, pra permitir reconvidar um e-mail depois que um
-- convite antigo já foi aceito e essa pessoa eventualmente perder o papel.
revoke all on function public.convidar_admin_plataforma(text) from public;
grant execute on function public.convidar_admin_plataforma(text) to authenticated;

-- Atualiza o trigger de criação de perfil: se o e-mail do novo usuário
-- tem um convite de admin_plataforma pendente, o papel escolhido no
-- cadastro é ignorado e a conta já nasce admin_plataforma, com o
-- convite marcado como aceito e um registro no audit_log de quem
-- convidou (para trilha de auditoria de quem promoveu quem).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, core
as $$
declare
  v_convite public.convites_admin_plataforma;
  v_role public.app_role;
begin
  select * into v_convite
  from public.convites_admin_plataforma
  where lower(email) = lower(new.email) and not aceito
  limit 1;

  v_role := case
    when v_convite.id is not null then 'admin_plataforma'::public.app_role
    else coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'colaborador')
  end;

  insert into public.profiles (id, role, full_name, email)
  values (new.id, v_role, new.raw_user_meta_data->>'full_name', new.email);

  if v_convite.id is not null then
    update public.convites_admin_plataforma
    set aceito = true, aceito_em = now()
    where id = v_convite.id;

    insert into core.audit_log (actor_profile_id, acao, tabela, registro_id, detalhe)
    values (
      v_convite.convidado_por,
      'update',
      'public.profiles',
      new.id,
      jsonb_build_object('promovido_para', 'admin_plataforma', 'via_convite_id', v_convite.id)
    );
  end if;

  return new;
end;
$$;
