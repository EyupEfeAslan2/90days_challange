import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deleteChallenge } from './actions'
import DeleteButton from '@/components/DeleteButton'

// --- TYPES ---
interface Challenge {
  id: string
  created_by: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  is_public: boolean
}

interface ChallengeCardProps {
  challenge: Challenge
  userId?: string
  statusLabel: string
  statusColor: string
}

// --- SUB-COMPONENT: Challenge Card ---
function ChallengeCard({ challenge, userId, statusLabel, statusColor }: ChallengeCardProps) {
  const isOwner = userId === challenge.created_by

  return (
    <div className="group relative bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl hover:border-gray-600 transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 hover:shadow-2xl">
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

      {/* Action: Delete (Owner Only) */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <DeleteButton 
            onDelete={async () => {
               'use server'
               await deleteChallenge(challenge.id)
            }}
            title="Hedefi Sil" // Revize: Cephe -> Hedef
            className="bg-black/50 text-red-500 backdrop-blur-md hover:bg-red-900/50"
          />
        </div>
      )}

      {/* Content */}
      <div>
        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border ${statusColor}`}>
           {statusLabel}
        </div>

        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors">
            {challenge.title}
        </h3>
        
        <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed">
          {challenge.description || 'Bu hedef için henüz bir açıklama girilmedi.'}
        </p>
        
        {/* Dates */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mb-6 border-t border-gray-900 pt-4">
          <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-gray-600">BAŞLANGIÇ</span>
              <span className="text-white">{new Date(challenge.start_date).toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="w-[1px] h-8 bg-gray-800"></div>
          <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wide text-gray-600">BİTİŞ</span>
              <span className="text-white">{new Date(challenge.end_date).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link 
        href={`/dashboard?id=${challenge.id}`}
        className="relative w-full block text-center bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition-transform active:scale-95 uppercase tracking-wide"
      >
        İNCELE VE KATIL
      </Link>
    </div>
  )
}

// --- MAIN PAGE ---
export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]

  // Data Fetching
  const { data: rawChallenges, error } = await supabase
    .from('challenges')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) return <div className="text-red-500 pt-32 text-center">Sistem Hatası: {error.message}</div>

  const allChallenges = (rawChallenges as Challenge[]) || []

  // Logic: Filtering
  // 1. Gizlilik: Public olanlar VEYA Benim oluşturduklarım
  const visibleChallenges = allChallenges.filter(c => c.is_public || (user && c.created_by === user.id))

  // 2. Zaman Durumu
  const activeChallenges = visibleChallenges.filter(c => c.start_date <= today && c.end_date >= today)
  const upcomingChallenges = visibleChallenges.filter(c => c.start_date > today)
  const pastChallenges = visibleChallenges.filter(c => c.end_date < today)

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 pb-20 selection:bg-red-900 selection:text-white">
      
      {/* Background Ambient */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-800 pb-10">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 border border-red-900/30 text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Sistem Çevrimiçi
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
                    90 GÜNLÜK <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">DİSİPLİN.</span>
                </h1>
                <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                    Konfor alanını terk et. İradeni test edecek bir hedef seç ve sürece sadık kal.
                </p>
            </div>
            
            {user && (
              <Link 
                href="/create-challenge" 
                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]"
              >
                <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span> 
                YENİ HEDEF OLUŞTUR
              </Link>
            )}
        </div>

        {/* 1. AKTİF SÜREÇLER (Yeşil) */}
        {activeChallenges.length > 0 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight">AKTİF SÜREÇLER</h2>
                    <div className="h-[1px] bg-gray-800 flex-1"></div>
                    <span className="text-xs font-mono text-gray-500">{activeChallenges.length} ADET</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeChallenges.map(c => (
                        <ChallengeCard 
                            key={c.id} 
                            challenge={c} 
                            userId={user?.id}
                            statusLabel="● DEVAM EDİYOR"
                            statusColor="bg-green-900/20 border-green-900/50 text-green-500"
                        />
                    ))}
                </div>
            </section>
        )}

        {/* 2. HAZIRLIK AŞAMASI (Sarı) */}
        {upcomingChallenges.length > 0 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-300">HAZIRLIK AŞAMASI</h2>
                    <div className="h-[1px] bg-gray-800 flex-1"></div>
                    <span className="text-xs font-mono text-gray-500">{upcomingChallenges.length} ADET</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingChallenges.map(c => (
                        <ChallengeCard 
                            key={c.id} 
                            challenge={c} 
                            userId={user?.id}
                            statusLabel="⏳ YAKINDA"
                            statusColor="bg-yellow-900/20 border-yellow-900/50 text-yellow-500"
                        />
                    ))}
                </div>
            </section>
        )}

        {/* 3. TAMAMLANANLAR (Gri) */}
        {pastChallenges.length > 0 && (
            <section className="space-y-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-500">ARŞİV</h2>
                    <div className="h-[1px] bg-gray-800 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastChallenges.map(c => (
                        <ChallengeCard 
                            key={c.id} 
                            challenge={c} 
                            userId={user?.id}
                            statusLabel="BİTTİ"
                            statusColor="bg-gray-800 border-gray-700 text-gray-400"
                        />
                    ))}
                </div>
            </section>
        )}

        {/* EMPTY STATE */}
        {visibleChallenges.length === 0 && (
            <div className="py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
                <h3 className="text-2xl font-bold text-white mb-2">Başlangıç Noktası</h3>
                <p className="text-gray-500 mb-6">Henüz aktif bir hedef yok. Kendi yolculuğunu başlat.</p>
                {user && (
                    <Link href="/create-challenge" className="text-red-500 font-bold hover:underline">
                        İlk Hedefi Sen Belirle →
                    </Link>
                )}
            </div>
        )}

      </div>
    </main>
  )
}