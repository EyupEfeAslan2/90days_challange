'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function joinChallenge(formData: FormData) {
  const supabase = await createClient()

  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  const challenge_id = formData.get('challenge_id') as string
  if (!challenge_id) return

  // 2. Mükerrer Kayıt Kontrolü (Already Joined?)
  const { data: existing } = await supabase
    .from('user_challenges')
    .select('id')
    .eq('user_id', user.id)
    .eq('challenge_id', challenge_id)
    .single()

  if (existing) {
    // Zaten katılmışsa direkt dashboard'a gönder
    return redirect(`/dashboard?id=${challenge_id}`)
  }

  // 3. Kayıt Ekleme
  const { error } = await supabase
    .from('user_challenges')
    .insert({
      user_id: user.id,
      challenge_id: challenge_id
    })

  if (error) {
    console.error('Katılım Hatası:', error)
    return // Error handling UI eklenebilir
  }

  // 4. Cache Temizle ve Yönlendir
  revalidatePath('/dashboard')
  revalidatePath(`/challenge/${challenge_id}`)
  
  // Kullanıcıyı direkt ilgili challenge'ın dashboard görünümüne at
  redirect(`/dashboard?id=${challenge_id}`) 
}