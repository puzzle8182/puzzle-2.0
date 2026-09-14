-- ============================================================
-- 0012: Correções de segurança críticas
--
-- Problema 1: handle_new_user() ainda confiava em
-- raw_user_meta_data->>'role' como fallback quando não havia
-- convite de admin_plataforma pendente. Como raw_user_meta_data
-- é definido pelo próprio cliente no signUp(), qualquer pessoa
-- podia se cadastrar com role='admin_plataforma' diretamente,
-- sem convite. Corrigido: o fallback nunca aceita admin_plataforma;
-- só o fluxo de convite (migration 0011) pode gerar esse papel.
--
-- Problema 2: a policy "agendamentos_insert_colaborador" só
-- verificava colaborador_profile_id = auth.uid(), sem validar
-- valor_empresa/valor_colaborador nem empresa_id. Um colaborador
-- podia inserir um agendamento com split arbitrário (ex: empresa
-- pagando 100% mesmo em contrato de coparticipação) ou com
-- empresa_id de uma empresa à qual não pertence. Corrigido:
-- criação de agendamento passa a ser exclusivamente via função
-- security definer que recalcula o rateio a partir dos dados
-- reais de corporate.empresas e clinical.psicologos; o INSERT
-- direto na tabela é revogado para authenticated.
-- ============================================================

-- ---------- Problema 1: role de admin_plataforma nunca vem do cliente ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, core
as $$
declare
  v_convite public.convites_admin_plataforma;
  v_role_texto text := new.raw_user_meta_data->>'role';
  v_role_solicitado public.app_role;
  v_role public.app_role;
begin
  select * into v_convite
  from public.convites_admin_plataforma
  where lower(email) = lower(new.email) and not aceito
  limit 1;

  -- Cast defensivo: se o texto não corresponder a nenhum valor válido do
  -- enum (ex: campo digitado errado, app desatualizado, ou alguém
  -- manipulando o payload do signup no DevTools), cai em NULL em vez de
  -- estourar exceção e derrubar o cadastro inteiro.
  if v_role_texto is not null and exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = v_role_texto
  ) then
    v_role_solicitado := v_role_texto::public.app_role;
  else
    v_role_solicitado := null;
  end if;

  v_role := case
    when v_convite.id is not null then 'admin_plataforma'::public.app_role
    -- admin_plataforma só nasce via convite; qualquer tentativa de
    -- se autodeclarar admin_plataforma sem convite vira 'colaborador'.
    when v_role_solicitado = 'admin_plataforma' then 'colaborador'::public.app_role
    else coalesce(v_role_solicitado, 'colaborador'::public.app_role)
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

-- ---------- Problema 2: rateio e empresa calculados no servidor ----------

-- Revoga o INSERT direto: a partir de agora, todo agendamento nasce
-- pela função abaixo, nunca por um insert vindo do cliente.
drop policy if exists "agendamentos_insert_colaborador" on core.agendamentos;
revoke insert on core.agendamentos from authenticated;

create or replace function core.criar_agendamento(
  p_psicologo_id uuid,
  p_data_hora timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = core, clinical, corporate, public
as $$
declare
  v_colaborador_id uuid := auth.uid();
  v_empresa_id uuid;
  v_modalidade text;
  v_percentual numeric;
  v_valor_sessao numeric;
  v_valor_empresa numeric;
  v_valor_colaborador numeric;
  v_agendamento_id uuid;
begin
  if not public.current_role_is('colaborador') then
    raise exception 'Apenas colaboradores podem agendar sessões.';
  end if;

  -- Empresa e modalidade vêm do vínculo ativo do colaborador, nunca de
  -- um parâmetro enviado pelo cliente.
  select ce.empresa_id, e.modalidade_financiamento, e.percentual_coparticipacao_empresa
  into v_empresa_id, v_modalidade, v_percentual
  from corporate.colaboradores_elegiveis ce
  join corporate.empresas e on e.id = ce.empresa_id
  where ce.profile_id = v_colaborador_id and ce.ativo = true
  limit 1;

  if v_empresa_id is null then
    raise exception 'Você não está vinculado a nenhuma empresa elegível.';
  end if;

  -- Preço da sessão vem do cadastro real do psicólogo, não de um valor
  -- enviado pelo cliente.
  select valor_sessao into v_valor_sessao
  from clinical.psicologos
  where id = p_psicologo_id
    and perfil_visivel = true
    and status_assinatura = 'ativa'
    and status_verificacao = 'aprovado';

  if v_valor_sessao is null then
    raise exception 'Psicólogo não encontrado ou indisponível para agendamento.';
  end if;

  if v_modalidade = 'integral' then
    v_valor_empresa := v_valor_sessao;
    v_valor_colaborador := 0;
  else
    v_valor_empresa := round(v_valor_sessao * (coalesce(v_percentual, 0) / 100.0), 2);
    v_valor_colaborador := v_valor_sessao - v_valor_empresa;
  end if;

  insert into core.agendamentos (
    psicologo_id, colaborador_profile_id, empresa_id, data_hora,
    valor_sessao, valor_empresa, valor_colaborador
  )
  values (
    p_psicologo_id, v_colaborador_id, v_empresa_id, p_data_hora,
    v_valor_sessao, v_valor_empresa, v_valor_colaborador
  )
  returning id into v_agendamento_id;

  return v_agendamento_id;
exception
  when unique_violation then
    raise exception 'Este horário acabou de ser preenchido por outro colaborador. Escolha outro horário.';
end;
$$;

revoke all on function core.criar_agendamento(uuid, timestamptz) from public;
grant execute on function core.criar_agendamento(uuid, timestamptz) to authenticated;

-- ---------- Problema 3: INSERT direto em colaboradores_elegiveis ignorava as
-- regras da função (checar role = 'colaborador', checar se já pertence a
-- outra empresa). Revoga o INSERT direto: a partir de agora só é possível
-- vincular colaborador pela função adicionar_colaborador_por_email.
-- ---------------------------------------------------------------------------

drop policy if exists "colaboradores_insert_by_empresa_admin" on corporate.colaboradores_elegiveis;
revoke insert on corporate.colaboradores_elegiveis from authenticated;

-- ---------- Problema 4: sequestro silencioso de colaborador entre empresas ----------
-- A função original fazia UPSERT em (profile_id) sem checar se o colaborador
-- já estava ativo em outra empresa, permitindo que um admin de RH realocasse
-- silenciosamente um colaborador de um concorrente só sabendo o e-mail dele.
-- Corrigido: se o colaborador já está ativo em OUTRA empresa, a função recusa
-- e devolve um status específico em vez de mover o vínculo sem consentimento.

create or replace function corporate.adicionar_colaborador_por_email(
  p_empresa_id uuid,
  p_email text
)
returns text
language plpgsql
security definer
set search_path = public, corporate
as $$
declare
  v_profile_id uuid;
  v_role public.app_role;
  v_empresa_atual uuid;
begin
  if not public.is_admin_of_empresa(p_empresa_id) then
    raise exception 'Você não é administrador desta empresa.';
  end if;

  select p.id, p.role into v_profile_id, v_role
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(u.email) = lower(p_email);

  if v_profile_id is null then
    return 'nao_encontrado';
  end if;

  if v_role <> 'colaborador' then
    return 'nao_e_colaborador';
  end if;

  select empresa_id into v_empresa_atual
  from corporate.colaboradores_elegiveis
  where profile_id = v_profile_id and ativo = true;

  if v_empresa_atual is not null and v_empresa_atual <> p_empresa_id then
    -- Não realoca silenciosamente. Um colaborador só troca de empresa
    -- se um admin_plataforma desativar o vínculo antigo primeiro
    -- (ação futura: expor isso como fluxo assistido, com notificação
    -- ao colaborador).
    return 'ja_vinculado_outra_empresa';
  end if;

  insert into corporate.colaboradores_elegiveis (empresa_id, profile_id, ativo)
  values (p_empresa_id, v_profile_id, true)
  on conflict (profile_id) do update set ativo = true, empresa_id = excluded.empresa_id;

  return 'ok';
end;
$$;

revoke all on function corporate.adicionar_colaborador_por_email(uuid, text) from public;
grant execute on function corporate.adicionar_colaborador_por_email(uuid, text) to authenticated;
