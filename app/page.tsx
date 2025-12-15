import { createClient } from '@/utils/supabase/server'
import ChallengeList from '@/components/ChallengeList'
import { Suspense } from 'react'

export default async function Home() {
  const supabase = await createClient()

  // Giriş yapmış kullanıcıyı kontrol et (Opsiyonel: Eğer giriş zorunluysa)
  const { data: { user } } = await supabase.auth.getUser()

  // Tüm Challenge'ları çek (Sıralama: En yeniden eskiye)
  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) {
    console.error("Veri çekme hatası:", error)
    return <div className="text-red-500">Bir hata oluştu.</div>
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Başlık Alanı */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white">
                    MEYDAN <span className="text-red-600">OKU</span>
                </h1>
                <p className="text-gray-400 mt-2">
                    {user ? `Hoş geldin, asker.` : 'Sınırlarını zorla, iradeni test et.'}
                </p>
            </div>
            {/* Profil Avatarı vs buraya gelebilir */}
        </div>

        {/* Challenge Listesi Bileşeni */}
        <Suspense fallback={<div className="text-center text-gray-500">Yükleniyor...</div>}>
            <ChallengeList challenges={challenges || []} />
        </Suspense>

      </div>
    </main>
  )
}