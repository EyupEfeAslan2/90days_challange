import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { joinChallenge } from './actions'

// Next.js 15+ için params Promise olarak gelir
export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Yarışma verisini çek
  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !challenge) {
    notFound()
  }

  // 2. Kullanıcı katılmış mı?
  let isJoined = false
  if (user) {
    const { data: participation } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', id)
      .single()
    isJoined = !!participation
  }

  // --- İSTATİSTİK HESAPLAMALARI ---

  // A. Toplam Katılımcı Sayısı (user_challenges tablosunu say)
  const { count: totalParticipants } = await supabase
    .from('user_challenges')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', id)

  // B. Bugün Rapor Verenler (Aktif/Canlı Savaşçılar)
  const today = new Date().toISOString().split('T')[0]
  const { count: activeToday } = await supabase
    .from('daily_logs')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', id)
    .eq('log_date', today)

  // C. Kaçıncı Gün?
  const startDate = new Date(challenge.start_date)
  const endDate = new Date(challenge.end_date)
  const now = new Date()
  
  // Yarışma başladı mı?
  let currentDay = 0
  let statusText = "Bekleniyor"
  let statusColor = "text-yellow-500"

  if (now < startDate) {
    currentDay = 0 // Henüz başlamadı
    statusText = "Başlamadı"
  } else if (now > endDate) {
    currentDay = 90 // Bitti (veya hesaplanan gün)
    statusText = "Tamamlandı"
    statusColor = "text-gray-500"
  } else {
    // Farkı gün cinsinden hesapla (+1 ekle çünkü 1. gün)
    const diffTime = Math.abs(now.getTime() - startDate.getTime())
    currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
    statusText = "Aktif Operasyon"
    statusColor = "text-green-500"
  }

  // Hesaplanamayan değerler için 0 ata
  const stats = {
    total: totalParticipants || 0,
    active: activeToday || 0,
    dropped: (totalParticipants || 0) - (activeToday || 0) // Girmeyenler
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-28">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigasyon */}
        <div className="flex justify-between items-center">
          <Link href="/" className="text-gray-500 hover:text-white transition flex items-center gap-2 text-sm font-bold">
            ← LİSTEYE DÖN
          </Link>
          <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded border border-gray-800 ${statusColor}`}>
            ● {statusText}
          </div>
        </div>

        {/* --- ANA KART --- */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          {/* Arka plan efekti */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="relative z-10">
             <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter mb-4">
               {challenge.title}
             </h1>
             
             <div className="flex flex-wrap gap-6 text-sm text-gray-400 font-mono mb-6 border-b border-gray-800 pb-6">
               <div className="flex items-center gap-2">
                 <span>🚀 Başlangıç:</span>
                 <span className="text-white">{challenge.start_date}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span>🏁 Bitiş:</span>
                 <span className="text-white">{challenge.end_date}</span>
               </div>
             </div>

             <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
               {challenge.description || "Bu cephe için henüz istihbarat raporu girilmedi. Kurallar basit: Disiplinli ol, ölme."}
             </p>

             {/* Aksiyon Alanı */}
             <div className="mt-10">
                {isJoined ? (
                   <Link 
                     href="/dashboard"
                     className="inline-flex items-center gap-2 bg-green-600/10 border border-green-600/50 text-green-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:text-white transition-all w-full md:w-auto justify-center"
                   >
                    ✅ Cephedesin (Rapor Ver)
                   </Link>
                ) : (
                  <form action={joinChallenge}>
                     <input type="hidden" name="challenge_id" value={challenge.id} />
                     <button 
                       type="submit"
                       className="bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] w-full md:w-auto hover:scale-105"
                     >
                        CEPHEYE KATIL
                     </button>
                  </form>
                )}
             </div>
          </div>
        </div>

        {/* --- İSTATİSTİK KARTI --- */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            📊 Operasyon İstatistikleri
            <span className="text-sm font-normal text-gray-500">(Gün {currentDay}/90)</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-4xl font-extrabold text-white mb-2">{stats.total}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Toplam Savaşçı</div>
            </div>
            
            <div className="bg-gray-950 border border-green-900/30 rounded-xl p-6 text-center">
              <div className="text-4xl font-extrabold text-green-500 mb-2">{stats.active}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Bugün Aktif</div>
            </div>
            
            <div className="bg-gray-950 border border-red-900/30 rounded-xl p-6 text-center">
              <div className="text-4xl font-extrabold text-red-500 mb-2">{stats.dropped}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Kayıp Verdi</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}