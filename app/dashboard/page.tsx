import { createClient } from '@/utils/supabase/server'
import { submitDailyLog } from './actions'
import Link from 'next/link'
import { Suspense } from 'react'

// --- TİPLER ---
interface Challenge {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
}

interface UserChallenge {
  challenge_id: string
  joined_at: string
  challenges: Challenge | Challenge[]
}

interface DailyLog {
  sins_of_omission: string | null
  sins_of_commission: string | null
}

// --- YARDIMCI FONKSİYONLAR ---
const normalizeChallenge = (challenges: Challenge | Challenge[]): Challenge | null => {
  return Array.isArray(challenges) ? challenges[0] : challenges
}

const calculateStreakPercentage = (logCount: number, maxDays: number = 90): number => {
  return Math.min((logCount / maxDays) * 100, 100)
}

// --- ALT BİLEŞENLER ---
const ChallengeCard = ({ challenge, isActive }: { challenge: Challenge; isActive: boolean }) => (
  <Link 
    href={`/dashboard?id=${challenge.id}`}
    className={`
      group relative p-4 rounded-xl border transition-all duration-300
      ${isActive 
        ? 'bg-gradient-to-r from-red-900/40 to-black border-red-800 shadow-[0_0_15px_-5px_#991b1b]' 
        : 'bg-gray-900/40 border-gray-800 hover:border-gray-600 hover:bg-gray-800/60'
      }
    `}
  >
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <h3 className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
          {challenge.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-mono">
          Hedef: {challenge.end_date}
        </p>
      </div>
      {isActive && (
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444] flex-shrink-0 ml-2" />
      )}
    </div>
  </Link>
)

const StatsPanel = ({ myLogCount, totalParticipants, activeToday }: { myLogCount: number; totalParticipants: number; activeToday: number }) => {
  const streakPercentage = calculateStreakPercentage(myLogCount)
  
  return (
    <div className="sticky top-32 space-y-4">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">SAHA VERİLERİ</h2>
        
        <div className="mb-6">
          <div className="text-4xl font-black text-white">
            {myLogCount} <span className="text-lg font-medium text-gray-600">Gün</span>
          </div>
          <div className="text-sm text-gray-400 mb-2">Kişisel Başarı Serisi</div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700 ease-out"
              style={{ width: `${streakPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
          <div>
            <div className="text-2xl font-bold text-white">{totalParticipants}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Toplam Katılım</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{activeToday}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Bugün Aktif</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DailyLogForm = ({ challenge, todayLog }: { challenge: Challenge; todayLog: DailyLog | null }) => (
  <div className="bg-gray-900/20 border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

    <div className="relative z-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-black text-white tracking-tight">{challenge.title}</h1>
          <p className="text-gray-400 mt-2 text-sm max-w-lg">{challenge.description || "Disiplin özgürlüktür."}</p>
        </div>
        <div className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border ${todayLog ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse'}`}>
          {todayLog ? '● RAPOR İŞLENDİ' : '● RAPOR BEKLENİYOR'}
        </div>
      </div>

      <form action={submitDailyLog} className="space-y-6">
        <input type="hidden" name="challenge_id" value={challenge.id} />
        <div className="grid gap-6">
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-blue-200 mb-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full" /> İhmaller (Yapmadıklarım)
            </label>
            <textarea 
              name="omission"
              key={`${challenge.id}-omission`}
              defaultValue={todayLog?.sins_of_omission || ''}
              placeholder="Planlayıp da yapmadığın ne var?"
              className="w-full h-32 bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none"
            />
          </div>
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-red-200 mb-3">
              <span className="w-2 h-2 bg-red-500 rounded-full" /> Hatalar (Yaptıklarım)
            </label>
            <textarea 
              name="commission"
              key={`${challenge.id}-commission`}
              defaultValue={todayLog?.sins_of_commission || ''}
              placeholder="İradene yenik düşüp ne yaptın?"
              className="w-full h-32 bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-white/5 mt-4">
          <button type="submit" className="bg-white text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.02]">
            {todayLog ? 'GÜNCELLE' : 'RAPORU TAMAMLA'}
          </button>
        </div>
      </form>
    </div>
  </div>
)

// --- ANA SAYFA ---
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-white">Giriş Yapmalısın</div>
  }

  const params = await searchParams
  const selectedId = params.id
  const today = new Date().toISOString().split('T')[0]

  const { data: userChallenges, error } = await supabase
    .from('user_challenges')
    .select(`challenge_id, joined_at, challenges (id, title, description, start_date, end_date)`)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  if (error || !userChallenges || userChallenges.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 pt-32">
        <h1 className="text-3xl font-bold text-white mb-4">Aktif Bir Operasyon Yok</h1>
        <Link href="/" className="bg-red-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-600 transition">Yeni Cephe Seç</Link>
      </div>
    )
  }

  let activeData = userChallenges[0]
  if (selectedId) {
    const found = userChallenges.find(uc => uc.challenge_id === selectedId)
    if (found) activeData = found
  }
  
  const challenge = normalizeChallenge(activeData.challenges)
  if (!challenge) return <div>Veri Hatası</div>

  // Paralel Veri Çekme
  const [
    { count: totalParticipants },
    { count: activeToday },
    { count: myLogCount },
    { data: todayLog }
  ] = await Promise.all([
    supabase.from('user_challenges').select('*', { count: 'exact', head: true }).eq('challenge_id', challenge.id),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('challenge_id', challenge.id).eq('log_date', today),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('challenge_id', challenge.id),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('challenge_id', challenge.id).eq('log_date', today).maybeSingle()
  ])

  return (
    // DÜZELTME: pt-24 yerine pt-32 yaptık.
    <div className="min-h-screen text-white p-4 md:p-8 pt-32 pb-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">GÖREV DOSYALARI</h2>
            <Link href="/" className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300 hover:bg-white/20 transition">+ YENİ EKLE</Link>
          </div>
          <nav className="flex flex-col gap-3">
            {userChallenges.map((uc) => {
              const c = normalizeChallenge(uc.challenges)
              if (!c) return null
              return <ChallengeCard key={c.id} challenge={c} isActive={c.id === challenge.id} />
            })}
          </nav>
          <StatsPanel myLogCount={myLogCount ?? 0} totalParticipants={totalParticipants ?? 0} activeToday={activeToday ?? 0} />
        </aside>

        <main className="lg:col-span-8">
          <Suspense fallback={<div className="text-gray-400">Yükleniyor...</div>}>
            <DailyLogForm challenge={challenge} todayLog={todayLog} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}