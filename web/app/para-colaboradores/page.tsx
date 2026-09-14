import Link from 'next/link'
import { Icon } from '@/components/icon'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const TAG = 'mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-sage'

const PASSOS = [
  {
    titulo: 'Busque por abordagem, formação e valor',
    texto: 'Conheça o perfil de cada psicólogo da rede antes de decidir. A escolha é sempre sua, do início ao fim.',
  },
  {
    titulo: 'Agende dentro da agenda real do profissional',
    texto: 'O sistema só libera horários que o psicólogo de fato tem disponíveis, sem risco de marcar algo que depois não existe.',
  },
  {
    titulo: 'O rateio é calculado automaticamente',
    texto: 'Se sua empresa oferece coparticipação, sua parte já aparece calculada no momento do agendamento.',
  },
  {
    titulo: 'A sessão acontece com sigilo garantido',
    texto: 'O que é conversado fica em um schema clínico ao qual sua empresa nunca tem acesso, nem no banco de dados.',
  },
]

const BENEFICIOS = [
  {
    icon: 'search',
    titulo: 'Escolha livre, sempre',
    texto: 'A empresa participa do custo, mas não interfere em qual profissional você escolhe nem no que é conversado em sessão.',
  },
  {
    icon: 'card',
    titulo: 'Custo menor no seu bolso',
    texto: 'A participação da empresa reduz o valor da sessão conforme a modalidade contratada, sem burocracia para você usar.',
  },
  {
    icon: 'lock',
    titulo: 'Sigilo garantido por arquitetura',
    texto: 'Dados clínicos e corporativos vivem separados fisicamente no banco de dados. Não é uma promessa, é a estrutura do sistema.',
  },
  {
    icon: 'clock',
    titulo: 'Liberdade para trocar quando quiser',
    texto: 'Se a relação terapêutica não for a que você esperava, você pode buscar outro profissional na rede a qualquer momento.',
  },
]

const FAQ = [
  {
    pergunta: 'Minha empresa consegue ver que estou em terapia ou o conteúdo das sessões?',
    resposta: 'Não. A empresa só acessa indicadores agregados e anônimos, com um número mínimo de colaboradores por consulta. Nenhuma policy de acesso do banco de dados permite que o papel de administrador de empresa veja prontuário ou nota de sessão.',
  },
  {
    pergunta: 'Eu pago alguma coisa além do valor da sessão?',
    resposta: 'Não. A mensalidade de R$ 150 é paga pelo psicólogo à plataforma, para manter seu perfil e acessar as ferramentas profissionais. Isso nunca é repassado a você.',
  },
  {
    pergunta: 'Posso escolher qualquer psicólogo da rede?',
    resposta: 'Sim, contanto que o horário desejado esteja dentro da disponibilidade real que o profissional cadastrou.',
  },
  {
    pergunta: 'O que acontece se eu quiser trocar de psicólogo no meio do acompanhamento?',
    resposta: 'Você pode buscar e agendar com outro profissional da rede quando quiser, sem precisar justificar a troca para ninguém.',
  },
]

export default function ParaColaboradoresPage() {
  return (
    <div className="bg-paper text-ink">
      <SiteHeader />

      <main>
        <section className="border-b border-border-soft bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className={TAG}>Para colaboradores</p>
            <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl max-w-2xl">
              Você escolhe o profissional. A empresa participa do custo.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink-soft">
              A participação financeira da empresa reduz o valor que sai do seu bolso, mas não
              interfere em quem você escolhe nem no que é conversado em sessão. A empresa financia
              o acesso, não a relação terapêutica.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/cadastro?perfil=colaborador"
                className="rounded-full bg-pine px-6 py-3 text-sm font-medium text-paper hover:bg-pine-dark transition-colors"
              >
                Criar minha conta
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
              <h2 className="font-display text-3xl text-ink">Da busca até a sessão</h2>
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
              <p className={TAG}>Por que usar o benefício por aqui</p>
              <h2 className="font-display text-3xl text-ink">Sua escolha, sua sessão, seu sigilo</h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {BENEFICIOS.map((b) => (
                <div key={b.titulo} className="rounded-2xl border border-border-soft bg-paper p-7">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sage/20 text-pine">
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
              <h2 className="font-display text-3xl text-ink">O que colaboradores costumam perguntar</h2>
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
              <h2 className="mt-3 font-display text-3xl">Use o benefício da sua empresa</h2>
              <p className="mt-3 max-w-md text-paper/80 leading-7">
                O cadastro leva menos de dois minutos e você já pode buscar um psicólogo da rede.
              </p>
              <Link
                href="/cadastro?perfil=colaborador"
                className="mt-7 inline-block rounded-full bg-paper px-6 py-3 text-sm font-medium text-pine hover:bg-sage/90 transition-colors"
              >
                Criar minha conta
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
