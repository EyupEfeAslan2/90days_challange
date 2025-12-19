import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { joinChallenge } from './actions'
import { Suspense } from 'react'
import { useFormStatus } from 'react-dom'

// --- TYPES ---
interface Challenge {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
}

interface ChallengeStatus {
  currentDay: number
  statusText: string
  statusColor: string
  progress: number
}

// --- SUB-COMPONENTS (Client Components for Form Status) ---
// Bu bileşen sunucu tarafında render edilir ancak içindeki useFormStatus hook'u çalışsın diye 
// normalde ayrı dosyaya alınması önerilir ("use client"). 
// Ancak pratiklik adına inline form kullanıp butonu ayırabiliriz.

function JoinSubmitButton() {
  'use client' // Hook kullandığı için client component olmalı
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit"
      disabled={pending}
      className={`
        w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
        ${pending 
           ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
           : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95'
        }
      `}
    >
      {pending ? (
        <>
          <span className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"/>
          KAYIT YAPILIYOR...
        </>
      ) : (
        <>
          DAHİL OL
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </>
      )}
    </button>
  )
}

// --- UTILITY ---
const calculateStatus = (start: string, end: string): ChallengeStatus => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const now = new Date()
  
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (86400000)))
  
  if (now < startDate) {
    const daysLeft = Math.ceil((startDate.getTime() - now.getTime()) / (86400000))
    return {
      currentDay: 0,
      statusText: `${daysLeft} Gün Sonra Başlıyor`,
      statusColor: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
      progress: 0
    }
  }
  
  if (now > endDate) {
    return {
      currentDay: totalDays,
      statusText: 'Tamamlandı',
      statusColor: 'text-gray-500 border-gray-700 bg-gray-800',
      progress: 100
    }
  }
  
  const currentDay = Math.ceil((now.getTime() - startDate.getTime()) / (86400000))
  const progress = Math.min(100, Math.round((currentDay / totalDays) * 100))
  
  return {
    currentDay,
    statusText: 'Aktif Süreç',
    statusColor: 'text-green-500 border-green-500/20 bg-green-500/10',
    progress
  }
}

// --- MAIN PAGE ---
export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 16: params must be awaited
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Veri Çekme
  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !challenge) notFound()

  // Katılım Kontrolü
  let isJoined = false
  if (user) {
    const { data: participation } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', id)
      .maybeSingle()
    isJoined = !!participation
  }

  // İstatistikler (Paralel)
  const [
    { count: totalParticipants },
    { count: activeToday }
  ] = await Promise.all([
    supabase.from('user_challenges').select('*', { count: 'exact', head: true }).eq('challenge_id', id),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('challenge_id', id).eq('log_date', new Date().toISOString().split('T')[0])
  ])

  const status = calculateStatus(challenge.start_date, challenge.end_date)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Nav */}
        <div className="flex justify-between items-center">
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-white transition flex items-center gap-2">
            <span>←</span> LİSTEYE DÖN
          </Link>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.statusColor}`}>
            {status.statusText}
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 md:p-12 overflow-hidden">
          {/* Ambiyans */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.9]">
              {challenge.title}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-sm font-mono text-gray-400 border-b border-gray-800 pb-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-gray-600">BAŞLANGIÇ</span>
                <span className="text-white font-bold">{new Date(challenge.start_date).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="w-[1px] bg-gray-800"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-gray-600">BİTİŞ</span>
                <span className="text-white font-bold">{new Date(challenge.end_date).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                 <span>İlerleme</span>
                 <span>%{status.progress}</span>
               </div>
               <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-white transition-all duration-1000" style={{ width: `${status.progress}%` }} />
               </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl font-light">
              {challenge.description || "Bu hedef için detaylı açıklama girilmedi."}
            </p>

            {/* Action Area */}
            <div className="pt-4">
              {isJoined ? (
                <Link 
                  href={`/dashboard?id=${challenge.id}`}
                  className="inline-flex items-center gap-3 bg-green-900/20 border border-green-900/50 text-green-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-900/30 transition-all w-full md:w-auto justify-center"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                  SÜRECE DAHİLSİN - RAPORLA
                </Link>
              ) : (
                <form action={joinChallenge}>
                  <input type="hidden" name="challenge_id" value={challenge.id} />
                  <JoinSubmitButton />
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl text-center">
             <div className="text-3xl font-black text-white mb-1">{totalParticipants || 0}</div>
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Toplam Katılımcı</div>
          </div>
          <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl text-center">
             <div className="text-3xl font-black text-green-500 mb-1">{activeToday || 0}</div>
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bugün Aktif</div>
          </div>
          <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-2xl text-center">
             <div className="text-3xl font-black text-gray-400 mb-1">
                {status.currentDay > 0 ? `Gün ${status.currentDay}` : 'Hazırlık'}
             </div>
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Süreç Durumu</div>
          </div>
        </div>

      </div>
    </div>
  )
}