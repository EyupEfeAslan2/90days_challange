import Link from 'next/link'
import { createPost } from './actions'

export default function CreatePostPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 flex justify-center">
      <div className="w-full max-w-2xl">
        
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-4">
            <Link href="/feed" className="text-gray-500 hover:text-white transition text-sm font-bold">
              ← GERİ DÖN
            </Link>
            <h1 className="text-2xl font-black tracking-tight">YENİ KONU BAŞLAT</h1>
        </div>

        {/* FORM */}
        <form action={createPost} className="space-y-6 bg-gray-900/30 p-8 rounded-2xl border border-gray-800 shadow-2xl">
            
            {/* BAŞLIK */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Konu Başlığı</label>
                <input 
                    name="title"
                    type="text" 
                    placeholder="Örn: 30. Günde yaşadığım zorluklar..." 
                    required
                    className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition text-lg font-bold placeholder:text-gray-600"
                />
            </div>

            {/* İÇERİK */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">İçerik</label>
                <textarea 
                    name="content"
                    placeholder="Tecrübelerini ve sorularını buraya yaz..." 
                    required
                    rows={8}
                    className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition resize-none placeholder:text-gray-600 leading-relaxed"
                />
            </div>

            {/* BUTON */}
            <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition transform active:scale-95 shadow-lg"
                >
                    YAYINLA 🚀
                </button>
            </div>

        </form>

      </div>
    </div>
  )
}