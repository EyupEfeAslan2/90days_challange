'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function joinChallenge(formData: FormData) {
  const supabase = await createClient()

  // 1. Kullanıcıyı bul
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return redirect('/login')
  }

  const challenge_id = formData.get('challenge_id') as string

  // 2. Veritabanına kaydet: "Bu kullanıcı bu yarışmaya katıldı"
  const { error } = await supabase
    .from('user_challenges')
    .insert({
      user_id: user.id,
      challenge_id: challenge_id
    })

  if (error) {
    console.error('Katılma hatası:', error)
    // Hata varsa bile şimdilik dashboarda atalım, belki zaten katılmıştır
  }

  // 3. Önbelleği temizle ve Dashboard'a uçur
  revalidatePath('/dashboard')
  revalidatePath('/')
  redirect('/dashboard') 
}