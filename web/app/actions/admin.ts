'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function convidarAdminPlataforma(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Você precisa estar logado.' }
  }

  const email = (formData.get('email') as string)?.trim()

  if (!email) {
    return { error: 'Informe um e-mail.' }
  }

  const { error } = await supabase.rpc('convidar_admin_plataforma', {
    p_email: email,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/config')
  return { success: true }
}
