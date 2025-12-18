import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  
  // 1. Aktif Challenge'ları Çek
  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, title')
    .eq('is_public', true) // <--- SADECE HERKESE AÇIK OLANLARI GETİR
    .order('start_date', { ascending: false })

  // 2. Seçili ID'yi belirle (URL'de yoksa listedeki ilkini al)
  const selectedId = params.id || challenges?.[0]?.id

  // 3. O Challenge'ın Liderlerini Çek
  const { data: leaders } = await supabase
    .from('challenge_leaderboard')
    .select('*')
    .eq('challenge_id', selectedId)
    .order('streak', { ascending: false })
    .limit(100)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Başlık */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
            LİDERLİK CEPHESİ
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            "Sadece en disiplinliler zirveyi görür."
          </p>
        </div>

        {/* --- CHALLENGE SEÇİCİ (Yatay Kaydırma) --- */}
        <div className="flex overflow-x-auto pb-6 mb-8 gap-3 scrollbar-hide justify-start md:justify-center px-4">
          {challenges?.map((c) => {
            const isActive = c.id === selectedId
            return (
              <Link
                key={c.id}
                href={`/leaderboard?id=${c.id}`}
                className={`
                  whitespace-nowrap px-6 py-2.5 rounded-xl font-bold text-sm transition-all border
                  ${isActive 
                    ? 'bg-red-700 text-white border-red-500 shadow-[0_0_20px_-5px_#dc2626] scale-105' 
                    : 'bg-gray-900/50 text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'
                  }
                `}
              >
                {c.title}
              </Link>
            )
          })}
        </div>

        {/* --- İLK 3 KÜRSÜ (PODIUM) --- */}
        {leaders && leaders.length > 0 && (
          <div className="flex justify-center items-end gap-4 mb-12 min-h-[200px]">
            
            {/* 2. SIRA */}
            {leaders[1] && (
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 rounded-full border-2 border-gray-400 bg-gray-900 flex items-center justify-center text-xl font-bold mb-3 shadow-[0_0_15px_gray] group-hover:scale-105 transition">
                   {leaders[1].username?.[0]?.toUpperCase()}
                </div>
                <div className="bg-gray-800/80 w-24 h-32 rounded-t-xl border-t-4 border-gray-400 flex flex-col justify-end p-2 text-center">
                   <span className="text-2xl font-black text-white">2</span>
                   <span className="text-xs truncate text-gray-300 font-bold mt-1">{leaders[1].username}</span>
                   <span className="text-sm font-mono text-green-400">{leaders[1].streak} Gün</span>
                </div>
              </div>
            )}

            {/* 1. SIRA (ŞAMPİYON) */}
            {leaders[0] && (
              <div className="flex flex-col items-center z-10 group">
                 <div className="animate-bounce mb-2 text-2xl">👑</div>
                 <div className="w-24 h-24 rounded-full border-4 border-yellow-500 bg-black flex items-center justify-center text-3xl font-black text-yellow-500 mb-3 shadow-[0_0_30px_#eab308] group-hover:scale-105 transition">
                    {leaders[0].username?.[0]?.toUpperCase()}
                 </div>
                 <div className="bg-gradient-to-b from-yellow-900/40 to-black w-32 h-44 rounded-t-xl border-t-4 border-yellow-500 flex flex-col justify-end p-4 text-center shadow-lg shadow-yellow-900/20">
                    <span className="text-4xl font-black text-white">1</span>
                    <span className="text-sm truncate text-yellow-100 font-bold mt-2">{leaders[0].username}</span>
                    <span className="text-lg font-mono text-yellow-500 font-bold">{leaders[0].streak} Gün 🔥</span>
                 </div>
              </div>
            )}

            {/* 3. SIRA */}
            {leaders[2] && (
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 rounded-full border-2 border-orange-700 bg-gray-900 flex items-center justify-center text-xl font-bold mb-3 shadow-[0_0_15px_#c2410c] group-hover:scale-105 transition">
                   {leaders[2].username?.[0]?.toUpperCase()}
                </div>
                <div className="bg-gray-800/80 w-24 h-24 rounded-t-xl border-t-4 border-orange-700 flex flex-col justify-end p-2 text-center">
                   <span className="text-2xl font-black text-white">3</span>
                   <span className="text-xs truncate text-gray-300 font-bold mt-1">{leaders[2].username}</span>
                   <span className="text-sm font-mono text-green-400">{leaders[2].streak} Gün</span>
                </div>
              </div>
            )}

          </div>
        )}

        {/* --- LİSTE (İlk 3 hariç diğerleri veya hepsi) --- */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          {leaders && leaders.length > 0 ? (
            leaders.map((user, index) => (
              <div 
                key={user.user_id + '_' + index} 
                className={`
                  flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition group
                  ${index < 3 ? 'bg-white/5' : ''} 
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
                     <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                        {user.username?.[0]?.toUpperCase()}
                     </div>
                     <div>
                        <div className="font-bold text-white group-hover:text-red-500 transition">
                            {user.username || 'Bilinmeyen Asker'}
                        </div>
                        {index < 3 && <div className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider">Lider Kadro</div>}
                     </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono text-white font-bold text-lg">{user.streak}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Gün Serisi</div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <div className="text-4xl mb-4 opacity-50">☠️</div>
               <p>Bu cephede henüz hayatta kalan yok.</p>
               <p className="text-xs mt-2">İlk kanı sen dök.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}