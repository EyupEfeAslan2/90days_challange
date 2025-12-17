'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleSignOut}
      disabled={isLoading}
      className="group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Çıkış Yap"
      title="Mavi hapı al ve gerçeğe dön"
    >
      {/* Blue Pill Shape */}
      <div className="relative flex items-center justify-center">
        {/* Pill Background */}
        <div className="relative w-24 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full shadow-lg shadow-blue-900/50 group-hover:shadow-blue-900/80 transition-all duration-300">
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full opacity-60 group-hover:opacity-80 transition-opacity" />
          
          {/* Pill Center Line */}
          <div className="absolute inset-y-0 left-1/2 w-[2px] bg-blue-800/30 transform -translate-x-1/2" />
          
          {/* Glossy Highlight */}
          <div className="absolute top-1 left-1/4 w-6 h-3 bg-white/40 rounded-full blur-sm" />
          
          {/* Hover Glow */}
          <div className="absolute inset-0 rounded-full bg-blue-400/0 group-hover:bg-blue-400/20 transition-all duration-300" />
        </div>

        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black text-white uppercase tracking-wider drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'ÇIKIŞ'
            )}
          </span>
        </div>
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900 border border-gray-700 text-white text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
          <span className="block font-bold">Mavi Hap</span>
          <span className="block text-gray-400">Gerçeğe dön</span>
        </div>
        <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
      </div>
    </button>
  )
}

// Alternative Version: With Morpheus Quote
export function SignOutButtonWithQuote() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowWarning(true)}
        disabled={isLoading}
        className="group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Çıkış Yap"
      >
        {/* Blue Pill */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-24 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full shadow-lg shadow-blue-900/50 group-hover:shadow-blue-900/80 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute inset-y-0 left-1/2 w-[2px] bg-blue-800/30 transform -translate-x-1/2" />
            <div className="absolute top-1 left-1/4 w-6 h-3 bg-white/40 rounded-full blur-sm" />
            <div className="absolute inset-0 rounded-full bg-blue-400/0 group-hover:bg-blue-400/20 transition-all duration-300" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-white uppercase tracking-wider drop-shadow-lg">
              {isLoading ? '...' : 'ÇIKIŞ'}
            </span>
          </div>
        </div>
      </button>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-blue-600/30 rounded-xl p-6 max-w-sm space-y-4 animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">💊</span>
              </div>
              <h3 className="text-lg font-bold text-white">Mavi Hapı mı Seçiyorsun?</h3>
              <p className="text-sm text-gray-400 italic">
                "Hikaye biter, yatağında uyanırsın ve istediğine inanırsın."
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
              >
                Kal (Kırmızı)
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
              >
                Çık (Mavi)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}