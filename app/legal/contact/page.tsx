import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Arkaplan Efekti */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        
        <h1 className="text-5xl font-black tracking-tighter mb-2">BİZE ULAŞIN</h1>
        <p className="text-gray-400 text-lg">
          Sorular, iş birlikleri veya teknik destek için mail yoluyla iletişime geçin.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-12">
          
          {/* Email Kartı */}
          <div className="bg-[#0f1115] border border-gray-800 p-8 rounded-2xl hover:border-gray-600 transition group">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition">
              ✉️
            </div>
            <h3 className="font-bold mb-2">E-Posta</h3>
            <p className="text-gray-500 text-xs mb-4">Genel sorular ve destek</p>
            <a href="mailto:info@90days.com.tr" className="text-indigo-400 font-bold hover:text-white transition">
              aslaneyupefe@gmail.com
            </a>
          </div>

          {/* Sosyal Medya / Destek Kartı */}
          <div className="bg-[#0f1115] border border-gray-800 p-8 rounded-2xl hover:border-gray-600 transition group">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition">
              💬
            </div>
            <h3 className="font-bold mb-2">Öneri & Geri Bildirim</h3>
            <p className="text-gray-500 text-xs mb-4">Giriş yaptıktan sonra</p>
            <span className="text-gray-400 font-medium text-sm">
              Sağ alttaki kutuyu kullan
            </span>
          </div>

        </div>

        <div className="pt-12">
           <Link href="/" className="text-gray-500 hover:text-white transition underline decoration-gray-800 underline-offset-4">
             ← Ana Sayfaya Dön
           </Link>
        </div>

      </div>
    </div>
  )
}