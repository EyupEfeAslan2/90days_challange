import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deleteChallenge } from '@/app/actions' // <--- Action'ı import ettik

export default async function Home() {
  const supabase = await createClient()

  // Kullanıcıyı çek (Giriş yapmamışsa buton göstermeyebiliriz)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) return <div className="text-red-500 pt-32 text-center">Sistem Hatası.</div>

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 pt-32">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- BAŞLIK VE YENİ OLUŞTUR --- */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
                    MEYDAN <span className="text-red-600">OKU</span>
                </h1>
                <p className="text-gray-400 mt-2 text-sm md:text-base">
                    Sınırlarını zorla. Bir cephe seç veya kendin yarat.
                </p>
            </div>
            
            {user && (
              <Link 
                href="/create-challenge" 
                className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-2"
              >
                <span>+</span> YENİ CEPHE OLUŞTUR
              </Link>
            )}
        </div>

        {/* --- LİSTE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges?.map((challenge) => {
            // Kullanıcı bu challenge'ın sahibi mi?
            const isOwner = user && user.id === challenge.created_by

            return (
              <div key={challenge.id} className="group relative bg-gray-900/30 border border-gray-800 p-6 rounded-2xl hover:border-gray-600 transition flex flex-col justify-between">
                
                {/* Silme Butonu (Sadece Sahibi Görür) */}
                {isOwner && (
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <form action={deleteChallenge}>
                      <input type="hidden" name="challenge_id" value={challenge.id} />
                      <button 
                        type="submit"
                        className="p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition"
                        title="Bu cepheyi sil"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </form>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {challenge.description || 'Açıklama yok.'}
                  </p>
                  
                  <div className="text-xs font-mono text-gray-500 space-y-1 mb-6">
                    <div>BAŞLANGIÇ: {new Date(challenge.start_date).toLocaleDateString('tr-TR')}</div>
                    <div>BİTİŞ: {new Date(challenge.end_date).toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>

                <Link 
                  href={`/dashboard?id=${challenge.id}`}
                  className="w-full block text-center bg-gray-800 py-3 rounded-lg font-bold text-sm hover:bg-red-700 hover:text-white transition"
                >
                  CEPHYE KATIL
                </Link>
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}