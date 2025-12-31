'use client'

import { useState, useTransition } from 'react'
import { login, signup } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' 
import Link from 'next/link' // ✅ EKLENDİ

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Form Gönderim İşleyicisi
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    const formData = new FormData(event.currentTarget)
    
    startTransition(async () => {
      try {
        if (mode === 'login') {
          // --- GİRİŞ İŞLEMİ ---
          await login(formData)
        } else {
          // --- KAYIT İŞLEMİ ---
          const result = await signup(formData)
          
          if (result?.error) {
            toast.error(result.error)
          } else {
            toast.success('Kayıt başarılı! Lütfen giriş yapın.')
            setMode('login') 
          }
        }
      } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT' || error.message?.includes('NEXT_REDIRECT')) {
            return
        }
        toast.error('İşlem başarısız. Bilgilerinizi kontrol edin.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Arkaplan Ambiyansı */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Ana Kart */}
      <div className="w-full max-w-[400px] bg-[#0f1115]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 transition-all duration-500">
        
        {/* Başlık ve Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-white">90DAYS</h1>
          <p className="text-gray-400 text-sm font-medium">İradeni Test Et. Sınırlarını Zorla.</p>
        </div>

        {/* Sekme Değiştirici (Toggle) */}
        <div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-white/5">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
              mode === 'login' 
                ? 'bg-white text-black shadow-lg scale-[1.02]' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            GİRİŞ YAP
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
              mode === 'register' 
                ? 'bg-white text-black shadow-lg scale-[1.02]' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            KAYIT OL
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">E-Posta</label>
            <div className="relative group">
              <input
                name="email"
                type="email"
                placeholder="ornek@mail.com"
                required
                autoComplete="off"
                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-red-600 focus:ring-1 focus:ring-red-900 outline-none transition placeholder:text-gray-700 text-sm"
              />
              <div className="absolute inset-0 rounded-xl border border-white/0 group-hover:border-white/5 pointer-events-none transition" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Şifre</label>
            <div className="relative group">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3.5 text-white focus:border-red-600 focus:ring-1 focus:ring-red-900 outline-none transition placeholder:text-gray-700 text-sm pr-12"
              />
              
              {/* Şifre Göster/Gizle Butonu */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition p-1"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  İŞLENİYOR...
                </>
              ) : (
                mode === 'login' ? 'GİRİŞ YAP' : 'HESAP OLUŞTUR'
              )}
            </button>
          </div>

        </form>

        {/* Alt Bilgi */}
        <p className="text-center mt-6 text-xs text-gray-500 leading-relaxed">
          {mode === 'login' 
            ? "Henüz bir hesabın yok mu? Yukarıdan 'Kayıt Ol' sekmesine geç." 
            : "Zaten bir hesabın var mı? Yukarıdan 'Giriş Yap' sekmesine geç."
          }
        </p>

        {/* ✅ MİSAFİR GİRİŞ BUTONU (YENİ EKLENDİ) */}
        <div className="mt-6 pt-6 border-t border-gray-800">
           <Link 
              href="/"
              className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-gray-800 text-gray-400 font-bold text-xs hover:bg-gray-800 hover:text-white hover:border-gray-700 transition-all active:scale-95"
            >
              MİSAFİR OLARAK GÖZ AT
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
        </div>

      </div>
    </div>
  )
}