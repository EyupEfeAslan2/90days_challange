export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-6">
        
        {/* Logo Animation */}
        <div className="relative">
          <h1 className="text-5xl font-black text-white tracking-tighter animate-pulse">
            90<span className="text-red-600">DAYS</span>
          </h1>
          <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full animate-pulse opacity-50" />
        </div>
        
        {/* Custom Progress Bar */}
        <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-red-600 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
        
        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest animate-pulse">
          Sistem Yükleniyor...
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}