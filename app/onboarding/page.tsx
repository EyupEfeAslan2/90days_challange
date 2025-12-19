import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateUsername } from './actions'
import { Suspense } from 'react'

// --- SUB COMPONENTS ---

const Header = () => (
  <div className="text-center space-y-4 animate-in fade-in slide-in-from-top duration-700">
    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-red-900/30 rotate-3 hover:rotate-6 transition-transform">
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
      Sisteme Başlangıç
    </h1>
    <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
      Toplulukta seni temsil edecek benzersiz bir <span className="text-red-500 font-bold">Kullanıcı Adı</span> belirle.
    </p>
  </div>
)

const SubmitButton = () => (
  <button 
    type="submit"
    className="group relative w-full bg-white text-black font-bold py-4 rounded-xl transition-all shadow-lg hover:bg-gray-200 transform hover:scale-[1.02] active:scale-95 overflow-hidden mt-2"
  >
    <span className="relative z-10 flex items-center justify-center gap-2">
      KAYDI TAMAMLA
      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </span>
  </button>
)

const ErrorMessage = ({ error }: { error?: string }) => {
  if (!error) return null
  
  const messages: Record<string, string> = {
    'validation': 'Kullanıcı adı 3-20 karakter olmalı ve sadece harf/rakam içermelidir.',
    'duplicate': 'Bu kullanıcı adı zaten alınmış.',
    'database': 'Veritabanı hatası oluştu, lütfen tekrar deneyin.',
    'unexpected': 'Beklenmeyen bir hata oluştu.'
  }

  return (
    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs font-bold text-center animate-in fade-in">
      {messages[error] || 'Bir hata oluştu.'}
    </div>
  )
}

// --- MAIN PAGE ---
export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
      
      {/* Ambiyans */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="space-y-8 bg-[#0a0a0a] border border-gray-800 p-8 md:p-10 rounded-3xl shadow-2xl">
          
          <Header />
          
          <ErrorMessage error={params.error} />

          <form action={updateUsername} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Kullanıcı Adı</label>
              <input
                name="username"
                type="text"
                placeholder="Örn: StoicMind"
                required
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9_]+$"
                autoComplete="off"
                className="w-full bg-black border border-gray-700 focus:border-red-600 rounded-xl p-4 text-white placeholder:text-gray-700 outline-none transition-all font-bold tracking-wide"
              />
              <p className="text-[10px] text-gray-600 ml-1">
                * Sadece harf, rakam ve alt çizgi.
              </p>
            </div>
            
            <Suspense fallback={<div className="h-14 bg-gray-800 rounded-xl animate-pulse" />}>
              <SubmitButton />
            </Suspense>
          </form>

        </div>
      </div>
    </div>
  )
}