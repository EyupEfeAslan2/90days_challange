// app/dashboard/actions.ts

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitDailyLog(formData: FormData) {
  const supabase = await createClient()

  // 1. Auth Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/dashboard?error=unauthorized')
  }

  // 2. Veri Doğrulama
  const challenge_id = formData.get('challenge_id') as string
  const omission = formData.get('omission') as string
  const commission = formData.get('commission') as string

  if (!challenge_id) return

  const today = new Date().toISOString().split('T')[0]

  // 3. Veritabanı İşlemi
  const { error } = await supabase
    .from('daily_logs')
    .upsert({
      user_id: user.id,
      challenge_id: challenge_id,
      date: today,
      
      // 👇 EKRANDA GÖZÜKMESİ İÇİN GEREKLİ ALANLAR 👇
      sins_of_omission: omission,
      sins_of_commission: commission,
      note: `${omission} \n ${commission}`, // Yedek olarak note alanına da yazalım
      
      // 👇 HEM 'is_completed' HEM 'status' DOLDURUYORUZ Kİ UYUMSUZLUK OLMASIN 👇
      is_completed: true,
      status: 'success' 
    }, {
      onConflict: 'user_id, challenge_id, log_date'
    })

  if (error) {
    console.error('Günlük Log Hatası:', error)
    return redirect('/dashboard?error=failed')
  }

  revalidatePath('/dashboard')
  revalidatePath('/leaderboard') // Liderlik tablosunu da yenile
  redirect('/dashboard?message=saved')
}