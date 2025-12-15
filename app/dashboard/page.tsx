import { createClient } from '@/utils/supabase/server'
import { submitDailyLog } from './actions'
import Link from 'next/link'
import ChallengeSelector from '@/components/ChallengeSelector'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="text-white p-10 pt-28">Giriş yapmalısın.</div>
  }

  const params = await searchParams
  const selectedId = params.id

  // 1. Kullanıcının katıldığı TÜM yarışmaları çek
  const { data: userChallenges } = await supabase
    .from('user_challenges')
    .select(`
      challenge_id,
      joined_at,
      challenges (
        id,
        title,
        description,
        start_date,
        end_date
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  if (!userChallenges || userChallenges.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 pt-28">
        <h1 className="text-3xl font-bold text-white mb-4">Henüz bir cephede değilsin.</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Veritabanında katıldığın bir yarışma bulunamadı.
        </p>
        <Link href="/" className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition hover:scale-105 shadow-lg shadow-red-900/20">
          Meydan Okuma Seç
        </Link>
      </div>
    )
  }

  // 2. Aktif Challenge'ı Bul
  let activeChallengeData = null
  if (selectedId) {
    activeChallengeData = userChallenges.find(uc => uc.challenge_id === selectedId)
  }
  
  if (!activeChallengeData) {
    activeChallengeData = userChallenges[0]
  }

  // --- DÜZELTME BURADA ---
  // TypeScript bazen challenges verisini dizi [] sanıyor. 
  // Garantiye alıp "Diziyse ilkini al, değilse kendisini al" diyoruz.
  const rawChallenge = activeChallengeData.challenges
  const challenge = Array.isArray(rawChallenge) ? rawChallenge[0] : rawChallenge

  // Veri hatası varsa patlamasın
  if (!challenge) return <div className="p-10 pt-28 text-white">Veri yüklenemedi.</div>
  // ----------------------

  // 3. Bugünün tarihini al
  const today = new Date().toISOString().split('T')[0]

  // 4. Günlük kontrolü
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('challenge_id', challenge.id) // Artık burası hata vermez
    .eq('log_date', today)
    .maybeSingle()

  return (
    <div className="min-h-screen text-white p-4 md:p-8 pt-24">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* --- YARIŞMA SEÇİCİ --- */}
        <div>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 ml-1">
             CEPHELER ({userChallenges.length})
           </p>
           {/* Typescript kızmasın diye any ile geçiyoruz, selector içinde hallediyor zaten */}
           <ChallengeSelector userChallenges={userChallenges as any} />
        </div>

        {/* --- ÜST BİLGİ KARTI --- */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-6 gap-4 animate-in fade-in duration-500">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">AKTİF GÖREV</span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-1">
              {challenge.title}
            </h1>
            <div className="flex gap-4 text-sm text-gray-500 mt-2 font-mono">
                <span>Başlangıç: {challenge.start_date}</span>
                <span>Bitiş: {challenge.end_date}</span>
            </div>
          </div>
          
          {todayLog ? (
            <div className="bg-green-900/20 border border-green-900 text-green-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_-5px_#22c55e]">
              ✓ Rapor Verildi
            </div>
          ) : (
            <div className="bg-red-900/20 border border-red-900 text-red-500 px-4 py-2 rounded-lg text-sm font-bold animate-pulse shadow-[0_0_15px_-5px_#dc2626]">
              ! Rapor Bekleniyor
            </div>
          )}
        </div>

        {/* --- MUHASEBE DEFTERİ (FORM) --- */}
        <form action={submitDailyLog} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <input type="hidden" name="challenge_id" value={challenge.id} />

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* SOL: İHMALLER */}
            <div className="group relative bg-gray-900/30 border border-gray-800 rounded-2xl p-6 hover:border-blue-900/50 transition-colors duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/50 rounded-l-2xl group-hover:bg-blue-500 transition-colors"></div>
              
              <label className="block text-lg font-bold text-blue-100 mb-2">
                İhmallerim <span className="text-gray-500 text-sm font-normal">(Yapmadıklarım)</span>
              </label>
              <textarea 
                name="omission"
                key={challenge.id + '-omission'} 
                defaultValue={todayLog?.sins_of_omission || ''}
                placeholder="- 30 dakika kitap okumadım.&#10;- Sabah erken kalkamadım."
                className="w-full h-40 bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition resize-none placeholder:text-gray-700"
              />
            </div>

            {/* SAĞ: GÜNAHLAR */}
            <div className="group relative bg-gray-900/30 border border-gray-800 rounded-2xl p-6 hover:border-red-900/50 transition-colors duration-300">
              <div className="absolute top-0 right-0 w-1 h-full bg-red-600/50 rounded-r-2xl group-hover:bg-red-500 transition-colors"></div>
              
              <label className="block text-lg font-bold text-red-100 mb-2">
                Hatalarım <span className="text-gray-500 text-sm font-normal">(Yaptıklarım)</span>
              </label>
              <textarea 
                name="commission"
                key={challenge.id + '-commission'}
                defaultValue={todayLog?.sins_of_commission || ''}
                placeholder="- Diyeti bozdum, şeker yedim.&#10;- Gereksiz yere sosyal medyada 2 saat harcadım."
                className="w-full h-40 bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-red-500 outline-none transition resize-none placeholder:text-gray-700"
              />
            </div>

          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 hover:scale-[1.02] transition-all shadow-lg shadow-white/10"
            >
              {todayLog ? 'Raporu Güncelle 📝' : 'Günü Tamamla ve Kaydet ✅'}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}