'use client'

import { Suspense } from 'react' // <--- 1. Suspense'i import ettik
import { login, signup } from './actions'
import { useSearchParams } from 'next/navigation'

// 2. Asıl işi yapan (ve URL parametrelerini okuyan) kısmı ayrı bir parçaya ayırdık
function LoginContent() {
  const searchParams = useSearchParams() // <-- Hata çıkaran kısım artık burada, Suspense korumasında.
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  return (
    <div className="w-full max-w-md space-y-8 p-8 border border-gray-800 rounded-lg bg-gray-900/50 backdrop-blur-sm shadow-2xl">
      
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-red-600 tracking-tighter">Kontrol</h2>
        <p className="text-gray-400 text-sm">90 Günlük İrade Savaşına Giriş</p>
      </div>

      {/* Başarı Mesajı Kutusu */}
      {message && (
        <div className="bg-green-900/30 border border-green-800 text-green-400 p-3 rounded text-sm text-center">
          {message}
        </div>
      )}

      {/* Hata Mesajı Kutusu */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 rounded text-sm text-center">
          Giriş başarısız. Bilgilerini kontrol et.
        </div>
      )}

      <form className="space-y-6">
        <div className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email Adresi"
            required
            className="w-full p-4 rounded bg-black/50 border border-gray-700 focus:border-red-600 outline-none transition text-white"
          />
          <input
            name="password"
            type="password"
            placeholder="Şifre"
            required
            className="w-full p-4 rounded bg-black/50 border border-gray-700 focus:border-red-600 outline-none transition text-white"
          />
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <button formAction={login} className="w-full bg-red-700 hover:bg-red-600 py-4 rounded font-bold text-lg transition shadow-lg shadow-red-900/20">
            Giriş Yap
          </button>
          
          <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-xs">Hesabın yok mu?</span>
              <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <button formAction={signup} className="w-full border border-gray-600 hover:bg-gray-800 py-3 rounded font-bold transition text-gray-300">
            Yeni Kayıt Oluştur
          </button>
        </div>
      </form>
      
    </div>
  )
}

// 3. Ana bileşen artık sadece bir "Kabuk" (Wrapper) görevi görüyor
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <Suspense fallback={<div className="text-gray-400">Yükleniyor...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  )
}