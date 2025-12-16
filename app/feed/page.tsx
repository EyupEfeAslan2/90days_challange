import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

// Types
interface Profile {
  username: string | null
  avatar_url: string | null
}

interface DailyLog {
  created_at: string
  is_successful: boolean
  profiles: Profile | Profile[] | null
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
  
  return date.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Sub-components
const FeedItemSkeleton = () => (
  <div className="bg-gray-900/40 border border-gray-800 p-4 rounded-lg flex items-center gap-4 animate-pulse">
    <div className="h-10 w-10 rounded-full bg-gray-800" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-800 rounded w-32" />
      <div className="h-3 bg-gray-800 rounded w-48" />
    </div>
  </div>
)

const FeedItem = ({ log, index }: { log: DailyLog; index: number }) => {
  const profile = normalizeProfile(log.profiles)
  const username = profile?.username || 'Gizli Üye'
  const initials = getInitials(profile?.username)
  const timeAgo = formatRelativeTime(log.created_at)

  return (
    <article 
      className="bg-gray-900/40 border border-gray-800 p-4 rounded-lg flex items-center gap-4 hover:border-gray-700 hover:bg-gray-900/60 transition-all duration-300 group opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
      style={{ 
        animationDelay: `${index * 50}ms`
      }}
    >
      
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-800 to-black flex items-center justify-center font-bold text-sm border border-gray-700 group-hover:border-red-700 transition-colors">
          {initials}
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
          <span className="text-[8px] text-white">✓</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="font-bold text-gray-200 truncate">
            @{username}
          </p>
          <time 
            dateTime={log.created_at}
            className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0"
          >
            {timeAgo}
          </time>
        </div>
        <p className="text-green-500 text-sm mt-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Bugünkü hedeflerini tamamladı
        </p>
      </div>

    </article>
  )
}

const EmptyState = () => (
  <div className="text-center py-20 px-4">
    <div className="max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-300 mb-2">
          Henüz Kimse Hareket Etmedi
        </h3>
        <p className="text-gray-500 text-sm">
          İlk hareketi yapan sen ol! Dashboard'a git ve bugünkü görevini tamamla.
        </p>
      </div>
      <Link 
        href="/dashboard" 
        className="inline-block bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-red-600 transition-all active:scale-95 mt-4"
      >
        Göreve Başla
      </Link>
    </div>
  </div>
)

const FeedHeader = () => (
  <div className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-16 z-20">
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h1 className="text-xl font-bold text-red-600 tracking-tighter">CANLI AKIŞ</h1>
        </div>
        
        <div className="w-20" /> {/* Spacer for alignment */}
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

  // Fetch recent activity
  const { data: logs, error } = await supabase
    .from('daily_logs')
    .select(`
      created_at,
      is_successful,
      profiles ( username, avatar_url )
    `)
    .eq('is_successful', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching feed:', error)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - pt-16 to account for main navbar */}
      <div className="pt-16">
        <FeedHeader />
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 pb-20">
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
                  key={`${log.created_at}-${index}`} 
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