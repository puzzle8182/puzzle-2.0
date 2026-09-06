import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Icon } from '@/components/icon'

const MODALIDADE_LABEL: Record<string, string> = {
  integral: 'Custeio integral',
  coparticipacao: 'Coparticipação',
}

export default async function AdminEmpresasPage() {
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

  if (profile?.role !== 'admin_plataforma') {
    redirect('/dashboard')
  }

  const { data: empresas } = await supabase
    .schema('corporate')
    .from('empresas')
    .select('id, nome, cnpj, modalidade_financiamento, created_at')
    .order('created_at', { ascending: false })

  const empresaIds = (empresas ?? []).map((e) => e.id)

  let colaboradoresPorEmpresa: Record<string, number> = {}
  if (empresaIds.length > 0) {
    const { data: colaboradores } = await supabase
      .schema('corporate')
      .from('colaboradores_elegiveis')
      .select('empresa_id')
      .in('empresa_id', empresaIds)

    colaboradoresPorEmpresa = (colaboradores ?? []).reduce<Record<string, number>>((acc, c) => {
      acc[c.empresa_id] = (acc[c.empresa_id] ?? 0) + 1
      return acc
    }, {})
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Empresas</h1>
      <p className="text-ink-soft mt-2">Todas as empresas cadastradas na plataforma.</p>

      {(!empresas || empresas.length === 0) && (
        <p className="text-ink-soft text-sm mt-6">Nenhuma empresa cadastrada ainda.</p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {empresas?.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border-soft bg-white px-6 py-5"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pine/10 text-pine">
                <Icon name="building" width={18} height={18} />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{e.nome}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  CNPJ {e.cnpj} · {MODALIDADE_LABEL[e.modalidade_financiamento] ?? e.modalidade_financiamento}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-paper border border-border-soft px-3 py-1 text-xs text-ink-soft shrink-0">
              <Icon name="users" width={12} height={12} />
              {colaboradoresPorEmpresa[e.id] ?? 0} colaboradores
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
