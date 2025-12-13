'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const username = formData.get('username') as string

  // Kullanıcı adı boş mu kontrol et
  if (error) {
    console.error(error)
    // Hata nesnesi döndürmek yerine redirect ile sayfayı yeniliyoruz
    return redirect('/settings?error=true')
  }

  // Veritabanını güncelle
  const { error } = await supabase
    .from('profiles')
    .update({ username: username })
    .eq('id', user.id)

  if (error) {
    // Genelde "username already exists" hatası olur (veritabanında unique yapmıştık)
    return { error: "Bu kullanıcı adı alınmış." }
  }

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  redirect('/dashboard') // İş bitince dashboarda dön
}