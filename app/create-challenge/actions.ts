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
    redirect('/login')
  }

  // 2. Veri Alma ve Temel Doğrulama
  const title = formData.get('title') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const description = formData.get('description') as string
  const visibility = formData.get('visibility') // "on" or null

  if (!title || !start_date || !end_date) {
    return { message: 'Lütfen tüm zorunlu alanları doldurun.' }
  }

  // 3. KRİTİK TARİH KONTROLÜ (Validation Fix)
  const startDateObj = new Date(start_date)
  const endDateObj = new Date(end_date)

  if (endDateObj < startDateObj) {
    return { message: 'Operasyon bitiş tarihi, başlangıç tarihinden önce olamaz.' }
  }

  // 4. Insert İşlemi
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
    return { message: 'Hedef oluşturulurken sistemsel bir hata oluştu.' }
  }

  // 5. Kurucuyu Otomatik Olarak Katılımcı Yap
  await supabase
    .from('user_challenges')
    .insert({
      user_id: user.id,
      challenge_id: challenge.id
    })

  // 6. Başarılı -> Yönlendir
  redirect('/dashboard') 
}