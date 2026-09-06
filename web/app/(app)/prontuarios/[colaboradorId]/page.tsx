import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { NotaSessaoForm } from '@/components/nota-sessao-form'
import { ObjetivosTerapeuticos } from '@/components/objetivos-terapeuticos'
import { AnamneseForm } from '@/components/anamnese-form'
import { Icon } from '@/components/icon'

const STATUS_STYLE: Record<string, string> = {
  realizado: 'bg-sage/20 text-pine',
  agendado: 'bg-amber/15 text-amber',
  cancelado: 'bg-paper text-ink-soft border border-border-soft',
}

const GRAVIDADE_STYLE: Record<string, string> = {
  leve: 'bg-paper text-ink-soft border border-border-soft',
  moderada: 'bg-amber/15 text-amber',
  grave: 'bg-red-50 text-red-700',
}

const OBJETIVO_STATUS_STYLE: Record<string, string> = {
  ativo: 'bg-sage/20 text-pine',
  concluido: 'bg-pine text-paper',
  pausado: 'bg-paper border border-border-soft text-ink-soft',
}

type EventoTimeline = {
  data: Date
  icone: string
  titulo: string
  descricao?: string | null
  badge?: { texto: string; classe: string }
}

export default async function ProntuarioPacientePage({
  params,
}: {
  params: Promise<{ colaboradorId: string }>
}) {
  const { colaboradorId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'psicologo') {
    redirect('/dashboard')
  }

  const { data: paciente } = await supabase
    .from('profiles')
    .select('id, full_name, email, foto_url')
    .eq('id', colaboradorId)
    .single()

  if (!paciente) notFound()

  const { data: agendamentos } = await supabase
    .schema('core')
    .from('agendamentos')
    .select('id, data_hora, status')
    .eq('psicologo_id', user.id)
    .eq('colaborador_profile_id', colaboradorId)
    .order('data_hora', { ascending: false })

  if (!agendamentos || agendamentos.length === 0) notFound()

  const agendamentoIds = agendamentos.map((a) => a.id)

  const [
    { data: notas },
    { data: objetivos },
    { data: anamnese },
    { data: hipoteses },
    { data: intercorrencias },
  ] = await Promise.all([
    supabase
      .schema('clinical')
      .from('notas_sessao')
      .select('id, agendamento_id, conteudo, criado_em')
      .in('agendamento_id', agendamentoIds),
    supabase
      .schema('clinical')
      .from('objetivos_terapeuticos')
      .select('id, descricao, status, criado_em')
      .eq('psicologo_id', user.id)
      .eq('colaborador_profile_id', colaboradorId)
      .order('criado_em', { ascending: true }),
    supabase
      .schema('clinical')
      .from('anamneses')
      .select(
        'data_nascimento, telefone, estado_civil, profissao, queixa_principal, historia_clinica, historia_familiar, historia_laboral, rede_apoio, objetivos_terapeuticos, intercorrencias_iniciais, criado_em'
      )
      .eq('psicologo_id', user.id)
      .eq('colaborador_profile_id', colaboradorId)
      .maybeSingle(),
    supabase
      .schema('clinical')
      .from('hipoteses_diagnosticas')
      .select('id, cid, descricao, ativa, criado_em')
      .eq('psicologo_id', user.id)
      .eq('colaborador_profile_id', colaboradorId),
    supabase
      .schema('clinical')
      .from('intercorrencias')
      .select('id, data, descricao, gravidade')
      .eq('psicologo_id', user.id)
      .eq('colaborador_profile_id', colaboradorId),
  ])

  const notaPorAgendamento = Object.fromEntries(
    (notas ?? []).map((n) => [n.agendamento_id, n])
  )

  const sessoesRealizadas = agendamentos.filter((a) => a.status === 'realizado').length

  // Log de auditoria: registra que este psicólogo acessou o prontuário
  // deste paciente. Não bloqueia a página se falhar por algum motivo.
  await supabase.schema('core').rpc('registrar_acesso_clinico', {
    p_tabela: 'clinical.notas_sessao',
    p_registro_id: colaboradorId,
  })

  // Linha do tempo: junta anamnese, hipóteses diagnósticas, intercorrências,
  // notas de sessão e objetivos terapêuticos numa única lista cronológica,
  // já que hoje cada um aparece só na sua própria seção da página.
  const timeline: EventoTimeline[] = []

  if (anamnese) {
    timeline.push({
      data: new Date(anamnese.criado_em),
      icone: 'file',
      titulo: 'Anamnese registrada',
      descricao: anamnese.queixa_principal,
    })
  }

  for (const h of hipoteses ?? []) {
    timeline.push({
      data: new Date(h.criado_em),
      icone: 'brain',
      titulo: h.cid ? `Hipótese diagnóstica (${h.cid})` : 'Hipótese diagnóstica',
      descricao: h.descricao,
      badge: h.ativa ? undefined : { texto: 'substituída', classe: GRAVIDADE_STYLE.leve },
    })
  }

  for (const i of intercorrencias ?? []) {
    timeline.push({
      data: new Date(i.data),
      icone: 'shield',
      titulo: 'Intercorrência',
      descricao: i.descricao,
      badge: { texto: i.gravidade, classe: GRAVIDADE_STYLE[i.gravidade] ?? GRAVIDADE_STYLE.leve },
    })
  }

  for (const a of agendamentos) {
    const nota = notaPorAgendamento[a.id]
    if (!nota) continue
    timeline.push({
      data: new Date(a.data_hora),
      icone: 'calendar',
      titulo: 'Sessão registrada',
      descricao: nota.conteudo,
    })
  }

  for (const o of objetivos ?? []) {
    timeline.push({
      data: new Date(o.criado_em),
      icone: 'chart',
      titulo: o.descricao,
      badge: {
        texto: o.status,
        classe: OBJETIVO_STATUS_STYLE[o.status] ?? GRAVIDADE_STYLE.leve,
      },
    })
  }

  timeline.sort((a, b) => b.data.getTime() - a.data.getTime())

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border border-border-soft bg-white p-7">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border-soft bg-sage/20">
            {paciente.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={paciente.foto_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-xl text-pine">
                {(paciente.full_name ?? '?').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink">{paciente.full_name ?? 'Paciente'}</h1>
            <p className="text-ink-soft text-sm">{paciente.email}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-paper border border-border-soft px-3 py-1 text-xs text-ink-soft">
            <Icon name="calendar" width={12} height={12} />
            {agendamentos.length} sessões agendadas
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-sage/20 px-3 py-1 text-xs text-pine">
            <Icon name="check" width={12} height={12} />
            {sessoesRealizadas} realizadas
          </span>
        </div>
      </div>

      {timeline.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border-soft bg-white p-7">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pine/10 text-pine">
              <Icon name="clock" width={16} height={16} />
            </span>
            <h2 className="font-medium text-ink">Linha do tempo</h2>
          </div>

          <div className="flex flex-col">
            {timeline.map((evento, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage/20 text-pine">
                    <Icon name={evento.icone} width={14} height={14} />
                  </span>
                  {i < timeline.length - 1 && <span className="w-px flex-1 bg-border-soft my-1" />}
                </div>
                <div className={i < timeline.length - 1 ? 'pb-6' : ''}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink">{evento.titulo}</p>
                    {evento.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${evento.badge.classe}`}>
                        {evento.badge.texto}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {evento.data.toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
                  </p>
                  {evento.descricao && (
                    <p className="text-sm text-ink-soft mt-1.5 line-clamp-2">{evento.descricao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border-soft bg-white p-7">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pine/10 text-pine">
            <Icon name="file" width={16} height={16} />
          </span>
          <h2 className="font-medium text-ink">Anamnese</h2>
        </div>
        <AnamneseForm colaboradorProfileId={colaboradorId} anamnese={anamnese ?? null} />
      </div>

      <div className="mt-6 rounded-2xl border border-border-soft bg-white p-7">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pine/10 text-pine">
            <Icon name="chart" width={16} height={16} />
          </span>
          <h2 className="font-medium text-ink">Objetivos terapêuticos</h2>
        </div>
        <ObjetivosTerapeuticos
          colaboradorProfileId={colaboradorId}
          objetivos={objetivos ?? []}
        />
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {agendamentos.map((a) => {
          const nota = notaPorAgendamento[a.id]
          return (
            <div key={a.id} className="rounded-2xl border border-border-soft bg-white p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine/10 text-pine">
                    <Icon name="calendar" width={14} height={14} />
                  </span>
                  <p className="text-sm font-medium text-ink">
                    {new Date(a.data_hora).toLocaleString('pt-BR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${
                    STATUS_STYLE[a.status] ?? 'bg-paper text-ink-soft border border-border-soft'
                  }`}
                >
                  {a.status}
                </span>
              </div>
              <NotaSessaoForm
                agendamentoId={a.id}
                colaboradorProfileId={colaboradorId}
                conteudoInicial={nota?.conteudo ?? ''}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
