import Link from 'next/link'
import { createPost } from './actions' // <--- Yeni dosyadan çağırdık

export default function CreatePostPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 flex justify-center">
      <div className="w-full max-w-2xl">
        
        <div className="mb-8 flex items-center gap-4">
            <Link href="/feed" className="text-gray-500 hover:text-white transition">← Geri Dön</Link>
            <h1 className="text-2xl font-black">YENİ KONU BAŞLAT</h1>
        </div>

        {/* Action artık dışarıdan geliyor, burası hata vermez */}
        <form action={createPost} className="space-y-6 bg-gray-900/30 p-8 rounded-2xl border border-gray-800">
            
            {/* Başlık */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Konu Başlığı</label>
                <input 
                    name="title"
                    type="text" 
                    placeholder="Örn: 30. Günde yaşadığım zorluklar..." 
                    required
                    className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition text-lg font-bold"
                />
            </div>

            {/* İçerik */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">İçerik</label>
                <textarea 
                    name="content"
                    placeholder="Düşüncelerini buraya dök asker..." 
                    required
                    rows={8}
                    className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition resize-none"
                />
            </div>

            {/* Buton */}
            <div className="flex justify-end pt-4">
                <button type="submit" className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition transform hover:scale-105">
                    YAYINLA 🚀
                </button>
            </div>

        </form>

      </div>
    </div>
  )
}