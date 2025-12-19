'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const username = (formData.get('username') as string)?.trim()

  if (!username || username.length < 3) {
    return redirect('/settings?error=short')
  }

  // Duplicate Check
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .single()

  if (existing) {
    return redirect('/settings?error=exists')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      username: username, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', user.id)

  if (error) {
    return redirect('/settings?error=failed')
  }

  revalidatePath('/', 'layout')
  redirect('/settings?success=true')
}