'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const username = formData.get('username') as string

  // 1. Önce kullanıcı adı geçerli mi diye bak
  if (!username || username.length < 3) {
    // Return yerine redirect kullanıyoruz ki tip hatası olmasın
    return redirect('/settings?error=short')
  }

  // 2. Şimdi veritabanını güncellemeye çalış
  // (Hata burada oluşabilir, o yüzden error değişkeni burada tanımlanıyor)
  const { error } = await supabase
    .from('profiles')
    .update({ username: username })
    .eq('id', user.id)

  // 3. Veritabanı hatası var mı kontrol et
  if (error) {
    console.error('Profil güncelleme hatası:', error)
    return redirect('/settings?error=exists')
  }

  // 4. Her şey yolundaysa
  revalidatePath('/dashboard')
  revalidatePath('/settings')
  redirect('/dashboard')
}