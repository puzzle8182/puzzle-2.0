import Link from 'next/link'
import { Icon } from '@/components/icon'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const TAG = 'mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-sage'

const PASSOS = [
  {
    titulo: 'Escolha a modalidade de financiamento',
    texto: 'Custeio integral, em que a empresa paga a sessão inteira, ou coparticipação, com um valor dividido entre empresa e colaborador.',
  },
  {
    titulo: 'Cadastre os colaboradores elegíveis',
    texto: 'Adicione por e-mail quem tem direito ao benefício. Cada um recebe acesso próprio para escolher o profissional e agendar.',
  },
  {
    titulo: 'A rede já está formada',
    texto: 'Psicólogos verificados, com CRP conferido por um responsável técnico antes de aparecerem na busca, prontos para atender.',
  },
  {
    titulo: 'Acompanhe indicadores agregados',
    texto: 'Uso e investimento do benefício, sempre em grupo, nunca por pessoa. Nenhuma consulta retorna dado individual.',
  },
]

const BENEFICIOS = [
  {
    icon: 'shield',
    titulo: 'Sigilo garantido por arquitetura',
    texto: 'Dados clínicos e corporativos vivem em schemas de banco de dados separados, com Row Level Security. Não é uma regra da aplicação que pode falhar, é a estrutura do banco.',
  },
  {
    icon: 'chart',
    titulo: 'Indicadores com proteção de grupo mínimo',
    texto: 'A única função que expõe dado agregado à empresa embute um limite mínimo de 5 colaboradores diretamente na consulta SQL, para impedir reidentificação em grupos pequenos.',
  },
  {
    icon: 'card',
    titulo: 'Duas modalidades, um único contrato',
    texto: 'Defina se o benefício é integral ou por coparticipação uma vez, e o rateio de cada sessão é calculado automaticamente a partir daí.',
  },
  {
    icon: 'building',
    titulo: 'Gestão de colaboradores sem planilha',
    texto: 'Adicione ou remova elegibilidade por e-mail, veja status de cada colaborador e mantenha a lista sempre atualizada dentro da própria plataforma.',
  },
]

const FAQ = [
  {
    pergunta: 'A empresa vê quem está fazendo terapia ou o que é conversado em sessão?',
    resposta: 'Não. O acesso da empresa é limitado a dados administrativos e financeiros no schema corporativo. Prontuário, notas de sessão e objetivos terapêuticos ficam em um schema clínico separado, sem nenhuma policy de acesso para o papel de administrador de empresa.',
  },
  {
    pergunta: 'Como funciona o rateio quando é coparticipação?',
    resposta: 'A modalidade contratada define o percentual dividido entre empresa e colaborador. O cálculo é automático a cada agendamento, sem planilha ou conferência manual.',
  },
  {
    pergunta: 'Preciso montar minha própria rede de psicólogos?',
    resposta: 'Não. A rede já é formada por profissionais independentes verificados. Os colaboradores escolhem livremente entre eles, e a empresa não interfere nessa escolha.',
  },
  {
    pergunta: 'Consigo ver quantas sessões foram usadas ou quanto foi investido?',
    resposta: 'Sim, sempre em indicadores agregados e anônimos, com um número mínimo de colaboradores por consulta para proteger a identidade de cada pessoa.',
  },
]

export default function ParaEmpresasPage() {
  return (
    <div className="bg-paper text-ink">
      <SiteHeader />

      <main>
        <section className="border-b border-border-soft bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className={TAG}>Para empresas</p>
            <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl max-w-2xl">
              Um benefício de saúde mental sem montar a operação sozinha
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink-soft">
              A empresa entra com o financiamento, integral ou por coparticipação, e acompanha
              indicadores agregados de uso e investimento. O que acontece dentro da terapia nunca
              chega ao ambiente corporativo, isso é garantido a nível de banco de dados, não apenas
              por regra de negócio.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/cadastro?perfil=empresa_admin"
                className="rounded-full bg-pine px-6 py-3 text-sm font-medium text-paper hover:bg-pine-dark transition-colors"
              >
                Cadastrar minha empresa
              </Link>
              <Link
                href="/#para-quem"
                className="flex items-center gap-1.5 text-sm font-medium text-pine hover:underline"
              >
                Ver os três lados da plataforma
                <Icon name="arrow-right" width={16} height={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-border-soft">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-lg">
              <p className={TAG}>Como funciona</p>
              <h2 className="font-display text-3xl text-ink">Do contrato ao primeiro acompanhamento</h2>
            </div>

            <div className="mt-12 rounded-2xl border border-border-soft bg-white px-6 sm:px-8">
              <ol className="flex flex-col divide-y divide-border-soft">
                {PASSOS.map((passo, i) => (
                  <li key={passo.titulo} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-baseline sm:gap-8">
                    <span className="font-display text-2xl text-sage shrink-0 sm:w-10">{i + 1}</span>
                    <div>
                      <h3 className="text-ink font-medium">{passo.titulo}</h3>
                      <p className="mt-1.5 max-w-2xl text-[15px] leading-7 text-ink-soft">{passo.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-b border-border-soft bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-lg">
              <p className={TAG}>Por que empresas escolhem a plataforma</p>
              <h2 className="font-display text-3xl text-ink">Feito para tirar a operação das suas mãos</h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {BENEFICIOS.map((b) => (
                <div key={b.titulo} className="rounded-2xl border border-border-soft bg-paper p-7">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber/10 text-pine">
                    <Icon name={b.icon} width={22} height={22} />
                  </div>
                  <h3 className="font-display text-lg text-ink">{b.titulo}</h3>
                  <p className="mt-2.5 text-[15px] leading-7 text-ink-soft">{b.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border-soft">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-lg">
              <p className={TAG}>Perguntas frequentes</p>
              <h2 className="font-display text-3xl text-ink">O que empresas costumam perguntar</h2>
            </div>

            <div className="mt-12 flex flex-col divide-y divide-border-soft rounded-2xl border border-border-soft bg-white px-6 sm:px-8">
              {FAQ.map((f) => (
                <div key={f.pergunta} className="py-6">
                  <h3 className="font-medium text-ink">{f.pergunta}</h3>
                  <p className="mt-2 max-w-2xl text-[15px] leading-7 text-ink-soft">{f.resposta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="rounded-2xl bg-pine-dark px-8 py-12 text-paper sm:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">Comece agora</p>
              <h2 className="mt-3 font-display text-3xl">Leve o benefício para sua empresa</h2>
              <p className="mt-3 max-w-md text-paper/80 leading-7">
                O cadastro leva menos de dois minutos e você já pode começar a adicionar colaboradores elegíveis.
              </p>
              <Link
                href="/cadastro?perfil=empresa_admin"
                className="mt-7 inline-block rounded-full bg-paper px-6 py-3 text-sm font-medium text-pine hover:bg-sage/90 transition-colors"
              >
                Cadastrar minha empresa
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
