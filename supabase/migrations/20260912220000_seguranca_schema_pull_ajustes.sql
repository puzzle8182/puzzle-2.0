-- ============================================================
-- 0014: Correções de segurança - schema pull
--
-- Problema 7: o event trigger "ensure_rls" (criado direto no banco,
-- sem migration) só cobria o schema public. As tabelas sensíveis
-- vivem em corporate/clinical/core — exatamente onde esquecer
-- "enable row level security" numa tabela nova seria mais grave.
-- Corrigido: a função agora cobre os 4 schemas.
--
-- Problema 8: pg_net está instalado e em uso legítimo (integração
-- de vídeo com Daily.co, URL fixa, chave vinda do Vault, função
-- security definer com controle de acesso). Por precaução, reforça
-- que ninguém além de postgres/service_role pode chamar net.* direto
-- — só as funções wrapper (core.iniciar_criar_sala etc.) podem.
--
-- Problema 9: convites_admin_plataforma e profiles ganharam
-- GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE para "anon"
-- (resíduo do próprio Supabase, não intencional). TRUNCATE/TRIGGER
-- não têm motivo de existir para "anon" em nenhuma tabela.
-- ============================================================

-- ---------- Problema 7: RLS automático nos 4 schemas ----------

create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path to 'pg_catalog'
as $function$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name in ('public', 'corporate', 'clinical', 'core') then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    else
      raise log 'rls_auto_enable: skip % (schema % fora da lista monitorada)', cmd.object_identity, cmd.schema_name;
    end if;
  end loop;
end;
$function$;

-- ---------- Problema 8: travar execução direta de net.* ----------

revoke all on all functions in schema net from public, anon, authenticated;
grant execute on all functions in schema net to postgres, service_role;

-- ---------- Problema 9: limpar grants residuais de anon ----------

revoke maintain, references, trigger, truncate on table public.convites_admin_plataforma from anon;
revoke maintain, references, trigger, truncate on table public.profiles from anon;
