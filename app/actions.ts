'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// --- CHALLENGE SİLME ---
export async function deleteChallenge(challengeId: string) {
  const supabase = await createClient()

  // 1. Yetki Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 2. Silme İşlemi (Sadece oluşturan silebilir)
  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId)
    .eq('created_by', user.id)

  if (error) {
    console.error('Challenge Silme Hatası:', error)
    throw new Error('Silme işlemi başarısız.')
  }

  // 3. UI Güncelle
  revalidatePath('/')
}