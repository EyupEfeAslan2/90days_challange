'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- 1. CHALLENGE'A KATILMA (JOIN) ---
export async function joinChallenge(challengeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('user_challenges')
    .insert({
      user_id: user.id,
      challenge_id: challengeId
    })
    .select()

  if (error) {
    if (error.code !== '23505') {
      console.error('Katılma Hatası:', error.message)
      return 
    }
  }

  revalidatePath('/')
  revalidatePath(`/challenge/${challengeId}`)
  redirect(`/dashboard?id=${challengeId}`)
}

// --- 2. CHALLENGE'DAN AYRILMA (LEAVE) ---
export async function leaveChallenge(challengeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await supabase
    .from('user_challenges')
    .delete()
    .eq('user_id', user.id)
    .eq('challenge_id', challengeId)

  revalidatePath('/')
  revalidatePath(`/challenge/${challengeId}`)
}

// --- 3. YORUM YAPMA (COMMENT) ---
export async function postChallengeComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const challengeId = formData.get('challenge_id') as string
  const content = formData.get('content') as string

  if (!content || content.trim().length === 0) return

  await supabase.from('challenge_comments' as any).insert({
    user_id: user.id,
    challenge_id: challengeId,
    content: content.trim()
  })

  revalidatePath(`/challenge/${challengeId}`)
}

// --- 4. CHALLENGE SİLME (DELETE) ---
export async function deleteChallenge(challengeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId)
    .eq('created_by', user.id)

  if (error) console.error('Silme Hatası:', error)

  revalidatePath('/')
}

// --- 5. GÜNLÜK RAPORLAMA (DASHBOARD) ---
export async function submitDailyLog(formData: FormData) {
  const challengeId = formData.get('challenge_id') as string
  const omission = formData.get('omission') as string
  const commission = formData.get('commission') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // GÜVENLİK KİLİDİ: Önce Challenge tarihini kontrol et
  const { data: challenge } = await supabase
    .from('challenges')
    .select('end_date')
    .eq('id', challengeId)
    .single()

  if (!challenge) return

  const today = new Date().toISOString().split('T')[0]
  
  // Eğer Bugün > Bitiş Tarihi ise işlemi durdur (Abort Mission)
  if (new Date(today) > new Date(challenge.end_date)) {
    console.error("Süresi dolmuş göreve rapor girilemez.")
    return // Sessizce reddet veya hata fırlat
  }

  const { error } = await supabase.from('daily_logs').upsert({
    user_id: user.id,
    challenge_id: challengeId,
    log_date: today,
    sins_of_omission: omission,
    sins_of_commission: commission,
    is_completed: true
  }, {
    onConflict: 'user_id, challenge_id, log_date'
  })

  if (error) console.error("Log Hatası:", error)

  revalidatePath(`/dashboard?id=${challengeId}`)
}