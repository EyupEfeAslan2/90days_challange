import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

// --- TYPES ---
interface LeaderboardEntry {
  user_id: string
  username: string | null
  streak: number
}

// --- MAIN COMPONENT ---
export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  
  // 1. Aktif Public Challenge'ları Çek
  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, title')
    .eq('is_public', true)
    .order('start_date', { ascending: false })

  // 2. Seçili ID'yi belirle
  const selectedId = params.id || challenges?.[0]?.id

  // 3. Liderleri Çek
  let leaders: LeaderboardEntry[] = []
  
  if (selectedId) {
    const { data } = await supabase
      .from('challenge_leaderboard')
      .select('*')
      .eq('challenge_id', selectedId)
      .order('streak', { ascending: false })
      .limit(50)
    
    if (data) leaders = data as LeaderboardEntry[]
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            LİDERLİK TABLOSU
          </h1>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
            "Disiplin özgürlüktür."
          </p>
        </div>

        {/* Challenge Selector */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide justify-start md:justify-center px-4">
          {challenges?.map((c) => {
            const isActive = c.id === selectedId
            return (
              <Link
                key={c.id}
                href={`/leaderboard?id=${c.id}`}
                className={`
                  whitespace-nowrap px-5 py-2 rounded-full font-bold text-xs transition-all border
                  ${isActive 
                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                    : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600 hover:text-white'
                  }
                `}
              >
                {c.title}
              </Link>
            )
          })}
        </div>

        {/* --- PODIUM (Top 3) --- */}
        {leaders.length > 0 && (
          <div className="flex justify-center items-end gap-4 mb-12 min-h-[220px]">
            
            {/* 2ND PLACE */}
            <div className={`flex flex-col items-center transition-all duration-700 ${leaders[1] ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-16 h-16 rounded-full border-2 border-gray-400 bg-gray-900 flex items-center justify-center text-lg font-bold mb-3 shadow-[0_0_15px_rgba(156,163,175,0.3)]">
                 {leaders[1]?.username?.[0]?.toUpperCase() || '-'}
              </div>
              <div className="bg-gray-800 w-24 h-32 rounded-t-xl border-t-4 border-gray-400 flex flex-col justify-end p-2 text-center">
                 <span className="text-2xl font-black text-white">2</span>
                 <span className="text-xs truncate text-gray-300 font-bold mt-1 max-w-full px-1">{leaders[1]?.username}</span>
                 <span className="text-xs font-mono text-gray-400 mt-1">{leaders[1]?.streak} Gün</span>
              </div>
            </div>

            {/* 1ST PLACE */}
            <div className="flex flex-col items-center z-10 -mx-2">
                 <div className="animate-bounce mb-2 text-3xl">👑</div>
                 <div className="w-24 h-24 rounded-full border-4 border-yellow-500 bg-black flex items-center justify-center text-3xl font-black text-yellow-500 mb-3 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                    {leaders[0]?.username?.[0]?.toUpperCase()}
                 </div>
                 <div className="bg-gradient-to-b from-yellow-900/30 to-black w-32 h-48 rounded-t-xl border-t-4 border-yellow-500 flex flex-col justify-end p-4 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-yellow-500/5 animate-pulse" />
                    <span className="text-5xl font-black text-white relative z-10">1</span>
                    <span className="text-sm truncate text-yellow-200 font-bold mt-2 relative z-10 max-w-full">{leaders[0]?.username}</span>
                    <span className="text-lg font-mono text-yellow-500 font-bold mt-1 relative z-10">{leaders[0]?.streak} Gün</span>
                 </div>
            </div>

            {/* 3RD PLACE */}
            <div className={`flex flex-col items-center transition-all duration-700 ${leaders[2] ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-16 h-16 rounded-full border-2 border-orange-700 bg-gray-900 flex items-center justify-center text-lg font-bold mb-3 shadow-[0_0_15px_rgba(194,65,12,0.3)]">
                 {leaders[2]?.username?.[0]?.toUpperCase() || '-'}
              </div>
              <div className="bg-gray-800 w-24 h-24 rounded-t-xl border-t-4 border-orange-700 flex flex-col justify-end p-2 text-center">
                 <span className="text-2xl font-black text-white">3</span>
                 <span className="text-xs truncate text-gray-300 font-bold mt-1 max-w-full px-1">{leaders[2]?.username}</span>
                 <span className="text-xs font-mono text-gray-400 mt-1">{leaders[2]?.streak} Gün</span>
              </div>
            </div>

          </div>
        )}

        {/* --- LIST (Rank 4+) --- */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden">
          {leaders.length > 0 ? (
            leaders.map((user, index) => (
              <div 
                key={user.user_id + '_' + index} 
                className={`
                  flex items-center justify-between p-4 md:p-5 border-b border-gray-800/50 hover:bg-white/5 transition
                  ${index < 3 ? 'bg-white/5 opacity-50' : ''} 
                `}
              >
                <div className="flex items-center gap-4">
                  <span className={`
                    font-mono font-bold text-lg w-8 text-center
                    ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-600' : 'text-gray-600'}
                  `}>
                    #{index + 1}
                  </span>
                  
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-gray-900 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                        {user.username?.[0]?.toUpperCase()}
                     </div>
                     <div className="font-bold text-gray-200">
                        {user.username || 'Anonim Üye'}
                     </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono text-white font-bold">{user.streak}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <div className="text-4xl mb-4 grayscale opacity-30">🛡️</div>
               <p className="font-bold">Bu hedefte henüz lider yok.</p>
               <p className="text-xs mt-2 text-gray-600">İlk sıraları kapmak için şimdi başla.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}