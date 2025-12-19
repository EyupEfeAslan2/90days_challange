'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- 1. CHALLENGE'A KATILMA (JOIN) ---
// --- 1. CHALLENGE'A KATILMA (JOIN) ---
export async function joinChallenge(challengeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Veritabanına ekle
  const { error } = await supabase
    .from('user_challenges')
    .insert({
      user_id: user.id,
      challenge_id: challengeId
    })
    .select()

  // Hata Yönetimi
  if (error) {
    // Eğer hata "Zaten Kayıtlı" (23505) değilse logla
    if (error.code !== '23505') {
      console.error('Katılma Hatası:', error.message)
      // Burada "throw error" yaparsak sistem hatası sayfasına gider.
      // Onun yerine sessizce dashboard'a yönlendirelim veya return edelim.
      return 
    }
  }

  // İşlem başarılıysa veya zaten kayıtlıysa Dashboard'a at
  revalidatePath('/')
  revalidatePath(`/challenge/${challengeId}`)
  redirect(`/dashboard?id=${challengeId}`)
}

// --- 2. CHALLENGE'DAN AYRILMA (LEAVE) [YENİ] ---
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

  // TS FIX: 'challenge_comments' tablosu type dosyasında olmadığı için
  // TypeScript'e bu string'i 'any' olarak işaretleyip geçiyoruz.
  // Bu sayede tüm proje güvenliğini kapatmadan sadece burayı çözüyoruz.
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

  const today = new Date().toISOString().split('T')[0]

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