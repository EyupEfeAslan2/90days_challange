'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitDailyLog(formData: FormData) {
  const supabase = await createClient()

  // 1. Kullanıcıyı al
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/dashboard?error=unauthorized')
  }

  // 2. Formdan verileri çek
  const challenge_id = formData.get('challenge_id') as string
  const omission = formData.get('omission') as string // Yapmam gerekenler
  const commission = formData.get('commission') as string // Yapmamam gerekenler

  // 3. Veritabanına "Upsert" yap (Varsa güncelle, yoksa ekle)
  // user_id, challenge_id ve log_date (bugün) kombinasyonu unique olduğu için
  // aynı gün içinde tekrar basarsa günceller.
  const { error } = await supabase
    .from('daily_logs')
    .upsert({
      user_id: user.id,
      challenge_id: challenge_id,
      log_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      sins_of_omission: omission,
      sins_of_commission: commission,
      is_completed: true // Günlük girildiyse o gün tamamlanmış sayılır
    }, {
      onConflict: 'user_id, challenge_id, log_date' // Çakışma kuralı
    })

  if (error) {
    console.error('Günlük hatası:', error)
    // Hata varsa URL'ye error parametresiyle dön
    return redirect('/dashboard?error=failed')
  }

  // Başarılıysa önbelleği temizle
  revalidatePath('/dashboard')
  
  // URL'ye 'message=saved' ekleyerek yönlendir (ToastWatcher bunu yakalayacak)
  redirect('/dashboard?message=saved')
}