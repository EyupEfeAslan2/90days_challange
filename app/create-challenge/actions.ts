'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Form State Tipi
interface FormState {
  message: string
  errors?: Record<string, string[]>
}

export async function createChallenge(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  // 1. Auth Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // 2. Veri Doğrulama (Basit Manuel Kontrol)
  const title = formData.get('title') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const description = formData.get('description') as string
  const visibility = formData.get('visibility') // "on" or null

  if (!title || !start_date || !end_date) {
    return { message: 'Lütfen tüm zorunlu alanları doldurun.' }
  }

  // Tarih mantık kontrolü
  if (new Date(end_date) <= new Date(start_date)) {
    return { message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.' }
  }

  // 3. Insert İşlemi
  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert({
      title,
      description,
      start_date,
      end_date,
      created_by: user.id,
      is_public: visibility === 'on',
    })
    .select()
    .single()

  if (error) {
    console.error('Create Error:', error)
    return { message: 'Hedef oluşturulurken bir hata oluştu. Lütfen tekrar dene.' }
  }

  // 4. Kurucuyu Katılımcı Olarak Ekle
  await supabase
    .from('user_challenges')
    .insert({
      user_id: user.id,
      challenge_id: challenge.id
    })

  // 5. Başarılı -> Yönlendir
  redirect('/dashboard') // Direkt dashboard'a gitsin, yeni hedefini görsün.
}