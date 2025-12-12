import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  // Kullanıcı var mı?
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Varsa Dashboard'a git
    redirect('/dashboard')
  } else {
    // Yoksa Login'e git
    redirect('/login')
  }
}