import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ConvidarAdminForm } from '@/components/convidar-admin-form'
import { Icon } from '@/components/icon'

export default async function AdminConfigPage() {
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

  const { data: convites } = await supabase
    .from('convites_admin_plataforma')
    .select('id, email, aceito, criado_em, aceito_em, convidado_por')
    .order('criado_em', { ascending: false })

  const convidadoPorIds = [...new Set((convites ?? []).map((c) => c.convidado_por))]

  let nomePorId: Record<string, string> = {}
  if (convidadoPorIds.length > 0) {
    const { data: perfis } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', convidadoPorIds)
    nomePorId = Object.fromEntries(
      (perfis ?? []).map((p) => [p.id, p.full_name ?? p.email ?? 'Alguém'])
    )
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Configurações</h1>
      <p className="text-ink-soft mt-2">Gerencie quem tem acesso de administrador da plataforma.</p>

      <div className="mt-8 rounded-2xl border border-border-soft bg-white p-7">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-pine/10 text-pine">
            <Icon name="shield" width={16} height={16} />
          </span>
          <h2 className="font-medium text-ink">Convidar administrador</h2>
        </div>
        <p className="text-sm text-ink-soft mb-4">
          A pessoa não precisa ter conta ainda. Quando ela se cadastrar com esse
          e-mail, a conta já nasce com acesso de administrador da plataforma,
          sem precisar de nenhum ajuste manual no banco.
        </p>
        <ConvidarAdminForm />
      </div>

      <h2 className="font-medium text-ink mt-10 mb-4">
        Convites enviados ({convites?.length ?? 0})
      </h2>

      {(!convites || convites.length === 0) && (
        <p className="text-ink-soft text-sm">Nenhum convite enviado ainda.</p>
      )}

      <div className="flex flex-col gap-3">
        {convites?.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border-soft bg-white px-6 py-4"
          >
            <div>
              <p className="text-sm font-medium text-ink">{c.email}</p>
              <p className="text-xs text-ink-soft mt-0.5">
                Convidado por {nomePorId[c.convidado_por] ?? 'alguém'} em{' '}
                {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                {c.aceito_em &&
                  ` · aceito em ${new Date(c.aceito_em).toLocaleDateString('pt-BR')}`}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${
                c.aceito
                  ? 'bg-sage/20 text-pine'
                  : 'bg-amber/15 text-amber'
              }`}
            >
              {c.aceito ? 'Aceito' : 'Aguardando cadastro'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
