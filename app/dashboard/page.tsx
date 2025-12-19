import { createClient } from '@/utils/supabase/server'
// Action importu
import { submitDailyLog, leaveChallenge } from '../actions' 
import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
// DeleteButton importu eklendi
import DeleteButton from '@/components/DeleteButton' 

// --- TYPES & INTERFACES ---
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
  challenges: Challenge | Challenge[] | null
}

interface DailyLog {
  id: string
  sins_of_omission: string | null
  sins_of_commission: string | null
  is_completed: boolean
}

// --- UTILITY FUNCTIONS ---
const normalizeChallenge = (data: Challenge | Challenge[] | null): Challenge | null => {
  if (!data) return null
  if (Array.isArray(data)) return data[0] || null
  return data
}

const calculateStreakPercentage = (logCount: number, maxDays: number = 90): number => {
  return Math.min((logCount / maxDays) * 100, 100)
}

// --- LOCAL COMPONENTS ---

// 1. Sidebar Item (GÜNCELLENDİ: Çıkış Butonu Buraya Eklendi)
const DashboardSidebarItem = ({ challenge, isActive }: { challenge: Challenge; isActive: boolean }) => (
  <div className="relative group">
    {/* Kart Linki */}
    <Link 
      href={`/dashboard?id=${challenge.id}`}
      className={`
        relative block p-4 rounded-xl border transition-all duration-300 overflow-hidden
        ${isActive 
          ? 'bg-gradient-to-r from-red-900/40 to-black border-red-800 shadow-[0_0_15px_-5px_#991b1b]' 
          : 'bg-gray-900/40 border-gray-800 hover:border-gray-600 hover:bg-gray-800/60'
        }
      `}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1 min-w-0 pr-6"> {/* Buton için sağdan boşluk bıraktık */}
          <h3 className={`font-bold truncate text-sm ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
            {challenge.title}
          </h3>
          <p className="text-[10px] text-gray-500 mt-1 font-mono uppercase tracking-wide">
            Bitiş: {new Date(challenge.end_date).toLocaleDateString('tr-TR')}
          </p>
        </div>
        {isActive && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444] flex-shrink-0 mt-1" />
        )}
      </div>
      {/* Hover Efekti */}
      {!isActive && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
    </Link>

    {/* SİLME BUTONU (Sadece Hover Yapınca Gözükür) */}
    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <DeleteButton 
            onDelete={async () => {
               'use server'
               await leaveChallenge(challenge.id)
            }}
            title="" // Tooltip veya boş bırakabilirsin, icon yeterli
            className="w-6 h-6 p-0 flex items-center justify-center bg-black/50 hover:bg-red-900 text-gray-400 hover:text-white border border-gray-700 hover:border-red-500 rounded-full backdrop-blur-md"
        />
    </div>
  </div>
)

// 2. Stats Panel
const StatsPanel = ({ myLogCount, totalParticipants, activeToday }: { myLogCount: number; totalParticipants: number; activeToday: number }) => {
  const streakPercentage = calculateStreakPercentage(myLogCount)
  
  return (
    <div className="sticky top-32 space-y-4 animate-in slide-in-from-left duration-700">
      <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">
          OPERASYON VERİLERİ
        </h2>
        
        <div className="mb-8 text-center">
          <div className="inline-flex items-baseline gap-2">
            <span className="text-5xl font-black text-white tracking-tighter">{myLogCount}</span>
            <span className="text-sm font-bold text-gray-500 uppercase">Gün</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Disiplin Sürekliliği</p>
          
          <div className="mt-4 w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 ease-out shadow-[0_0_10px_#ef4444]"
              style={{ width: `${streakPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 rounded-xl p-3 text-center border border-gray-800">
            <div className="text-xl font-bold text-white">{totalParticipants}</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide font-bold mt-1">Toplam Üye</div>
          </div>
          <div className="bg-black/40 rounded-xl p-3 text-center border border-gray-800">
            <div className="text-xl font-bold text-green-500">{activeToday}</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide font-bold mt-1">Bugün Aktif</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 3. Daily Log Form (GÜNCELLENDİ: Buradaki Çıkış Butonu Kaldırıldı)
const DailyLogForm = ({ challenge, todayLog }: { challenge: Challenge; todayLog: DailyLog | null }) => {
  const isCompleted = todayLog?.is_completed
  
  return (
    <div className="bg-[#0f1115] border border-gray-800 rounded-3xl p-6 md:p-10 relative overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8 border-b border-gray-800 pb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight mb-2">
              {challenge.title}
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
              {challenge.description || "Disiplin, anlık arzular ile nihai hedeflerin arasındaki köprüdür."}
            </p>
          </div>
          
          {/* DURUM BADGE */}
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-lg whitespace-nowrap
            ${isCompleted 
              ? 'bg-green-900/20 border-green-900/50 text-green-500' 
              : 'bg-red-900/20 border-red-900/50 text-red-500 animate-pulse'
            }
          `}>
            <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-red-500'}`} />
            {isCompleted ? 'GÜNLÜK RAPOR TAMAM' : 'RAPOR BEKLENİYOR'}
          </div>
        </div>

        <form action={submitDailyLog} className="space-y-8">
          <input type="hidden" name="challenge_id" value={challenge.id} />
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> 
                İhmaller (Yapmadıklarım)
              </label>
              <div className="relative group">
                <textarea 
                  name="omission"
                  key={`${challenge.id}-omission`}
                  defaultValue={todayLog?.sins_of_omission || ''}
                  placeholder="Bugün planlayıp da gerçekleştirmediğin görevler nelerdi?"
                  className="w-full h-48 bg-black/40 border border-gray-800 rounded-xl p-5 text-white placeholder:text-gray-600 focus:border-blue-600 focus:ring-1 focus:ring-blue-900 outline-none transition resize-none leading-relaxed text-sm"
                />
                <div className="absolute inset-0 rounded-xl border border-blue-500/0 group-hover:border-blue-500/10 pointer-events-none transition" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> 
                Engeller (Yaptıklarım)
              </label>
              <div className="relative group">
                <textarea 
                  name="commission"
                  key={`${challenge.id}-commission`}
                  defaultValue={todayLog?.sins_of_commission || ''}
                  placeholder="Sürecine zarar veren, iradeni kıran hangi eylemleri yaptın?"
                  className="w-full h-48 bg-black/40 border border-gray-800 rounded-xl p-5 text-white placeholder:text-gray-600 focus:border-red-600 focus:ring-1 focus:ring-red-900 outline-none transition resize-none leading-relaxed text-sm"
                />
                <div className="absolute inset-0 rounded-xl border border-red-500/0 group-hover:border-red-500/10 pointer-events-none transition" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-gray-800">
            <button 
              type="submit" 
              className="group relative bg-white text-black px-8 py-4 rounded-xl font-bold text-sm overflow-hidden hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <div className="absolute inset-0 bg-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                {isCompleted ? 'GÜNCELLE' : 'RAPORU KAYDET'} 
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --- MAIN PAGE ---

async function DashboardPage({ searchParams }: { searchParams: Promise<any> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile?.username) redirect('/onboarding')

  // Next.js 15+ için await ediyoruz
  const params = await searchParams
  const selectedId = params?.id
  const today = new Date().toISOString().split('T')[0]

  const { data: rawUserChallenges, error } = await supabase
    .from('user_challenges')
    .select(`
      challenge_id, 
      joined_at, 
      challenges (id, title, description, start_date, end_date)
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  const userChallenges = (rawUserChallenges as unknown as UserChallenge[]) || []

  if (error || userChallenges.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 pt-32 text-white bg-black">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 text-4xl grayscale">
          📭
        </div>
        <h1 className="text-3xl font-black mb-3">Henüz Bir Hedefin Yok</h1>
        <p className="text-gray-500 mb-8 max-w-md">Aktif bir sürecin bulunmuyor. Kendine uygun bir hedef seç ve disiplini başlat.</p>
        <Link href="/" className="bg-red-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-600 transition shadow-[0_0_20px_-5px_#dc2626]">
          YENİ HEDEF SEÇ +
        </Link>
      </div>
    )
  }

  let activeData = userChallenges[0]
  if (selectedId) {
    const found = userChallenges.find(uc => uc.challenge_id === selectedId)
    if (found) activeData = found
  }
  
  const challenge = normalizeChallenge(activeData.challenges)
  
  if (!challenge) {
    return <div className="min-h-screen pt-32 text-center text-red-500 font-bold">Hedef verisi yüklenemedi.</div>
  }

  const isFuture = new Date(challenge.start_date) > new Date(today)

  const [
    statsResponse,
    todayStatsResponse,
    myLogResponse,
    todayLogResponse
  ] = await Promise.all([
    supabase.from('user_challenges').select('*', { count: 'exact', head: true }).eq('challenge_id', challenge.id),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('challenge_id', challenge.id).eq('log_date', today),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('challenge_id', challenge.id),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('challenge_id', challenge.id).eq('log_date', today).maybeSingle()
  ])

  const totalParticipants = statsResponse.count || 0
  const activeToday = todayStatsResponse.count || 0
  const myLogCount = myLogResponse.count || 0
  const todayLog = todayLogResponse.data

  return (
    <div className="min-h-screen text-white p-4 md:p-8 pt-32 pb-20 selection:bg-red-900 selection:text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <aside className="lg:col-span-4 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">HEDEFLERİM</h2>
            <Link href="/" className="text-[10px] bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition font-bold">
              + YENİ
            </Link>
          </div>
          
          <nav className="flex flex-col gap-3">
            {userChallenges.map((uc) => {
              const c = normalizeChallenge(uc.challenges)
              if (!c) return null
              return <DashboardSidebarItem key={c.id} challenge={c} isActive={c.id === challenge.id} />
            })}
          </nav>

          <StatsPanel 
            myLogCount={myLogCount} 
            totalParticipants={totalParticipants} 
            activeToday={activeToday} 
          />
        </aside>

        <main className="lg:col-span-8">
          <Suspense fallback={<div className="text-gray-500 py-20 text-center animate-pulse">Veriler şifreleniyor...</div>}>
            {isFuture ? (
              <div className="bg-[#0f1115] border border-yellow-900/30 rounded-3xl p-10 text-center relative overflow-hidden animate-in fade-in duration-700">
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-600 shadow-[0_0_15px_#ca8a04]"></div>
                  <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-4xl">
                     ⏳
                  </div>
                  <h2 className="text-3xl font-black text-white mb-4 tracking-tight">HAZIRLIK AŞAMASI</h2>
                  <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                    Bu operasyon henüz başlamadı. Enerjini sakla ve başlangıç tarihine odaklan.
                  </p>
                  <div className="inline-block bg-yellow-900/10 text-yellow-500 px-8 py-4 rounded-xl font-mono text-xl font-bold border border-yellow-900/40 shadow-lg">
                     BAŞLANGIÇ: {new Date(challenge.start_date).toLocaleDateString('tr-TR')}
                  </div>
              </div>
            ) : (
              <DailyLogForm challenge={challenge} todayLog={todayLog as DailyLog | null} />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage