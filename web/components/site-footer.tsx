import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-6 py-14 text-center">
        <div className="mb-3 flex items-center justify-center gap-3">
          <BrandMark size={24} tone="light" />
          <span className="h-5 w-px bg-paper/20" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/puzzle-logo.webp" alt="Puzzle" className="h-6 w-auto" />
          <span className="font-display text-lg">Plataforma Puzzle</span>
        </div>
        <p className="text-sm text-paper/50">Autonomia clínica sempre com o psicólogo.</p>
        <p className="text-sm text-paper/50">Conformidade com a LGPD e as normas do CFP/CRP.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-paper/70">
          <Link href="/para-empresas" className="hover:text-paper transition-colors">Para empresas</Link>
          <Link href="/para-colaboradores" className="hover:text-paper transition-colors">Para colaboradores</Link>
          <Link href="/para-psicologos" className="hover:text-paper transition-colors">Para psicólogos</Link>
          <Link href="/login" className="hover:text-paper transition-colors">Entrar</Link>
          <Link href="/cadastro" className="hover:text-paper transition-colors">Cadastre-se</Link>
        </div>
      </div>
    </footer>
  )
}
