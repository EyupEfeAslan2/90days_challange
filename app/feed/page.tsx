import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

// Types
interface Profile {
  username: string | null
  avatar_url: string | null
  streak?: number
  total_points?: number
}

interface DailyLog {
  id: string
  created_at: string
  log_date: string
  is_successful: boolean
  sins_of_omission: string | null
  sins_of_commission: string | null
  profiles: Profile | Profile[] | null
  challenges?: {
    title: string
  } | null
}

// Utility Functions
const normalizeProfile = (profiles: Profile | Profile[] | null): Profile | null => {
  if (!profiles) return null
  return Array.isArray(profiles) ? profiles[0] : profiles
}

const getInitials = (username: string | null): string => {
  if (!username) return '?'
  return username.slice(0, 2).toUpperCase()
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Az önce'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`
  if (diffInSeconds < 172800) return 'Dün'
  
  return date.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long',
  })
}

const getStreakBadge = (streak?: number) => {
  if (!streak || streak < 7) return null
  if (streak >= 90) return { icon: '🏆', label: 'Efsane', color: 'from-yellow-600 to-yellow-500' }
  if (streak >= 60) return { icon: '💎', label: 'Usta', color: 'from-purple-600 to-purple-500' }
  if (streak >= 30) return { icon: '🔥', label: 'Ateşli', color: 'from-orange-600 to-orange-500' }
  if (streak >= 14) return { icon: '⚡', label: 'Hızlı', color: 'from-blue-600 to-blue-500' }
  return { icon: '🎯', label: 'İyi Gidiyor', color: 'from-green-600 to-green-500' }
}

// Sub-components
const FeedItemSkeleton = () => (
  <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-800" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-4 bg-gray-800 rounded w-32" />
          <div className="h-3 bg-gray-800 rounded w-24" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-4/5" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-800 rounded w-20" />
          <div className="h-8 bg-gray-800 rounded w-20" />
        </div>
      </div>
    </div>
  </div>
)

const UserAvatar = ({ profile }: { profile: Profile }) => {
  const initials = getInitials(profile.username)
  const streakBadge = getStreakBadge(profile.streak)

  return (
    <div className="relative flex-shrink-0">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold text-white border-2 border-gray-800 shadow-lg">
        {initials}
      </div>
      {streakBadge && (
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${streakBadge.color} rounded-full flex items-center justify-center text-xs border-2 border-gray-900`}>
          {streakBadge.icon}
        </div>
      )}
    </div>
  )
}

const PostContent = ({ log }: { log: DailyLog }) => {
  const hasContent = log.sins_of_omission || log.sins_of_commission
  
  return (
    <div className="space-y-3">
      {log.sins_of_omission && (
        <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">İhmaller</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{log.sins_of_omission}</p>
        </div>
      )}
      
      {log.sins_of_commission && (
        <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Hatalar</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{log.sins_of_commission}</p>
        </div>
      )}
      
      {!hasContent && (
        <div className="bg-green-950/20 border border-green-900/30 rounded-lg p-3">
          <p className="text-sm text-green-400 font-medium">✓ Günü başarıyla tamamladı</p>
        </div>
      )}
    </div>
  )
}

const FeedItem = ({ log, index }: { log: DailyLog; index: number }) => {
  const profile = normalizeProfile(log.profiles)
  const username = profile?.username || 'Gizli Üye'
  const timeAgo = formatRelativeTime(log.created_at)
  const streakBadge = getStreakBadge(profile?.streak)

  return (
    <article 
      className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 hover:border-gray-700 hover:bg-gray-900/60 transition-all duration-300 group"
      style={{ 
        animationDelay: `${index * 50}ms`,
        animation: 'fadeIn 0.5s ease-out forwards',
        opacity: 0
      }}
    >
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <UserAvatar profile={profile || {}} />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  href={`/profile/${profile?.username}`}
                  className="font-bold text-white hover:text-red-500 transition-colors truncate"
                >
                  @{username}
                </Link>
                {streakBadge && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r ${streakBadge.color} rounded-full text-[10px] font-bold text-white`}>
                    {streakBadge.icon} {streakBadge.label}
                  </span>
                )}
                {log.challenges?.title && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 rounded-full text-[10px] font-bold text-gray-400">
                    📋 {log.challenges.title}
                  </span>
                )}
              </div>
              <time 
                dateTime={log.created_at}
                className="text-xs text-gray-500 mt-1 block"
              >
                {timeAgo}
              </time>
            </div>
            
            {/* Success Badge */}
            {log.is_successful && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Post Content */}
          <PostContent log={log} />

          {/* Footer Actions */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-medium">Destek</span>
            </button>
            
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">Yorum</span>
            </button>
            
            {profile?.streak && (
              <div className="ml-auto flex items-center gap-2 text-gray-500 text-xs">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                <span className="font-mono font-bold">{profile.streak} gün serisi</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

const EmptyState = () => (
  <div className="text-center py-20 px-4">
    <div className="max-w-md mx-auto space-y-4">
      <div className="w-20 h-20 mx-auto bg-gray-900 rounded-full flex items-center justify-center border border-gray-800">
        <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-300 mb-2">
          Henüz Kimse Paylaşımda Bulunmadı
        </h3>
        <p className="text-gray-500 text-sm">
          İlk paylaşımı yapan sen ol! Dashboard'a git ve bugünkü raporunu tamamla.
        </p>
      </div>
      <Link 
        href="/dashboard" 
        className="inline-block bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-red-600 transition-all active:scale-95 mt-4"
      >
        Raporunu Paylaş
      </Link>
    </div>
  </div>
)

const FeedHeader = () => (
  <div className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-16 z-20">
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Topluluk Akışı</h1>
          <p className="text-sm text-gray-500 mt-1">Savaşçıların son aktiviteleri</p>
        </div>
        
        <Link 
          href="/dashboard" 
          className="group flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-red-600 hover:bg-gray-950 transition-all"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors hidden sm:inline">
            Rapor Yaz
          </span>
        </Link>
      </div>
    </div>
  </div>
)

// Main Component
export default async function FeedPage() {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch recent activity with profiles
  const { data: logs, error } = await supabase
    .from('daily_logs')
    .select(`
      id,
      created_at,
      log_date,
      is_successful,
      sins_of_omission,
      sins_of_commission,
      profiles (
        username,
        avatar_url,
        streak,
        total_points
      ),
      challenges (
        title
      )
    `)
    .eq('is_successful', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching feed:', error)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="pt-16">
        <FeedHeader />
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 pb-20">
        <Suspense fallback={
          <div className="space-y-4 mt-4">
            {[...Array(5)].map((_, i) => (
              <FeedItemSkeleton key={i} />
            ))}
          </div>
        }>
          {logs && logs.length > 0 ? (
            <div className="space-y-4 mt-4">
              {logs.map((log, index) => (
                <FeedItem 
                  key={log.id} 
                  log={log as DailyLog}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </Suspense>
      </main>
    </div>
  )
}