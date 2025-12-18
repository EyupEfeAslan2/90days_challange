import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateUsername } from './actions'
import { Suspense } from 'react'

// Sub-components
const WelcomeHeader = () => (
  <div className="text-center space-y-4 animate-in fade-in slide-in-from-top duration-700">
    <div className="inline-block">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-900/50">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    </div>
    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
      Aramıza Hoşgeldin
    </h1>
    <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-4" />
    <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
      Topluluğa katılmadan önce seni tanıyacağımız bir <span className="text-red-400 font-semibold">kod adı</span> belirle.
    </p>
  </div>
)

const UsernameField = () => (
  <div className="space-y-3 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
    <label 
      htmlFor="username"
      className="block text-sm font-bold text-gray-300 uppercase tracking-wide"
    >
      Kullanıcı Adı (Rumuz)
    </label>
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
      <input
        id="username"
        name="username"
        type="text"
        placeholder="Örn: IronWill, PhoenixRise, SpartanMind"
        required
        minLength={3}
        maxLength={20}
        pattern="^[a-zA-Z0-9_]+$"
        title="Sadece harf, rakam ve alt çizgi kullanabilirsiniz"
        autoComplete="username"
        className="relative w-full bg-black border-2 border-gray-700 rounded-lg p-4 text-white placeholder:text-gray-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/50 outline-none transition-all"
      />
    </div>
    <div className="flex items-start gap-2 text-xs text-gray-500">
      <svg className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <p>3-20 karakter arası, sadece harf, rakam ve alt çizgi. Daha sonra değiştirebilirsin.</p>
    </div>
  </div>
)

const SubmitButton = () => (
  <button 
    type="submit"
    className="group relative w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-4 rounded-lg transition-all text-lg shadow-lg shadow-red-900/30 hover:shadow-red-900/60 transform hover:scale-[1.02] active:scale-95 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 delay-300"
  >
    <span className="relative z-10 flex items-center justify-center gap-2">
      Sisteme Giriş Yap
      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </span>
    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
  </button>
)

const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-3">
      <div className="h-4 bg-gray-800 rounded w-32" />
      <div className="h-14 bg-gray-800 rounded-lg" />
      <div className="h-3 bg-gray-800 rounded w-full" />
    </div>
    <div className="h-14 bg-gray-800 rounded-lg" />
  </div>
)

const FeatureList = () => (
  <div className="mt-8 pt-8 border-t border-gray-800 space-y-4 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide text-center mb-6">
      Seni Neler Bekliyor
    </h3>
    <div className="grid gap-3">
      {[
        { icon: '🎯', text: 'Kişisel görevler ve hedefler', color: 'from-blue-600/20 to-blue-800/20' },
        { icon: '📊', text: 'İlerleme takibi ve istatistikler', color: 'from-green-600/20 to-green-800/20' },
        { icon: '🏆', text: 'Liderlik tablosu ve rozetler', color: 'from-yellow-600/20 to-yellow-800/20' },
        { icon: '🔥', text: 'Aktif topluluk ve motivasyon', color: 'from-red-600/20 to-red-800/20' }
      ].map((feature, index) => (
        <div 
          key={index}
          className="flex items-center gap-3 p-3 bg-gray-950/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors group"
          style={{ 
            animationDelay: `${(index + 5) * 100}ms`,
            animation: 'fadeIn 0.5s ease-out forwards',
            opacity: 0
          }}
        >
          <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
            {feature.icon}
          </div>
          <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
            {feature.text}
          </p>
        </div>
      ))}
    </div>
  </div>
)

// Main Component
export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Redirect if not authenticated
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-black to-black pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="space-y-8 bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl hover:border-gray-700 transition-all duration-500">
          
          {/* Header */}
          <WelcomeHeader />

          {/* Form */}
          <Suspense fallback={<FormSkeleton />}>
            <form action={updateUsername} className="space-y-6">
              <UsernameField />
              <SubmitButton />
            </form>
          </Suspense>

          {/* Features List */}
          <FeatureList />

        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <p className="text-xs text-gray-600">
            Kullanıcı adın topluluğa açık olacak. Gerçek ismini kullanma.
          </p>
        </div>
      </div>
    </div>
  )
}