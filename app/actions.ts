'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- CHALLENGE SİLME (GÜNCELLENDİ) ---
// Artık FormData yerine direkt challengeId (string) alıyor.
// Bu sayede DeleteButton bileşeni ile uyumlu çalışacak.
export async function deleteChallenge(challengeId: string) {
  const supabase = await createClient()

  // 1. Kullanıcıyı al
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 2. Sadece "Kendi Oluşturduğu" Challenge'ı silebilir
  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId)
    .eq('created_by', user.id) // Güvenlik Kilidi

  if (error) {
    console.error('Silme Hatası:', error)
    return
  }

  // 3. Listeyi yenile
  revalidatePath('/')
}

// --- GÜNLÜK RAPORLAMA (DASHBOARD İÇİN GEREKLİ) ---
// Bunu da ekliyorum ki Dashboard sayfasında "Raporu Tamamla" diyince hata alma.
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

  if (error) {
    console.log("Log Hatası:", error)
    return
  }

  revalidatePath(`/dashboard?id=${challengeId}`)
}