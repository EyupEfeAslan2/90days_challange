import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto space-y-8">
        
        {/* Glitch Effect Text */}
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-700 to-black select-none opacity-50">
          404
        </h1>
        
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Hedef Saptanamadı
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Aradığın koordinatlarda herhangi bir veri akışı yok. Yanlış bir cephedesin veya bu görev iptal edildi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link 
            href="/"
            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Ana Üsse Dön
          </Link>
          <Link 
            href="/dashboard"
            className="px-8 py-3 border border-gray-800 text-gray-400 font-bold rounded-xl hover:text-white hover:border-gray-600 transition-colors"
          >
            Panele Git
          </Link>
        </div>

        <div className="pt-12 border-t border-gray-900 mt-12">
          <p className="text-xs text-gray-600 font-mono uppercase tracking-widest">
            HATA KODU: KAYIP_SİNYAL
          </p>
        </div>
      </div>
    </div>
  )
}