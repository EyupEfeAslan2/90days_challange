import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deleteChallenge } from './actions'
import DeleteButton from '@/components/DeleteButton'
import Footer from '@/components/Footer'

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
  isJoined: boolean
  statusLabel: string
  statusColor: string
}

// --- SUB-COMPONENT: Challenge Card ---
function ChallengeCard({ challenge, userId, isJoined, statusLabel, statusColor }: ChallengeCardProps) {
  const isOwner = userId === challenge.created_by

  return (
    <div className="group relative bg-[#0f1115] border border-gray-800 p-5 rounded-xl hover:border-gray-600 transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 hover:shadow-2xl overflow-hidden">
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* SİLME BUTONU (Sadece Sahibi Görür) */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <DeleteButton 
            onDelete={async () => {
               'use server'
               await deleteChallenge(challenge.id)
            }}
            title="Hedefi Sil"
            className="w-8 h-8 flex items-center justify-center bg-black/50 text-red-500 hover:text-white hover:bg-red-900 border border-gray-700 rounded-full backdrop-blur-md transition"
          />
        </div>
      )}

      {/* --- KART İÇERİĞİ --- */}
      <Link href={`/challenge/${challenge.id}`} className="block relative z-10 flex-1">
        <div>
            {/* Status Badge */}
            <div className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-4 border ${statusColor}`}>
               {statusLabel}
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors line-clamp-1">
                {challenge.title}
            </h3>
            
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-6 h-[4.5em]">
               {challenge.description || 'Bu hedef için detaylı açıklama girilmedi.'}
            </p>
            
            {/* Tarihler */}
            <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 mb-6 border-t border-gray-800 pt-4">
               <div>
                  <span className="block text-gray-600 uppercase font-bold tracking-wide mb-0.5">BAŞLANGIÇ</span>
                  <span className="text-gray-300">{new Date(challenge.start_date).toLocaleDateString('tr-TR')}</span>
               </div>
               <div className="w-px h-6 bg-gray-800"></div>
               <div>
                  <span className="block text-gray-600 uppercase font-bold tracking-wide mb-0.5">BİTİŞ</span>
                  <span className="text-gray-300">{new Date(challenge.end_date).toLocaleDateString('tr-TR')}</span>
               </div>
            </div>
        </div>
      </Link>

      {/* --- AKSİYON BUTONLARI --- */}
      <div className="relative z-10 mt-auto pt-2">
        {isJoined ? (
            <div className="flex gap-2">
                {/* 1. Dashboard (Primary) */}
                <Link 
                    href={`/dashboard?id=${challenge.id}`}
                    className="flex-1 text-center bg-white text-black py-3 rounded-lg font-bold text-xs hover:bg-gray-200 transition-transform active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                >
                    <span>⚡</span> RAPORLA
                </Link>
                {/* 2. Forum (Secondary) */}
                <Link 
                    href={`/challenge/${challenge.id}`}
                    className="flex-1 text-center bg-gray-900 text-gray-300 border border-gray-800 py-3 rounded-lg font-bold text-xs hover:bg-gray-800 hover:text-white transition-transform active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                >
                    <span>💬</span> NOTLAR
                </Link>
            </div>
        ) : (
            <Link 
                href={`/challenge/${challenge.id}`}
                className="block w-full text-center bg-indigo-900/20 text-indigo-400 border border-indigo-900/50 py-3.5 rounded-lg font-bold text-xs hover:bg-indigo-900/40 hover:text-indigo-300 transition-transform active:scale-95 uppercase tracking-widest"
            >
                İNCELE & KATIL +
            </Link>
        )}
      </div>
    </div>
  )
}

// --- MAIN PAGE ---
export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]

  const { data: rawChallenges, error } = await supabase
    .from('challenges')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) return <div className="text-red-500 pt-32 text-center">Veri Hatası: {error.message}</div>

  const allChallenges = (rawChallenges as Challenge[]) || []

  // Kullanıcının katıldıklarını çek
  let myJoinedIds: string[] = []
  if (user) {
    const { data: userChallenges } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', user.id)
    
    if (userChallenges) myJoinedIds = userChallenges.map(uc => uc.challenge_id)
  }

  // --- FİLTRELEME ---
  const activeChallenges: Challenge[] = []
  const upcomingChallenges: Challenge[] = []
  const pastChallenges: Challenge[] = []

  allChallenges.forEach(c => {
    // 1. Gizlilik
    if (!c.is_public && (!user || c.created_by !== user.id)) return

    // 2. Kategori
    if (c.end_date < today) {
        pastChallenges.push(c)
    } else if (c.start_date > today) {
        upcomingChallenges.push(c)
    } else {
        activeChallenges.push(c)
    }
  })

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-indigo-900 selection:text-white flex flex-col">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="flex-1 p-6 md:p-12 pt-32 pb-20 max-w-7xl mx-auto w-full space-y-16">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-gray-800 pb-12">
            <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 border border-green-900/30 text-green-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Sistem Aktif
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.95]">
                    İRADENİ <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">İNŞA ET.</span>
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                    Konfor alanını terk et. Kendine uygun bir hedef seç, sürece sadık kal ve potansiyelini keşfet.
                </p>
            </div>
            
            {user && (
              <Link 
                href="/create-challenge" 
                className="group flex items-center gap-3 bg-white text-black px-8 py-5 rounded-xl font-bold text-sm hover:bg-gray-100 transition shadow-xl shadow-white/5"
              >
                <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span> 
                YENİ HEDEF OLUŞTUR
              </Link>
            )}
        </div>

        {/* LİSTELER */}
        {[
            { list: activeChallenges, title: "AKTİF SÜREÇLER", color: "bg-green-900/10 border-green-900/30 text-green-500", label: "● AKTİF" },
            { list: upcomingChallenges, title: "HAZIRLIK AŞAMASI", color: "bg-yellow-900/10 border-yellow-900/30 text-yellow-500", label: "⏳ YAKINDA" },
            { list: pastChallenges, title: "ARŞİV", color: "bg-gray-800/50 border-gray-700 text-gray-500", label: "BİTTİ" }
        ].map((section, idx) => (
            section.list.length > 0 && (
                <section key={idx} className="space-y-8 animate-in slide-in-from-bottom duration-1000">
                    <div className="flex items-center gap-4">
                        <h2 className={`text-xl font-bold tracking-tight ${idx === 2 ? 'text-gray-600' : 'text-white'}`}>{section.title}</h2>
                        <div className="h-px bg-gray-800 flex-1"></div>
                        <span className="text-xs font-mono text-gray-600 font-bold">{section.list.length} HEDEF</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {section.list.map(c => (
                            <ChallengeCard 
                                key={c.id} 
                                challenge={c} 
                                userId={user?.id}
                                isJoined={myJoinedIds.includes(c.id)}
                                statusLabel={section.label}
                                statusColor={section.color}
                            />
                        ))}
                    </div>
                </section>
            )
        ))}

        {allChallenges.length === 0 && (
            <div className="py-32 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
                <p className="text-gray-500 mb-6">Henüz aktif bir süreç bulunmuyor.</p>
                {user && (
                    <Link href="/create-challenge" className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition">
                        İlk Hedefi Sen Başlat →
                    </Link>
                )}
            </div>
        )}
      </div>

      {/* ✅ DOĞRU KULLANIM: Footer içerik bittikten sonra, en sona eklenir */}
      <Footer />
      
    </main>
  )
}