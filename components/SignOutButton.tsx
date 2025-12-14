'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <button 
      onClick={handleSignOut}
      className="text-xs text-red-500 border border-red-900/50 bg-red-900/10 px-3 py-1.5 rounded hover:bg-red-900/30 transition"
    >
      Çıkış
    </button>
  )
}