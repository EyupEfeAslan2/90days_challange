import { login, signup } from './actions'
import { Suspense } from 'react'

// Types
interface FormFieldProps {
  label: string
  name: string
  type: 'email' | 'password' | 'text'
  placeholder: string
  required?: boolean
  autoComplete?: string
}

// Sub-components
const FormField = ({ 
  label, 
  name, 
  type, 
  placeholder, 
  required = true,
  autoComplete 
}: FormFieldProps) => (
  <div className="space-y-2">
    <label 
      htmlFor={name}
      className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 block"
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      className="w-full bg-white/5 border border-gray-600 focus:border-red-600 rounded-lg p-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-red-600/50 outline-none transition-all hover:bg-white/10"
    />
  </div>
)

const Divider = () => (
  <div className="relative flex items-center py-2">
    <div className="flex-grow border-t border-gray-700" />
    <span className="flex-shrink mx-4 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
      veya
    </span>
    <div className="flex-grow border-t border-gray-700" />
  </div>
)

const BackgroundOverlay = () => (
  <>
    {/* Main Background Image */}
    <div 
      className="absolute inset-0 z-0 transition-all duration-700"
      style={{
        backgroundImage: "url('/matrix-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'brightness(0.35) blur(2px)'
      }}
      aria-hidden="true"
    />
    
    {/* Gradient Overlays */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-0" aria-hidden="true" />
    <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent z-0" aria-hidden="true" />
  </>
)

const Logo = () => (
  <div className="text-center mb-8 space-y-2 animate-in fade-in slide-in-from-top duration-700">
    <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
      90<span className="text-red-600">DAYS</span>
    </h1>
    <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto" />
    <p className="text-gray-300 text-sm font-medium tracking-wide">
      İrade ve Disiplin Yönetimi
    </p>
  </div>
)

const QuoteFooter = () => (
  <div className="mt-8 text-center space-y-2 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
    <div className="h-px w-16 bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-auto mb-4" />
    <p className="text-xs text-gray-500 italic opacity-80 leading-relaxed max-w-xs mx-auto">
      "Sana sadece gerçeği vaat ediyorum, fazlasını değil."
    </p>
    <p className="text-[10px] text-gray-600 uppercase tracking-widest">
      — Morpheus
    </p>
  </div>
)

const FormSkeleton = () => (
  <div className="space-y-5 animate-pulse">
    <div className="space-y-2">
      <div className="h-3 bg-gray-800 rounded w-16 ml-1" />
      <div className="h-12 bg-gray-800 rounded-lg" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-800 rounded w-12 ml-1" />
      <div className="h-12 bg-gray-800 rounded-lg" />
    </div>
    <div className="pt-6 space-y-4">
      <div className="h-14 bg-gray-800 rounded-lg" />
      <div className="h-12 bg-gray-800 rounded-lg" />
    </div>
  </div>
)

// Main Component
export default function LoginPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
      
      {/* Background */}
      <BackgroundOverlay />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in zoom-in duration-500">
        
        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl hover:border-white/20 transition-all duration-500">
          
          {/* Logo & Title */}
          <Logo />

          {/* Form */}
          <Suspense fallback={<FormSkeleton />}>
            <form className="space-y-5">
              
              {/* Email Field */}
              <FormField
                label="E-Posta"
                name="email"
                type="email"
                placeholder="ornek@mail.com"
                autoComplete="email"
              />

              {/* Password Field */}
              <FormField
                label="Şifre"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />

              {/* Action Buttons */}
              <div className="pt-6 grid gap-4">
                
                {/* Login Button */}
                <button 
                  formAction={login}
                  type="submit"
                  className="group relative w-full py-4 rounded-lg bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold tracking-wide shadow-lg shadow-red-900/30 hover:shadow-red-900/60 transition-all transform hover:scale-[1.02] active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Giriş Yap
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>

                {/* Divider */}
                <Divider />

                {/* Signup Button */}
                <button 
                  formAction={signup}
                  type="submit"
                  className="group w-full py-3 rounded-lg border border-gray-600 text-gray-300 font-bold hover:bg-white/10 hover:text-white hover:border-gray-400 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Yeni Hesap Oluştur</span>
                </button>

              </div>
            </form>
          </Suspense>

          {/* Footer Quote */}
          <QuoteFooter />

        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center space-y-2 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <p className="text-xs text-gray-600">
            Giriş yaparak{' '}
            <a href="/terms" className="text-gray-400 hover:text-white underline transition-colors">
              Kullanım Şartları
            </a>
            {' '}ve{' '}
            <a href="/privacy" className="text-gray-400 hover:text-white underline transition-colors">
              Gizlilik Politikası
            </a>
            'nı kabul etmiş olursunuz.
          </p>
        </div>

      </div>
    </div>
  )
}