-- ============================================================
-- 0013: Correções de segurança - prontuário inteligente
--
-- Problema 5 (crítico): as policies de clinical.anamneses,
-- clinical.hipoteses_diagnosticas e clinical.intercorrencias só
-- checavam auth.uid() = psicologo_id, sem validar que existe um
-- agendamento real entre aquele psicólogo e aquele colaborador.
-- Qualquer conta com role 'psicologo' podia escrever anamnese,
-- hipótese diagnóstica (CID) ou intercorrência sobre QUALQUER
-- colaborador do sistema, sem nunca ter atendido essa pessoa —
-- bastava saber o UUID do perfil. Corrigido: toda escrita nessas
-- três tabelas agora exige um agendamento não cancelado entre as
-- partes, verificado num helper reutilizável.
--
-- Problema 6 (médio): clinical.autorizacoes_suporte permitia que o
-- próprio psicólogo liberasse, sozinho, o acesso do admin_plataforma
-- a dado clínico sensível de um colaborador — sem consentimento do
-- colaborador e sem trilha de auditoria da concessão em si (só da
-- leitura, via core.registrar_acesso_clinico(), que a aplicação
-- pode ou não chamar). Corrigido: toda criação/alteração de
-- autorização de suporte agora gera um registro automático em
-- core.audit_log, com motivo e prazo de expiração.
-- ============================================================

-- ---------- Problema 5: exigir vínculo real via agendamento ----------

create or replace function clinical.eh_paciente_do_psicologo(
  p_colaborador_profile_id uuid,
  p_psicologo_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = clinical, core
as $$
  select exists (
    select 1 from core.agendamentos a
    where a.colaborador_profile_id = p_colaborador_profile_id
      and a.psicologo_id = p_psicologo_id
      and a.status <> 'cancelado'
  );
$$;

revoke all on function clinical.eh_paciente_do_psicologo(uuid, uuid) from public;
grant execute on function clinical.eh_paciente_do_psicologo(uuid, uuid) to authenticated;

-- ANAMNESES: separa a policy "FOR ALL" em select/insert/update, aplicando
-- a checagem de vínculo só na escrita (leitura de um registro antigo
-- continua liberada mesmo que o agendamento tenha sido cancelado depois).
drop policy if exists "psicologo_gerencia_anamneses_dos_seus_colaboradores" on clinical.anamneses;
drop policy if exists "psicologo_ve_proprias_anamneses" on clinical.anamneses;
drop policy if exists "psicologo_insere_anamnese_de_paciente_real" on clinical.anamneses;
drop policy if exists "psicologo_atualiza_anamnese_de_paciente_real" on clinical.anamneses;

create policy "psicologo_ve_proprias_anamneses"
  on clinical.anamneses for select
  using (auth.uid() = psicologo_id);

create policy "psicologo_insere_anamnese_de_paciente_real"
  on clinical.anamneses for insert
  with check (
    auth.uid() = psicologo_id
    and clinical.eh_paciente_do_psicologo(colaborador_profile_id, psicologo_id)
  );

create policy "psicologo_atualiza_anamnese_de_paciente_real"
  on clinical.anamneses for update
  using (auth.uid() = psicologo_id)
  with check (
    auth.uid() = psicologo_id
    and clinical.eh_paciente_do_psicologo(colaborador_profile_id, psicologo_id)
  );

-- HIPOTESES_DIAGNOSTICAS: só tinha insert (sem update/delete concedido),
-- então basta reforçar a policy de insert.
drop policy if exists "psicologo_insere_hipoteses" on clinical.hipoteses_diagnosticas;
drop policy if exists "psicologo_insere_hipotese_de_paciente_real" on clinical.hipoteses_diagnosticas;

create policy "psicologo_insere_hipotese_de_paciente_real"
  on clinical.hipoteses_diagnosticas for insert
  with check (
    auth.uid() = psicologo_id
    and clinical.eh_paciente_do_psicologo(colaborador_profile_id, psicologo_id)
  );

-- INTERCORRENCIAS: mesmo padrão da anamnese.
drop policy if exists "psicologo_gerencia_intercorrencias_dos_seus_colaboradores" on clinical.intercorrencias;
drop policy if exists "psicologo_ve_proprias_intercorrencias" on clinical.intercorrencias;
drop policy if exists "psicologo_insere_intercorrencia_de_paciente_real" on clinical.intercorrencias;
drop policy if exists "psicologo_atualiza_intercorrencia_de_paciente_real" on clinical.intercorrencias;

create policy "psicologo_ve_proprias_intercorrencias"
  on clinical.intercorrencias for select
  using (auth.uid() = psicologo_id);

create policy "psicologo_insere_intercorrencia_de_paciente_real"
  on clinical.intercorrencias for insert
  with check (
    auth.uid() = psicologo_id
    and clinical.eh_paciente_do_psicologo(colaborador_profile_id, psicologo_id)
  );

create policy "psicologo_atualiza_intercorrencia_de_paciente_real"
  on clinical.intercorrencias for update
  using (auth.uid() = psicologo_id)
  with check (
    auth.uid() = psicologo_id
    and clinical.eh_paciente_do_psicologo(colaborador_profile_id, psicologo_id)
  );

-- ---------- Problema 6: auditoria de autorização de suporte ----------

create or replace function core.log_autorizacao_suporte()
returns trigger
language plpgsql
security definer
set search_path = public, core
as $$
begin
  insert into core.audit_log (actor_profile_id, acao, tabela, registro_id, detalhe)
  values (
    auth.uid(),
    lower(tg_op),
    'clinical.autorizacoes_suporte',
    new.id,
    jsonb_build_object(
      'colaborador_profile_id', new.colaborador_profile_id,
      'motivo', new.motivo,
      'status', new.status,
      'expira_em', new.expira_em,
      'revogada_em', new.revogada_em
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_audit_autorizacoes_suporte on clinical.autorizacoes_suporte;
create trigger trg_audit_autorizacoes_suporte
  after insert or update on clinical.autorizacoes_suporte
  for each row execute function core.log_autorizacao_suporte();

-- Lembrete operacional (não dá pra forçar via RLS): toda vez que o
-- admin_plataforma efetivamente ABRIR um registro liberado por uma
-- autorização de suporte, a aplicação precisa chamar
-- core.registrar_acesso_clinico('clinical.anamneses', <id>) — ou
-- equivalente para hipoteses/intercorrencias — igual já é feito para
-- o prontuário comum. Isso não muda com esta migration; só o
-- registro da CONCESSÃO da autorização passou a ser automático.
