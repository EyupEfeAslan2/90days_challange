'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Formdan verileri al
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Basit validasyon
  if (!email || !password) {
    return redirect('/login?error=eksik-bilgi')
  }

  // Supabase'e sor: Bu kullanıcı var mı?
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Giriş Hatası:', error.message)
    return redirect('/login?error=giris-basarisiz')
  }

  // Başarılıysa anasayfaya yönlendir
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Basit validasyon
  if (!email || !password) {
    return redirect('/login?error=eksik-bilgi')
  }

  if (password.length < 6) {
    return redirect('/login?error=zayif-sifre')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    }
  })

  if (error) {
    console.error('Kayıt Hatası:', error.message)
    return redirect('/login?error=kayit-basarisiz')
  }

  // Email doğrulaması gerekiyorsa kullanıcıyı bilgilendir
  return redirect('/login?success=kayit-basarili')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // ÖNEMLİ: Çıkış yapanı ana sayfaya değil, login sayfasına atıyoruz.
  redirect('/login')
}
