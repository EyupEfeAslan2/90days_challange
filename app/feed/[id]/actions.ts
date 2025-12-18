'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- YORUM EKLEME OPERASYONU ---
export async function addComment(formData: FormData) {
  const content = formData.get('content') as string
  const postId = formData.get('post_id') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !content || !content.trim()) return

  const { error } = await supabase.from('forum_comments').insert({
    post_id: postId,
    user_id: user.id,
    content: content
  })

  if (error) {
    console.error('Yorum Hatası:', error)
    return
  }

  revalidatePath(`/feed/${postId}`)
}

// --- OYLAMA OPERASYONU (LIKE/DISLIKE) ---
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
      // Zaten aynı oyu vermiş -> Oyu geri çek (Sil)
      await supabase.from('forum_likes').delete().eq('user_id', user.id).eq('post_id', postId)
    } else {
      // Farklı oy vermiş (Like'tan Dislike'a dönüyor) -> Güncelle
      await supabase
        .from('forum_likes')
        .update({ vote_type: voteType })
        .eq('user_id', user.id)
        .eq('post_id', postId)
    }
  } else {
    // Hiç oyu yok -> Yeni ekle
    await supabase.from('forum_likes').insert({
      user_id: user.id,
      post_id: postId,
      vote_type: voteType
    })
  }

  revalidatePath(`/feed/${postId}`)
}
// --- KONU SİLME OPERASYONU ---
export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // Sadece kendi postunu silebilir
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Silme Hatası:', error)
    return
  }

  // Silince listeye (Feed'e) geri dön
  redirect('/feed')
}