'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Icon } from '@/components/icon'

async function aguardarResultado(
  supabase: ReturnType<typeof createClient>,
  fnNome: 'checar_criar_sala' | 'checar_criar_token',
  args: Record<string, unknown>
): Promise<string> {
  for (let tentativa = 0; tentativa < 25; tentativa++) {
    const { data, error } = await supabase.schema('core').rpc(fnNome, args)
    if (error) throw error
    if (data) return data as string
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('A sala está demorando demais para ficar pronta. Tente novamente em instantes.')
}

export default function SalaVideoPage() {
  const params = useParams<{ agendamentoId: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [status, setStatus] = useState('Preparando sua sala...')
  const [erro, setErro] = useState<string | null>(null)
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      try {
        const { data: urlExistente, error: erroObter } = await supabase
          .schema('core')
          .rpc('obter_sala_video', { p_agendamento_id: params.agendamentoId })
        if (erroObter) throw erroObter

        let roomUrl = urlExistente as string | null

        if (!roomUrl) {
          setStatus('Criando sua sala...')
          const { data: requestId, error: erroIniciar } = await supabase
            .schema('core')
            .rpc('iniciar_criar_sala', { p_agendamento_id: params.agendamentoId })
          if (erroIniciar) throw erroIniciar

          roomUrl = await aguardarResultado(supabase, 'checar_criar_sala', {
            p_agendamento_id: params.agendamentoId,
            p_request_id: requestId,
          })
        }

        if (cancelado) return

        setStatus('Liberando seu acesso...')
        const { data: tokenRequestId, error: erroToken } = await supabase
          .schema('core')
          .rpc('iniciar_criar_token', { p_agendamento_id: params.agendamentoId })
        if (erroToken) throw erroToken

        const token = await aguardarResultado(supabase, 'checar_criar_token', {
          p_request_id: tokenRequestId,
        })

        if (cancelado) return

        setIframeSrc(`${roomUrl}?t=${token}`)
      } catch (e) {
        if (!cancelado) {
          setErro(e instanceof Error ? e.message : 'Não foi possível entrar nesta sessão.')
        }
      }
    }

    init()
    return () => {
      cancelado = true
    }
  }, [params.agendamentoId, router, supabase])

  return (
    <div className="flex h-screen flex-col bg-ink">
      <div className="flex items-center justify-between px-5 py-3 bg-pine-dark">
        <span className="text-sm font-medium text-paper">Sessão de vídeo</span>
        <button
          onClick={() => router.push('/agendamentos')}
          className="flex items-center gap-1.5 text-xs text-paper/60 hover:text-paper transition-colors"
        >
          <Icon name="arrow-right" width={12} height={12} className="rotate-180" />
          Sair da sessão
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center relative">
        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="h-full w-full border-0"
          />
        ) : erro ? (
          <div className="max-w-sm text-center px-6">
            <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
              <Icon name="shield" width={18} height={18} />
            </span>
            <p className="text-red-400 text-sm leading-6">{erro}</p>
            <button
              onClick={() => router.push('/agendamentos')}
              className="inline-block mt-5 rounded-lg bg-pine px-5 py-2.5 text-sm font-medium text-paper hover:bg-pine-dark transition-colors"
            >
              Voltar
            </button>
          </div>
        ) : (
          <div className="text-center text-paper/60">
            <div className="h-8 w-8 mx-auto mb-4 rounded-full border-[3px] border-white/15 border-t-sage animate-spin" />
            <p>{status}</p>
          </div>
        )}
      </div>
    </div>
  )
}