'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateUsername(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const username = formData.get('username') as string

  // Username kaydet
  const { error } = await supabase
    .from('profiles')
    .update({ username: username })
    .eq('id', user.id)

  if (error) {
    console.log(error)
    return // Hata yönetimi eklenebilir
  }

  // Başarılıysa Dashboard'a fırlat
  redirect('/dashboard')
}