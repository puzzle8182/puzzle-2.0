import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Icon } from '@/components/icon'

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarMesAno(data: Date) {
  const texto = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export default async function IndicadoresPage() {
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

  if (profile?.role !== 'empresa_admin') {
    redirect('/dashboard')
  }

  const { data: vinculo } = await supabase
    .schema('corporate')
    .from('empresa_admins')
    .select('empresa_id')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (!vinculo) {
    redirect('/colaboradores')
  }

  const hoje = new Date()
  const inicioDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const fimDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

  const { data: indicadores, error } = await supabase
    .schema('corporate')
    .rpc('get_indicadores_empresa', {
      target_empresa_id: vinculo.empresa_id,
      competencia_inicio: inicioDoMes.toISOString().slice(0, 10),
      competencia_fim: fimDoMes.toISOString().slice(0, 10),
    })
    .single()

  const dados = error ? null : indicadores

  const cards = [
    {
      icon: 'users',
      label: 'Colaboradores elegíveis',
      valor: dados?.colaboradores_elegiveis ?? 0,
    },
    {
      icon: 'check',
      label: 'Colaboradores ativos',
      valor: dados?.colaboradores_ativos ?? 0,
    },
    {
      icon: 'calendar',
      label: 'Sessões realizadas no mês',
      valor: dados?.sessoes_realizadas ?? 0,
    },
    {
      icon: 'card',
      label: 'Valor total financiado',
      valor: formatarMoeda(Number(dados?.valor_total_financiado ?? 0)),
    },
  ] as const

  const taxaContinuidade = dados?.taxa_continuidade

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Indicadores</h1>
      <p className="text-ink-soft mt-2">{formatarMesAno(hoje)}</p>

      <div className="mt-4 flex items-start gap-3.5 rounded-2xl border border-sage/40 bg-sage/15 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage/25 text-pine">
          <Icon name="shield" width={16} height={16} />
        </span>
        <p className="text-sm text-ink leading-6">
          Estes números são sempre agregados. Nenhuma sessão, valor ou registro
          individual de colaborador é exibido aqui, apenas para o próprio psicólogo.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border-soft bg-white p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-pine/10 text-pine">
              <Icon name={c.icon} width={18} height={18} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{c.label}</p>
            <p className="font-display text-2xl text-ink mt-1.5">{c.valor}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border-soft bg-white p-7">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pine/10 text-pine">
            <Icon name="chart" width={16} height={16} />
          </span>
          <p className="font-medium text-ink">Taxa de continuidade</p>
        </div>

        {taxaContinuidade !== null && taxaContinuidade !== undefined ? (
          <>
            <p className="font-display text-3xl text-ink">{taxaContinuidade}%</p>
            <p className="text-sm text-ink-soft mt-1.5">
              dos colaboradores com sessão no mês fizeram mais de uma sessão.
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-soft leading-6">
            Ainda não há colaboradores suficientes com sessão no mês para calcular
            essa taxa sem risco de identificar alguém individualmente. Ela só aparece
            a partir de 5 colaboradores com sessão no período.
          </p>
        )}
      </div>
    </div>
  )
}
