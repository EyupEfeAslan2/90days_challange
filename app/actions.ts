'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

// ==========================================
// 1. KİMLİK DOĞRULAMA (AUTH) İŞLEMLERİ
// ==========================================

export async function login(formData: FormData) {
  const supabase = await createClient()

  // ... (email password alma kısımları aynı)
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // ... hata yönetimi
    throw error
  }

  // ✅ BAŞARILIYSA DİREKT DASHBOARD'A FIRLAT
  revalidatePath('/', 'layout')
  redirect('/dashboard') 
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Verileri al
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // Şifre vb. kontrolü... (Mevcut kodunda varsa kalsın)

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 🔥 İŞTE BURASI: Adresi elle, sert bir şekilde veriyoruz.
      // auth/callback rotasını önceki adımda oluşturmuştuk, oraya gidecek.
      emailRedirectTo: 'https://90days.com.tr/auth/callback',
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ==========================================
// 2. MEYDAN OKUMA (CHALLENGE) İŞLEMLERİ
// ==========================================

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
      return 
    }
  }

  // İşlem başarılıysa veya zaten kayıtlıysa Dashboard'a at
  revalidatePath('/')
  revalidatePath(`/challenge/${challengeId}`)
  redirect(`/dashboard?id=${challengeId}`)
}

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
  revalidatePath('/dashboard')
}

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

// ==========================================
// 3. İÇERİK VE ETKİLEŞİM İŞLEMLERİ
// ==========================================

export async function postChallengeComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const challengeId = formData.get('challenge_id') as string
  const content = formData.get('content') as string

  if (!content || content.trim().length === 0) return

  // TypeScript fix: 'challenge_comments' tablosu eksikse 'as any' ile geçiyoruz
  await supabase.from('challenge_comments' as any).insert({
    user_id: user.id,
    challenge_id: challengeId,
    content: content.trim()
  })

  revalidatePath(`/challenge/${challengeId}`)
}

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
  
  // Eğer Bugün > Bitiş Tarihi ise işlemi durdur
  if (new Date(today) > new Date(challenge.end_date)) {
    console.error("Süresi dolmuş göreve rapor girilemez.")
    return 
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