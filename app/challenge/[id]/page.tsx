import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { joinChallenge, leaveChallenge, postChallengeComment } from '@/app/actions'

// --- TYPES ---
interface ChallengeStatus {
  currentDay: number
  totalDays: number
  progress: number
  daysLeft: number
  isStarted: boolean
  isEnded: boolean
}

// --- UTILITY: Zaman Hesaplama ---
const calculateStatus = (start: string, end: string): ChallengeStatus => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const now = new Date()
  
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (86400000)))
  const diffTime = Math.abs(now.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (86400000))

  const isStarted = now >= startDate
  const isEnded = now > endDate

  let currentDay = isStarted ? diffDays : 0
  if (currentDay > totalDays) currentDay = totalDays

  const progress = Math.min(100, Math.round((currentDay / totalDays) * 100))
  const daysLeft = totalDays - currentDay

  return { currentDay, totalDays, progress, daysLeft, isStarted, isEnded }
}

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // UUID Regex Kontrolü
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    console.error("Geçersiz UUID formatı:", id)
    return notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Önce Challenge'ı tek başına çek
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (challengeError || !challenge) {
    console.error("Challenge Çekme Hatası:", challengeError)
    return notFound()
  }

  // 2. Şimdi Challenge'ın sahibini ve diğer verileri paralel çek
  const [
    ownerProfileResponse,
    participationResponse,
    statsResponse,
    commentsResponse
  ] = await Promise.all([
    supabase.from('profiles').select('username').eq('id', challenge.created_by).single(),
    user ? supabase.from('user_challenges').select('id').eq('user_id', user.id).eq('challenge_id', id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('user_challenges').select('*', { count: 'exact', head: true }).eq('challenge_id', id),
    supabase.from('challenge_comments').select('*, profiles(username, avatar_url)').eq('challenge_id', id).order('created_at', { ascending: false })
  ])

  const ownerName = ownerProfileResponse.data?.username || 'Anonim'
  const isJoined = !!participationResponse.data
  const totalParticipants = statsResponse.count || 0
  const comments = commentsResponse.data || []
  
  const status = calculateStatus(challenge.start_date, challenge.end_date)

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pt-36 pb-18 font-sans flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-5">
        
        {/* NAV */}
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white transition gap-3 text-xs font-bold uppercase tracking-wider mb-3">
            <span>←</span> Listeye Dön
        </Link>

        {/* --- ANA KART --- */}
        <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-6 relative overflow-hidden shadow-2xl">
            {/* Arkaplan Efekti (Daha soft) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-900/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
                {/* Başlık */}
                <div className="mb-6 border-b border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{challenge.title}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs font-mono text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-600 uppercase font-bold tracking-wide">Oluşturan:</span>
                            <span className="text-indigo-400 font-medium">@{ownerName}</span>
                        </div>
                        <div className="hidden sm:block w-1 h-1 bg-gray-800 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <span>{new Date(challenge.start_date).toLocaleDateString('tr-TR')}</span>
                            <span className="text-gray-700">|</span>
                            <span>{new Date(challenge.end_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                    </div>
                </div>

                {/* İlerleme Durumu */}
                <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-2">
                         <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">{status.currentDay}</span>
                            <span className="text-sm text-gray-500 font-medium">/ {status.totalDays} gün</span>
                        </div>
                        <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${status.isEnded ? 'text-red-500 border-red-900/30 bg-red-900/10' : 'text-green-500 border-green-900/30 bg-green-900/10'}`}>
                            {status.isEnded ? 'Süreç Tamamlandı' : 'Aktif Süreç'}
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800/50">
                        <div 
                            className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)] transition-all duration-1000" 
                            style={{ width: `${status.progress}%` }} 
                        />
                    </div>
                    <div className="text-right text-[10px] font-bold text-gray-600 mt-1.5 uppercase tracking-wide">
                        %{status.progress} Tamamlandı
                    </div>
                </div>

                {/* Aksiyon Butonları */}
                {isJoined ? (
                    <div className="flex gap-3">
                        <Link 
                            href={`/dashboard?id=${challenge.id}`}
                            className="flex-1 bg-white text-black hover:bg-gray-200 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-white/5"
                        >
                            <span>⚡</span> Panele Git (Raporla)
                        </Link>
                        <form action={async () => { 'use server'; await leaveChallenge(challenge.id) }}>
                            <button className="h-full px-4 rounded-lg border border-red-900/30 text-red-600 hover:bg-red-900/10 hover:text-red-500 transition text-xs font-bold uppercase tracking-wider" title="Ayrıl">
                                Ayrıl
                            </button>
                        </form>
                    </div>
                ) : (
                    <form action={async () => { 'use server'; await joinChallenge(challenge.id) }}>
                        <button disabled={status.isEnded} className="w-full bg-indigo-600 text-white hover:bg-indigo-500 py-3.5 rounded-lg font-bold text-sm shadow-lg shadow-indigo-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {status.isEnded ? 'Bu Hedef Tamamlandı' : 'Bu Hedefe Katıl'}
                        </button>
                    </form>
                )}
            </div>
        </div>

        {/* --- İSTATİSTİKLER --- */}
        <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                📊 Süreç İstatistikleri
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-black/40 border border-gray-800 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-white">{totalParticipants}</div>
                    <div className="text-[9px] font-bold text-gray-600 uppercase mt-1">Katılımcı</div>
                </div>
                <div className="bg-black/40 border border-gray-800 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-white">{status.daysLeft}</div>
                    <div className="text-[9px] font-bold text-gray-600 uppercase mt-1">Kalan Gün</div>
                </div>
                 <div className="hidden md:block bg-black/40 border border-gray-800 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-gray-500">-</div>
                    <div className="text-[9px] font-bold text-gray-600 uppercase mt-1">Fire Yok</div>
                </div>
            </div>
        </div>

        {/* --- FORUM --- */}
        <div className="bg-[#0f1115] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                💬 Tartışma & Motivasyon <span className="text-xs font-normal text-gray-500">({comments.length})</span>
            </h3>

            {user && isJoined && (
                <div className="mb-6">
                    <form action={postChallengeComment} className="flex gap-2">
                        <input type="hidden" name="challenge_id" value={challenge.id} />
                        <div className="relative flex-1">
                            <input 
                                name="content" 
                                placeholder="Düşüncelerini paylaş..." 
                                className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-900 outline-none transition placeholder:text-gray-600"
                                required 
                                autoComplete="off"
                            />
                        </div>
                        <button className="bg-gray-800 hover:bg-gray-700 text-white px-5 rounded-lg text-xs font-bold uppercase tracking-wide transition">
                            Gönder
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-black/20 border border-gray-800/40">
                        <div className="w-8 h-8 rounded-full bg-indigo-900/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold shrink-0">
                            {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-indigo-300 text-xs truncate">@{comment.profiles?.username || 'Anonim'}</span>
                                <span className="text-[9px] text-gray-600 font-mono">{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-snug break-words">{comment.content}</p>
                        </div>
                    </div>
                ))}
                
                {comments.length === 0 && (
                     <div className="text-center py-6 text-gray-600 text-xs italic">Henüz bir paylaşım yapılmadı.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}