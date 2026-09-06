'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { convidarAdminPlataforma } from '@/app/actions/admin'

export function ConvidarAdminForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  function handleSubmit(formData: FormData) {
    setError(null)
    setSucesso(false)

    startTransition(async () => {
      const result = await convidarAdminPlataforma(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      setSucesso(true)
      formRef.current?.reset()
      router.refresh()
    })
  }

  return (
    <div className="max-w-md">
      <form ref={formRef} action={handleSubmit} className="flex gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="email@responsavel.com"
          className="flex-1 rounded-lg border border-border-soft bg-paper px-3.5 py-2.5 text-ink outline-none focus:ring-2 focus:ring-sage"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-pine text-paper px-4 py-2.5 font-medium hover:bg-pine-dark transition-colors disabled:opacity-60 shrink-0"
        >
          {isPending ? 'Convidando...' : 'Convidar'}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-700 bg-red-50 rounded-lg px-3.5 py-2.5">
          {error}
        </p>
      )}
      {sucesso && (
        <p className="mt-3 text-sm text-amber bg-amber/10 rounded-lg px-3.5 py-2.5">
          Convite registrado. Assim que essa pessoa se cadastrar com esse
          e-mail (com qualquer papel escolhido no formulário), a conta já
          nasce como administrador da plataforma.
        </p>
      )}
    </div>
  )
}
