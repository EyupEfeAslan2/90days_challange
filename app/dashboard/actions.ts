'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function logDailyStatus(formData: FormData) {
  const supabase = await createClient()

  // 1. Kullanıcıyı al
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return;

  // 2. Formdan veriyi al (true mu false mu?)
  const status = formData.get('status') === 'true'

  // 3. Veritabanına yaz
  const { error } = await supabase
    .from('daily_logs')
    .insert({
      user_id: user.id,
      is_successful: status,
      created_at: new Date().toISOString() // Bugünün tarihi
    })

  if (error) {
    console.error('Kayıt hatası:', error)
    // Eğer "unique constraint" hatasıysa kullanıcı zaten bugün girmiştir.
  }

  // 4. Sayfayı yenile ki butonlar gitsin, yerine sonuç gelsin
  revalidatePath('/dashboard')
}