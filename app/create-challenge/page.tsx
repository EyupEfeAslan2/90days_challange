'use client' // useFormStatus kullanacağımız için Client Component yaptık

import { createChallenge } from './actions'
import { useFormStatus } from 'react-dom' // React DOM'dan bunu çekiyoruz

// 1. Önce butonu ayrı bir bileşen yapıyoruz
function SubmitButton() {
  const { pending } = useFormStatus() // Form gönderiliyor mu bilgisini verir

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`flex-[2] py-4 rounded-lg font-bold shadow-lg transition transform 
        ${pending 
          ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
          : 'bg-red-700 hover:bg-red-600 text-white hover:scale-[1.02] shadow-red-900/20'
        }`}
    >
      {pending ? 'OLUŞTURULUYOR... ⏳' : 'YARIŞMAYI BAŞLAT 🚀'}
    </button>
  )
}

// 2. Ana Sayfamız
export default function CreateChallengePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            YENİ <span className="text-red-600">CEPHE</span> AÇ
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Kendine ve diğerlerine meydan oku.
          </p>
        </div>

        {/* Form aksiyonunu buraya veriyoruz */}
        <form action={createChallenge} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Yarışma Adı</label>
            <input name="title" type="text" required placeholder="Örn: 90 Günlük Yazılım Kampı" className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-white focus:border-red-600 outline-none transition" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Açıklama</label>
            <textarea name="description" rows={4} placeholder="Kuralları buraya yaz..." className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-white focus:border-red-600 outline-none transition resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Başlangıç Tarihi</label>
              <input name="start_date" type="date" required className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-white focus:border-red-600 outline-none transition [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bitiş Tarihi</label>
              <input name="end_date" type="date" required className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-white focus:border-red-600 outline-none transition [color-scheme:dark]" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg border border-gray-800">
            <input type="checkbox" name="visibility" id="visibility" defaultChecked className="w-5 h-5 accent-red-600 rounded cursor-pointer" />
            <label htmlFor="visibility" className="cursor-pointer select-none">
              <span className="block font-bold text-sm">Herkese Açık Yayınla</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <a href="/" className="flex-1 py-4 text-center rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-400 font-bold transition">
              İptal
            </a>
            
            {/* Kendi yaptığımız butonu buraya koyuyoruz */}
            <SubmitButton />
          </div>

        </form>
      </div>
    </div>
  )
}