'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateUsername(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Kullanıcıyı Kontrol Et
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Form Verisini Al ve Doğrula
  const username = formData.get('username') as string

  // Sunucu tarafı validasyonu (Güvenlik için şart)
  if (!username || username.length < 3 || username.length > 20) {
    // Hata durumunda (Şimdilik direkt redirect yapıyoruz, ileride toast eklenebilir)
    console.error("Geçersiz kullanıcı adı uzunluğu")
    return
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    console.error("Geçersiz karakterler")
    return
  }

  // 3. Veritabanını Güncelle
  // Profil zaten 'handle_new_user' trigger'ı ile oluşmuştu, sadece username'i update ediyoruz.
  const { error } = await supabase
    .from('profiles')
    .update({ 
      username: username,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Username update error:', error)
    // Eğer kullanıcı adı "UNIQUE" ise ve başkası almışsa burada hata verir.
    // MVP aşamasında bunu es geçiyoruz ama ileride kullanıcıya "Bu isim alınmış" demeliyiz.
    return 
  }

  // 4. Cache Temizliği
  // Tüm sitenin cache'ini temizle ki Navbar'da isim anında güncellensin
  revalidatePath('/', 'layout')

  // 5. Yönlendirme
  // İsim belirlendiğine göre artık savaşa (Feed veya Dashboard) gidebilir.
  redirect('/feed')
}