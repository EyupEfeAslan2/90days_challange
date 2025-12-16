export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
      {/* Yanıp Sönen Logo */}
      <h1 className="text-4xl font-black text-white tracking-tighter animate-pulse">
        90<span className="text-red-600">DAYS</span>
      </h1>
      
      {/* Yükleme Çubuğu */}
      <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 animate-[loading_1s_ease-in-out_infinite] w-1/2 rounded-full"></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}