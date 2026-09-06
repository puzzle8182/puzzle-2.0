import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Icon } from '@/components/icon'

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Paga',
  atrasado: 'Atrasada',
}

const STATUS_STYLE: Record<string, string> = {
  pendente: 'bg-amber/15 text-amber',
  pago: 'bg-sage/20 text-pine',
  atrasado: 'bg-red-50 text-red-700',
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarCompetencia(data: string) {
  const texto = new Date(data).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export default async function FaturasPage() {
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

  const { data: contratos } = await supabase
    .schema('corporate')
    .from('contratos')
    .select('id, valor_mensal, status, data_inicio, data_fim')
    .eq('empresa_id', vinculo.empresa_id)
    .order('data_inicio', { ascending: false })

  const contratoIds = (contratos ?? []).map((c) => c.id)

  let faturas: {
    id: string
    contrato_id: string
    competencia: string
    valor: number
    status: string
    pago_em: string | null
  }[] = []

  if (contratoIds.length > 0) {
    const { data } = await supabase
      .schema('corporate')
      .from('faturas')
      .select('id, contrato_id, competencia, valor, status, pago_em')
      .in('contrato_id', contratoIds)
      .order('competencia', { ascending: false })
    faturas = data ?? []
  }

  const contratoAtivo = (contratos ?? []).find((c) => c.status === 'ativo')

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Faturas</h1>
      <p className="text-ink-soft mt-2">Cobrança do contrato do benefício, por competência.</p>

      {!contratoAtivo && (
        <div className="mt-6 flex items-start gap-3.5 rounded-2xl border border-amber/30 bg-amber/10 px-6 py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/20 text-amber">
            <Icon name="card" width={18} height={18} />
          </span>
          <p className="text-sm text-ink leading-6">
            Sua empresa ainda não tem um contrato de faturamento ativo. As faturas
            aparecem aqui assim que o contrato for configurado com a plataforma.
          </p>
        </div>
      )}

      {contratoAtivo && (
        <div className="mt-6 rounded-2xl border border-border-soft bg-white p-6">
          <p className="text-xs text-ink-soft">Valor mensal do contrato</p>
          <p className="font-display text-2xl text-ink mt-1">
            {formatarMoeda(Number(contratoAtivo.valor_mensal))}
          </p>
        </div>
      )}

      <h2 className="font-medium text-ink mt-10 mb-4">Histórico de faturas</h2>

      {faturas.length === 0 && (
        <p className="text-ink-soft text-sm">Nenhuma fatura emitida ainda.</p>
      )}

      <div className="flex flex-col gap-3">
        {faturas.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border-soft bg-white px-6 py-4"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pine/10 text-pine">
                <Icon name="card" width={16} height={16} />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{formatarCompetencia(f.competencia)}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  {formatarMoeda(Number(f.valor))}
                  {f.pago_em &&
                    ` · paga em ${new Date(f.pago_em).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${
                STATUS_STYLE[f.status] ?? 'bg-paper text-ink-soft border border-border-soft'
              }`}
            >
              {STATUS_LABEL[f.status] ?? f.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
