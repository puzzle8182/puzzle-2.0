import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'

const ROLE_LINKS = [
  { href: '/para-empresas', label: 'Empresa' },
  { href: '/para-psicologos', label: 'Psicólogo' },
  { href: '/para-colaboradores', label: 'Colaborador' },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark size={28} tone="dark" />
          <span className="h-6 w-px bg-border-soft" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/puzzle-logo.webp" alt="Puzzle" className="h-7 w-auto" />
          <span className="font-display text-lg text-ink">Plataforma Puzzle</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-ink-soft lg:flex">
          <Link href="/#como-funciona" className="hover:text-ink transition-colors">
            Como funciona
          </Link>
          <Link href="/#para-quem" className="hover:text-ink transition-colors">
            Para quem
          </Link>
          <Link href="/#privacidade" className="hover:text-ink transition-colors">
            Privacidade
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            {ROLE_LINKS.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:bg-sage/15 hover:text-ink transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>
          <Link
            href="/cadastro"
            className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-paper hover:bg-pine-dark transition-colors"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </header>
  )
}
