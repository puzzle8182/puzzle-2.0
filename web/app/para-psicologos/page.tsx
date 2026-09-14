import Link from 'next/link'
import { Icon } from '@/components/icon'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const TAG = 'mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-sage'

const PASSOS = [
  {
    titulo: 'Monte seu perfil profissional',
    texto: 'CRP, abordagem, bio, áreas de atuação, valor da sessão e sua disponibilidade semanal real.',
  },
  {
    titulo: 'Envie o comprovante do CRP',
    texto: 'Um responsável técnico da plataforma confere sua documentação antes do perfil aparecer na busca dos colaboradores.',
  },
  {
    titulo: 'Apareça para quem já tem o benefício',
    texto: 'Colaboradores de empresas parceiras encontram seu perfil e agendam diretamente nos horários que você abriu.',
  },
  {
    titulo: 'Atenda e registre o prontuário',
    texto: 'Uma nota por sessão, com log de auditoria de acesso. O histórico vira estatística e gráfico consultável ao longo do tempo, sempre interpretado por você.',
  },
  {
    titulo: 'Receba pelo atendimento, pague a mensalidade à parte',
    texto: 'Você é remunerado direto por cada sessão. A mensalidade de R$ 150 é o que mantém seu acesso à rede e às ferramentas, não um desconto sobre o que você recebe.',
  },
]

const BENEFICIOS = [
  {
    icon: 'brain',
    titulo: 'Autonomia clínica sempre com você',
    texto: 'Estatísticas e gráficos organizam o histórico de sessões, mas quem interpreta e decide sobre o acompanhamento é sempre o profissional.',
  },
  {
    icon: 'card',
    titulo: 'Recebimento direto pelo atendimento',
    texto: 'A empresa e o colaborador financiam a sessão conforme o contrato; esse valor chega até você sem intermediação sobre o que fazer com ele.',
  },
  {
    icon: 'shield',
    titulo: 'Prontuário com log de auditoria',
    texto: 'Cada acesso ao registro clínico fica registrado. É a sua ferramenta de trabalho, protegida como tal.',
  },
  {
    icon: 'users',
    titulo: 'Presença numa rede corporativa formada',
    texto: 'A mensalidade dá acesso à rede e à infraestrutura, não é compra de pacientes nem garante volume mínimo. Quem escolhe continua sendo o colaborador.',
  },
]

const FAQ = [
  {
    pergunta: 'Quanto custa e o que essa mensalidade cobre?',
    resposta: 'R$ 150 por mês, pagos por você à plataforma para manter seu perfil ativo, aparecer na busca e usar as ferramentas de agenda e prontuário. Isso é separado do que você recebe pelas sessões, que não sofre nenhum desconto de plataforma.',
  },
  {
    pergunta: 'Preciso ter o CRP verificado para atender?',
    resposta: 'Sim. Você envia o comprovante por upload, e um responsável técnico aprova ou rejeita antes do seu perfil aparecer na busca dos colaboradores. Essa verificação é separada do status da sua assinatura.',
  },
  {
    pergunta: 'A plataforma garante um número mínimo de pacientes?',
    resposta: 'Não. A mensalidade dá acesso à rede e à infraestrutura; quem escolhe o profissional é sempre o colaborador, com base no seu perfil, abordagem e disponibilidade.',
  },
  {
    pergunta: 'Quem decide sobre o conteúdo clínico das minhas anotações?',
    resposta: 'Sempre você. Qualquer estatística ou gráfico gerado a partir do histórico de sessões organiza a informação; a interpretação e a decisão clínica continuam exclusivamente com o profissional.',
  },
]

export default function ParaPsicologosPage() {
  return (
    <div className="bg-paper text-ink">
      <SiteHeader />

      <main>
        <section className="border-b border-border-soft bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className={TAG}>Para psicólogos</p>
            <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl max-w-2xl">
              Presença profissional, demanda corporativa e ferramentas para a prática
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink-soft">
              A mensalidade dá acesso à rede e à infraestrutura; não é compra de pacientes nem
              garante volume mínimo de atendimentos. Quem escolhe o profissional continua sendo o
              colaborador.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/cadastro?perfil=psicologo"
                className="rounded-full bg-pine px-6 py-3 text-sm font-medium text-paper hover:bg-pine-dark transition-colors"
              >
                Criar meu perfil profissional
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
              <h2 className="font-display text-3xl text-ink">Do cadastro ao primeiro atendimento</h2>
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
              <p className={TAG}>Por que atender pela plataforma</p>
              <h2 className="font-display text-3xl text-ink">Ferramentas para a prática, sem abrir mão da autonomia</h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {BENEFICIOS.map((b) => (
                <div key={b.titulo} className="rounded-2xl border border-border-soft bg-paper p-7">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pine/10 text-pine">
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
              <h2 className="font-display text-3xl text-ink">O que psicólogos costumam perguntar</h2>
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
              <h2 className="mt-3 font-display text-3xl">Leve sua prática para a rede</h2>
              <p className="mt-3 max-w-md text-paper/80 leading-7">
                O cadastro leva menos de dois minutos. Depois, é só montar seu perfil e enviar o comprovante do CRP.
              </p>
              <Link
                href="/cadastro?perfil=psicologo"
                className="mt-7 inline-block rounded-full bg-paper px-6 py-3 text-sm font-medium text-pine hover:bg-sage/90 transition-colors"
              >
                Criar meu perfil profissional
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
