'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateUsername(formData: FormData) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const username = (formData.get('username') as string)?.trim()

  // 2. Validation
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!username || username.length < 3 || username.length > 20 || !usernameRegex.test(username)) {
    return redirect('/onboarding?error=validation')
  }

  // 3. Duplicate Check
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id) // Kendi eski username'i ise sorun yok (update senaryosu için)
    .single()

  if (existing) {
    return redirect('/onboarding?error=duplicate')
  }

  // 4. Update
  const { error } = await supabase
    .from('profiles')
    .update({ 
      username: username,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Update Error:', error)
    return redirect('/onboarding?error=database')
  }

  // 5. Success
  revalidatePath('/', 'layout')
  redirect('/dashboard') // Feed yerine Dashboard'a yönlendirmek daha mantıklı başlangıç için
}