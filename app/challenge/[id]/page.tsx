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

// --- UTILITY ---
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
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) return notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (challengeError || !challenge) return notFound()

  const [
    ownerProfileResponse,
    participationResponse,
    statsResponse,
    commentsResponse
  ] = await Promise.all([
    supabase.from('profiles').select('username').eq('id', challenge.created_by).single(),
    user ? supabase.from('user_challenges').select('id').eq('user_id', user.id).eq('challenge_id', id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('user_challenges').select('*', { count: 'exact', head: true }).eq('challenge_id', id),
    // FIX: 'challenge_comments' tablosu type dosyasında olmadığı için 'as any' ekledik
    supabase.from('challenge_comments' as any).select('*, profiles(username, avatar_url)').eq('challenge_id', id).order('created_at', { ascending: false })
  ])

  const ownerName = ownerProfileResponse.data?.username || 'Anonim'
  const isJoined = !!participationResponse.data
  const totalParticipants = statsResponse.count || 0
  const comments = commentsResponse.data || []
  
  const status = calculateStatus(challenge.start_date, challenge.end_date)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 pb-20 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* NAV */}
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white transition gap-2 text-sm font-bold mb-4">
            <span>←</span> LİSTEYE DÖN
        </Link>

        {/* --- ANA KART --- */}
        <div className="bg-[#0f1115] border border-gray-800 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10">
                {/* Başlık */}
                <div className="mb-8 border-b border-gray-800 pb-6">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-[0.9]">{challenge.title}</h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-6 text-sm font-mono text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 uppercase font-bold tracking-widest text-xs">OLUŞTURAN</span>
                            <span className="text-indigo-400 font-bold">@{ownerName}</span>
                        </div>
                        <div className="hidden md:block w-1 h-8 bg-gray-800"></div>
                        <div className="flex gap-6">
                            <div>
                                <div className="text-[10px] uppercase text-gray-600 font-bold tracking-widest">BAŞLANGIÇ</div>
                                <div className="text-white font-bold">{new Date(challenge.start_date).toLocaleDateString('tr-TR')}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-gray-600 font-bold tracking-widest">BİTİŞ</div>
                                <div className="text-white font-bold">{new Date(challenge.end_date).toLocaleDateString('tr-TR')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* İlerleme */}
                <div className="mb-8">
                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-6xl font-black text-white leading-none">{status.currentDay}</span>
                        <span className="text-xl text-gray-500 font-medium mb-1.5">/ {status.totalDays} gün</span>
                    </div>
                    
                    <div className="w-full bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-800 relative">
                        <div 
                            className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all duration-1000 relative z-10" 
                            style={{ width: `${status.progress}%` }} 
                        />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            %{status.progress} Tamamlandı
                        </div>
                        <div className={`text-xs font-bold uppercase px-3 py-1 rounded border ${status.isEnded ? 'text-red-500 border-red-900/30 bg-red-900/10' : 'text-green-500 border-green-900/30 bg-green-900/10'}`}>
                            {status.isEnded ? 'Süreç Sona Erdi' : 'Aktif Süreç'}
                        </div>
                    </div>
                </div>

                {/* Butonlar */}
                {isJoined ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link 
                            href={`/dashboard?id=${challenge.id}`}
                            className="flex-1 bg-white text-black hover:bg-gray-200 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            <span>⚡</span> PANELE GİT (RAPORLA)
                        </Link>
                        <form action={async () => { 'use server'; await leaveChallenge(challenge.id) }}>
                            <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-red-900/30 text-red-600 hover:bg-red-900/10 hover:text-red-500 transition font-bold uppercase tracking-wider text-sm" title="Bu hedeften ayrıl">
                                AYRIL
                            </button>
                        </form>
                    </div>
                ) : (
                    <form action={async () => { 'use server'; await joinChallenge(challenge.id) }}>
                        <button disabled={status.isEnded} className="w-full bg-indigo-600 text-white hover:bg-indigo-500 py-5 rounded-xl font-bold text-xl shadow-[0_0_30px_-5px_rgba(79,70,229,0.4)] transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {status.isEnded ? 'BU HEDEF ARTIK KAPALI' : 'BU HEDEFE KATIL +'}
                        </button>
                    </form>
                )}
            </div>
        </div>

        {/* --- İSTATİSTİKLER --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f1115] border border-gray-800 p-6 rounded-2xl text-center">
                <div className="text-3xl font-black text-white mb-1">{totalParticipants}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Toplam Katılımcı</div>
            </div>
            <div className="bg-[#0f1115] border border-gray-800 p-6 rounded-2xl text-center">
                <div className="text-3xl font-black text-green-500 mb-1">{status.daysLeft}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kalan Gün</div>
            </div>
             <div className="bg-[#0f1115] border border-gray-800 p-6 rounded-2xl text-center">
                <div className="text-3xl font-black text-gray-600 mb-1">-</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kayıp Yok</div>
            </div>
        </div>

        {/* --- FORUM --- */}
        <div className="bg-[#0f1115] border border-gray-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                💬 Tartışma & Notlar <span className="text-sm font-normal text-gray-500">({comments.length})</span>
            </h3>

            {user && isJoined && (
                <div className="mb-8">
                    <form action={postChallengeComment} className="flex gap-4">
                        <input type="hidden" name="challenge_id" value={challenge.id} />
                        <div className="relative flex-1">
                            <input 
                                name="content" 
                                placeholder="Gelişmeleri paylaş..." 
                                className="w-full bg-black/40 border border-gray-700 rounded-xl px-6 py-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-900 outline-none transition placeholder:text-gray-600"
                                required 
                                autoComplete="off"
                            />
                        </div>
                        <button className="bg-white text-black hover:bg-gray-200 px-8 rounded-xl font-bold uppercase tracking-wider text-sm transition shadow-lg">
                            GÖNDER
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-5 p-5 rounded-2xl bg-black/20 border border-gray-800/50">
                        <div className="w-12 h-12 rounded-full bg-indigo-900/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-sm font-bold shrink-0">
                            {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-indigo-300 text-sm">@{comment.profiles?.username || 'Anonim'}</span>
                                <span className="text-xs text-gray-600 font-mono">{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                        </div>
                    </div>
                ))}
                
                {comments.length === 0 && (
                     <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl text-gray-500">Bu kanal henüz sessiz. İlk paylaşımı sen yap.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}