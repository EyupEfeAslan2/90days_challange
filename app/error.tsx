'use client' // Error components must be Client Components

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  
  useEffect(() => {
    // Hata takibi için (Sentry vb. buraya eklenebilir)
    console.error('Uygulama Hatası:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-red-900/30 rounded-2xl p-8 text-center shadow-2xl">
        
        {/* Icon */}
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-white mb-2">Sistem Hatası</h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Beklenmedik bir engelle karşılaştık. Bu sadece geçici bir durum.
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95"
          >
            Tekrar Dene
          </button>
          
          <Link 
            href="/"
            className="block w-full py-3 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 font-bold rounded-xl transition-colors text-sm"
          >
            Ana Sayfaya Dön
          </Link>
        </div>

        {error.digest && (
          <div className="mt-8 pt-4 border-t border-gray-900">
            <p className="text-[10px] text-gray-700 font-mono">
              Hata Referansı: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}