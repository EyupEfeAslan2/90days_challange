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

  // 2. Veri Doğrulama ve Hazırlama
  const challenge_id = formData.get('challenge_id') as string
  const omission = formData.get('omission') as string // Yapılmayanlar (İhmaller)
  const commission = formData.get('commission') as string // Yapılan Hatalar

  if (!challenge_id) return

  // 3. Veritabanı İşlemi (Upsert)
  // Aynı gün için kayıt varsa günceller, yoksa oluşturur.
  const { error } = await supabase
    .from('daily_logs')
    .upsert({
      user_id: user.id,
      challenge_id: challenge_id,
      log_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      sins_of_omission: omission,
      sins_of_commission: commission,
      is_completed: true
    }, {
      onConflict: 'user_id, challenge_id, log_date'
    })

  if (error) {
    console.error('Günlük Log Hatası:', error)
    return redirect('/dashboard?error=failed')
  }

  // 4. Cache Temizle ve Yönlendir
  revalidatePath('/dashboard')
  redirect('/dashboard?message=saved')
}