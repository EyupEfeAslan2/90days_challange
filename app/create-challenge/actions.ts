'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createChallenge(formData: FormData) {
  const supabase = await createClient()

  // 1. Kullanıcı oturumunu kontrol et
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // 2. Form verilerini al
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const visibility = formData.get('visibility') as string // "public" veya null gelir

  // 3. Challenge'ı veritabanına ekle
  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert({
      title,
      description,
      start_date,
      end_date,
      created_by: user.id,
      is_public: visibility === 'on', // Checkbox işaretliyse 'on' gelir
    })
    .select()
    .single()

  if (error) {
    console.error('Hata:', error)
    // Gerçek hayatta burada hata mesajı döndürmek lazım ama şimdilik redirect
    return redirect('/?error=challenge-create-failed')
  }

  // 4. Oluşturan kişiyi otomatik olarak katılımcı yap (Lider de savaşır!)
  await supabase
    .from('user_challenges')
    .insert({
      user_id: user.id,
      challenge_id: challenge.id
    })

  // 5. Ana sayfaya geri dön (Listeyi güncel görelim)
  redirect('/')
}