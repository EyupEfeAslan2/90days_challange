// components/SignOutButton.tsx
'use client'

import { signOut } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Sub-components
function LoadingSpinner() {
  return (
    <svg 
      className="w-4 h-4 animate-spin" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  )
}

function PillShine() {
  return (
    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
  )
}

// Main Component
export default function SignOutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      const result = await signOut()

      if (result.error) {
        console.error('Sign out error:', result.error)
        setIsLoading(false)
        return
      }

      router.refresh()
      router.push('/login')
    } catch (error) {
      console.error('Unexpected sign out error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleSignOut}
      disabled={isLoading}
      className="group relative transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      aria-label="Çıkış Yap"
    >
      {/* Blue Pill Body */}
      <div className="relative w-24 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full shadow-[0_0_15px_-3px_rgba(37,99,235,0.6)] flex items-center justify-center overflow-hidden border border-blue-400/30">
        
        {/* Shine Effect */}
        <PillShine />
        
        {/* Text */}
        <span className="relative z-10 text-[11px] font-black text-white uppercase tracking-widest drop-shadow-md">
          {isLoading ? <LoadingSpinner /> : 'Çıkış'}
        </span>
      </div>
    </button>
  )
}