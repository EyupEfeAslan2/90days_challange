'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ==========================================
// 1. KİMLİK DOĞRULAMA (AUTH) İŞLEMLERİ
// ==========================================

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    throw error
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard') 
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
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

  await supabase.from('challenge_comments' as any).insert({
    user_id: user.id,
    challenge_id: challengeId,
    content: content.trim()
  })

  revalidatePath(`/challenge/${challengeId}`)
}

// ✅ DÜZELTİLMİŞ VE EŞLEŞTİRİLMİŞ RAPOR KAYDETME FONKSİYONU
export async function submitDailyLog(formData: FormData) {
  const challengeId = formData.get('challenge_id') as string
  
  // 1. Formdan gelen verileri doğru isimlerle alıyoruz
  const omission = formData.get('sins_of_omission') as string 
  const commission = formData.get('sins_of_commission') as string
  const note = formData.get('note') as string 

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // 2. Challenge bitiş tarihi kontrolü
  const { data: challenge } = await supabase
    .from('challenges')
    .select('end_date')
    .eq('id', challengeId)
    .single()

  if (!challenge) return

  const today = new Date().toISOString().split('T')[0]
  
  if (new Date(today) > new Date(challenge.end_date)) {
    console.error("Süresi dolmuş göreve rapor girilemez.")
    return 
  }

  // 3. Veritabanına kaydetme (Upsert)
  const { error } = await supabase.from('daily_logs').upsert({
    user_id: user.id,
    challenge_id: challengeId,
    log_date: today,
    sins_of_omission: omission,   // Veritabanı sütunu: Değişken
    sins_of_commission: commission, 
    note: note,                   // Not alanı
    is_completed: true
  }, {
    onConflict: 'user_id, challenge_id, log_date'
  })

  if (error) console.error("Log Hatası:", error)

  // 4. Sayfayı yenile ki veriler görünsün
  revalidatePath(`/dashboard?id=${challengeId}`)
}