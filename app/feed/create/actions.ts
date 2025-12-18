'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // 1. Veriyi Kaydet
  const { error } = await supabase.from('forum_posts').insert({
    user_id: user.id,
    title: title,
    content: content
  })

  if (error) {
    console.error('Hata:', error)
    return 
  }

  // 2. Cache Temizle
  revalidatePath('/feed')

  // 3. Yönlendir
  redirect('/feed')
}