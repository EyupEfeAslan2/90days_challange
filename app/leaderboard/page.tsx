import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // Giriş kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Liderlik tablosunu çek (Puanı yüksek olan en üstte)
  const { data: leaders } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(20) // İlk 20 kişi

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 p-4 sticky top-0 bg-black/80 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold text-yellow-500 tracking-tighter">LİDERLİK TABLOSU 🏆</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-4 space-y-2">
        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded text-center mb-6">
          <p className="text-sm text-gray-300">En disiplinli savaşçılar burada onurlandırılır.</p>
        </div>

        {leaders && leaders.length > 0 ? (
          leaders.map((player, index) => (
            <div 
              key={player.username} 
              className={`flex items-center justify-between p-4 rounded border ${
                index === 0 ? 'bg-yellow-900/20 border-yellow-700' : // 1. Sıra Altın
                index === 1 ? 'bg-gray-800/50 border-gray-600' :     // 2. Sıra Gümüş
                index === 2 ? 'bg-orange-900/20 border-orange-800' : // 3. Sıra Bronz
                'bg-gray-900/30 border-gray-800'                     // Diğerleri
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Sıralama Sayısı */}
                <span className={`font-mono text-xl font-bold w-8 text-center ${
                    index < 3 ? 'text-white' : 'text-gray-500'
                }`}>
                  #{index + 1}
                </span>

                {/* İsim */}
                <div>
                   <p className="font-bold text-lg">@{player.username}</p>
                </div>
              </div>

              {/* Skor */}
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{player.score}</p>
                <p className="text-xs text-gray-500 uppercase">Gün</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            Henüz kimse skor yapmadı.
          </div>
        )}
      </main>
    </div>
  )
}