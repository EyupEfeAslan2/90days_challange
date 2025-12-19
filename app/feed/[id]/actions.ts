'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- YORUM EKLEME ---
export async function addComment(formData: FormData) {
  const content = formData.get('content')
  const postId = formData.get('post_id')
  
  // Basit validasyon
  if (!content || typeof content !== 'string' || !content.trim() || !postId) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { error } = await supabase.from('forum_comments').insert({
    post_id: postId as string,
    user_id: user.id,
    content: content
  })

  if (error) {
    console.error('Yorum Ekleme Hatası:', error)
    return
    // Hata durumunda UI'a geri bildirim göndermek için return state kullanılabilir
  }

  revalidatePath(`/feed/${postId}`)
}

// --- OYLAMA (LIKE/DISLIKE) ---
export async function votePost(postId: string, voteType: 'up' | 'down') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // 1. Mevcut oyu kontrol et
  const { data: existingVote } = await supabase
    .from('forum_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Aynı oya tekrar basıldı -> Oyu Geri Al
      await supabase
        .from('forum_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
    } else {
      // Farklı oya basıldı -> Güncelle (Up -> Down veya tam tersi)
      await supabase
        .from('forum_likes')
        .update({ vote_type: voteType })
        .eq('user_id', user.id)
        .eq('post_id', postId)
    }
  } else {
    // Hiç oy yok -> Yeni Oluştur
    await supabase.from('forum_likes').insert({
      user_id: user.id,
      post_id: postId,
      vote_type: voteType
    })
  }

  revalidatePath(`/feed/${postId}`)
}

// --- KONU SİLME ---
export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // Row Level Security (RLS) policies normalde bunu engeller ama
  // explicit olarak user_id kontrolü yapmak clean code prensibidir.
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Silme Hatası:', error)
    return
  }

  // Listeyi güncelle ve yönlendir
  revalidatePath('/feed')
  redirect('/feed')
}