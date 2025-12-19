'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content')
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Validasyon
  if (!user) return redirect('/login')
  if (!title || typeof title !== 'string' || !content || typeof content !== 'string') {
    return // Veya hata fırlat
  }

  // 1. Veriyi Kaydet
  const { error } = await supabase.from('forum_posts').insert({
    user_id: user.id,
    title: title,
    content: content
  })

  if (error) {
    console.error('Create Post Error:', error)
    // Hata yönetimi eklenebilir
    return 
  }

  // 2. Cache Temizle
  revalidatePath('/feed')

  // 3. Yönlendir
  redirect('/feed')
}