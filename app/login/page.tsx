import { login, signup } from './actions'

// Next.js 15/16'da searchParams bir Promise'dir, await edilmelidir.
interface LoginPageProps {
  searchParams: Promise<{ message?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // URL'deki hata mesajını yakala
  const { message } = await searchParams

  return (
    // fixed: Sayfayı viewport'a sabitle
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
      
      {/* --- ARKA PLAN (MORPHEUS) --- */}
      <div 
        className="absolute inset-0 z-0"
        style={{
            // Not: public klasöründe matrix-bg.png olduğundan emin ol, yoksa siyah kalır.
            backgroundImage: "url('/matrix-bg.png')", 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.35) blur(2px)'
        }}
      />

      {/* --- ORTA KUTU (FORM) --- */}
      <div className="relative z-10 w-full max-w-md px-4">
        
        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
          
          {/* Başlık */}
          <div className="text-center mb-6 space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
              90<span className="text-red-600">DAYS</span>
            </h1>
            <p className="text-gray-300 text-sm font-medium">
              İrade ve Disiplin Yönetimi
            </p>
          </div>

          {/* --- HATA MESAJI ALANI (YENİ) --- */}
          {message && (
            <div className="mb-6 bg-red-900/30 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm font-bold text-center animate-pulse shadow-[0_0_15px_-5px_#dc2626]">
              ⚠️ {message}
            </div>
          )}

          <form className="space-y-5">
            
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                E-Posta
              </label>
              <input
                name="email"
                type="email"
                placeholder="ornek@mail.com"
                required
                className="w-full bg-white/5 border border-gray-600 focus:border-red-600 rounded-lg p-3 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
              />
            </div>

            {/* Şifre */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Şifre
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-gray-600 focus:border-red-600 rounded-lg p-3 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
              />
            </div>

            {/* Butonlar */}
            <div className="pt-6 grid gap-4">
              
              {/* KIRMIZI BUTON (Giriş) */}
              <button 
                formAction={login} 
                className="w-full py-4 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold tracking-wide shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all transform hover:scale-[1.02]"
              >
                Giriş Yap
              </button>

              {/* ARA ÇİZGİ */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-700" />
                <span className="flex-shrink mx-4 text-gray-500 text-[10px] uppercase tracking-widest">
                  veya
                </span>
                <div className="flex-grow border-t border-gray-700" />
              </div>

              {/* MAVİ/GRİ BUTON (Kayıt) */}
              <button 
                formAction={signup} 
                className="w-full py-3 rounded-lg border border-gray-600 text-gray-300 font-bold hover:bg-white/10 hover:text-white hover:border-gray-400 transition-all text-sm"
              >
                Yeni Hesap Oluştur
              </button>

            </div>
          </form>

          {/* Alt Mesaj */}
          <p className="mt-8 text-center text-xs text-gray-500 italic opacity-80">
            "Sana sadece gerçeği vaat ediyorum, fazlasını değil."
          </p>

        </div>
      </div>
    </div>
  )
}