import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { joinChallenge } from './actions'
import { Suspense } from 'react'

// Types
interface Challenge {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
}

interface ChallengeStats {
  total: number
  active: number
  dropped: number
}

interface ChallengeStatus {
  currentDay: number
  statusText: string
  statusColor: string
  progress: number
}

// Utility Functions
const calculateChallengeStatus = (
  startDate: string,
  endDate: string
): ChallengeStatus => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  if (now < start) {
    const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      currentDay: 0,
      statusText: `${daysUntilStart} gün sonra başlıyor`,
      statusColor: 'text-yellow-500',
      progress: 0
    }
  }
  
  if (now > end) {
    return {
      currentDay: totalDays,
      statusText: 'Tamamlandı',
      statusColor: 'text-gray-500',
      progress: 100
    }
  }
  
  const currentDay = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const progress = Math.round((currentDay / totalDays) * 100)
  
  return {
    currentDay,
    statusText: 'Aktif Operasyon',
    statusColor: 'text-green-500',
    progress
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Sub-components
const StatusBadge = ({ status }: { status: ChallengeStatus }) => (
  <div className={`
    text-xs font-bold uppercase tracking-widest px-3 py-1.5 
    rounded-lg border border-gray-800 ${status.statusColor}
    flex items-center gap-2 backdrop-blur-sm
  `}>
    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
    {status.statusText}
  </div>
)

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 ease-out"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  </div>
)

const StatCard = ({ 
  value, 
  label, 
  color = 'white',
  borderColor = 'gray-800',
  icon
}: { 
  value: number
  label: string
  color?: string
  borderColor?: string
  icon?: string
}) => (
  <div className={`
    bg-gray-950 border border-${borderColor} rounded-xl p-6 text-center
    transform transition-all duration-300 hover:scale-105 hover:bg-gray-900
    group
  `}>
    {icon && (
      <div className="text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all">
        {icon}
      </div>
    )}
    <div className={`text-4xl font-extrabold text-${color} mb-2 font-mono`}>
      {value.toLocaleString()}
    </div>
    <div className="text-sm text-gray-400 uppercase tracking-wide">
      {label}
    </div>
  </div>
)

const JoinButton = ({ 
  isJoined, 
  challengeId 
}: { 
  isJoined: boolean
  challengeId: string 
}) => {
  if (isJoined) {
    return (
      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-3 bg-green-600/10 border-2 border-green-600/50 text-green-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 hover:text-white hover:border-green-600 transition-all w-full md:w-auto justify-center group active:scale-95"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Cephedesin - Rapor Ver</span>
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    )
  }

  return (
    <form action={joinChallenge}>
      <input type="hidden" name="challenge_id" value={challengeId} />
      <button 
        type="submit"
        className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] w-full md:w-auto hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>CEPHEYE KATIL</span>
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </form>
  )
}

const ChallengeHeader = ({ 
  challenge, 
  status 
}: { 
  challenge: Challenge
  status: ChallengeStatus 
}) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl group">
    {/* Background Effect */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-red-600/20 transition-all duration-700" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

    <div className="relative z-10 space-y-6">
      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter leading-tight">
        {challenge.title}
      </h1>
      
      {/* Date Info */}
      <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-gray-400 font-mono border-b border-gray-800 pb-6">
        <div className="flex items-center gap-2 bg-gray-950/50 px-3 py-2 rounded-lg">
          <span>🚀</span>
          <span className="text-gray-500">Başlangıç:</span>
          <span className="text-white font-bold">{formatDate(challenge.start_date)}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-950/50 px-3 py-2 rounded-lg">
          <span>🏁</span>
          <span className="text-gray-500">Bitiş:</span>
          <span className="text-white font-bold">{formatDate(challenge.end_date)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">İlerleme</span>
          <span className="text-white font-bold font-mono">{status.progress}%</span>
        </div>
        <ProgressBar progress={status.progress} />
        <div className="text-xs text-gray-500 text-right">
          Gün {status.currentDay}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl">
        {challenge.description || "Bu cephe için henüz istihbarat raporu girilmedi. Kurallar basit: Disiplinli ol, ölme."}
      </p>
    </div>
  </div>
)

const StatsSkeleton = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 animate-pulse">
    <div className="h-8 bg-gray-800 rounded w-48 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-6">
          <div className="h-10 bg-gray-800 rounded w-16 mx-auto mb-2" />
          <div className="h-4 bg-gray-800 rounded w-24 mx-auto" />
        </div>
      ))}
    </div>
  </div>
)

// Main Component
export default async function ChallengeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch challenge data
  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !challenge) {
    notFound()
  }

  // Check if user has joined
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

  // Fetch statistics in parallel
  const today = new Date().toISOString().split('T')[0]
  
  const [
    { count: totalParticipants },
    { count: activeToday }
  ] = await Promise.all([
    supabase
      .from('user_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', id),
    
    supabase
      .from('daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', id)
      .eq('log_date', today)
  ])

  // Calculate status and stats
  const status = calculateChallengeStatus(challenge.start_date, challenge.end_date)
  
  const stats: ChallengeStats = {
    total: totalParticipants || 0,
    active: activeToday || 0,
    dropped: (totalParticipants || 0) - (activeToday || 0)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 pb-20">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* Navigation */}
        <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link 
            href="/" 
            className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>LİSTEYE DÖN</span>
          </Link>
          <StatusBadge status={status} />
        </nav>

        {/* Main Card */}
        <ChallengeHeader challenge={challenge} status={status} />

        {/* Action Button */}
        <div className="flex justify-center md:justify-start">
          <JoinButton isJoined={isJoined} challengeId={challenge.id} />
        </div>

        {/* Statistics Card */}
        <Suspense fallback={<StatsSkeleton />}>
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2 flex-wrap">
              <span>📊 Operasyon İstatistikleri</span>
              <span className="text-sm font-normal text-gray-500">
                (Gün {status.currentDay})
              </span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <StatCard 
                value={stats.total}
                label="Toplam Savaşçı"
                icon="👥"
              />
              
              <StatCard 
                value={stats.active}
                label="Bugün Aktif"
                color="green-500"
                borderColor="green-900/30"
                icon="🔥"
              />
              
              <StatCard 
                value={stats.dropped}
                label="Kayıp Verdi"
                color="red-500"
                borderColor="red-900/30"
                icon="💔"
              />
            </div>

            {/* Success Rate */}
            {stats.total > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Başarı Oranı</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {Math.round((stats.active / stats.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
                    style={{ width: `${(stats.active / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </section>
        </Suspense>

      </div>
    </div>
  )
}