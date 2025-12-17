import { createClient } from '@/utils/supabase/server'
import ChallengeList from '@/components/ChallengeList'
import { Suspense } from 'react'
import Link from 'next/link'

// Types
interface Challenge {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  created_at: string
}

interface User {
  id: string
  email?: string
}

// Sub-components
const PageHeader = ({ user }: { user: User | null }) => {
  const greeting = user 
    ? 'Hoş geldin, asker. Bugün hangi cepheye gidiyorsun?' 
    : 'Sınırlarını zorla, iradeni test et. 90 günlük dönüşüme hazır mısın?'

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8 animate-in fade-in slide-in-from-top duration-700">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-1 w-8 bg-gradient-to-r from-red-600 to-transparent rounded-full" />
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
            MEYDAN <span className="text-red-600 bg-clip-text bg-gradient-to-r from-red-600 to-red-500">OKU</span>
          </h1>
        </div>
        <p className="text-gray-400 text-sm md:text-base max-w-lg leading-relaxed">
          {greeting}
        </p>
      </div>
      
      {user && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-700 delay-200">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-red-600 hover:bg-gray-950 transition-all"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
              Dashboard
            </span>
          </Link>
          
          <Link
            href="/feed"
            className="group flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-green-600 hover:bg-gray-950 transition-all"
          >
            <div className="relative">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
              Canlı Akış
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}

const StatsBar = ({ totalChallenges }: { totalChallenges: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <div className="text-3xl font-black text-white">{totalChallenges}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Aktif Cephe</div>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center group-hover:bg-green-600/20 transition-colors">
          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <div className="text-3xl font-black text-white">1.2K</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Aktif Savaşçı</div>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-600/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-600/20 transition-colors">
          <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <div className="text-3xl font-black text-white">85%</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Başarı Oranı</div>
        </div>
      </div>
    </div>
  </div>
)

const EmptyState = ({ user }: { user: User | null }) => (
  <div className="text-center py-20 px-4 space-y-6 animate-in fade-in zoom-in duration-700">
    <div className="w-20 h-20 mx-auto bg-gray-900 rounded-full flex items-center justify-center border border-gray-800">
      <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-gray-300 mb-3">
        Henüz Aktif Cephe Yok
      </h3>
      <p className="text-gray-500 text-sm max-w-md mx-auto">
        {user 
          ? 'Yakında yeni görevler eklenecek. Dashboard\'tan mevcut görevlerini kontrol edebilirsin.'
          : 'Şu anda aktif görev bulunmuyor. Yeni görevler için takipte kal!'}
      </p>
    </div>
  </div>
)

const ChallengeListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-800 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-800 rounded" />
            <div className="h-4 bg-gray-800 rounded w-5/6" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-800 rounded w-20" />
            <div className="h-8 bg-gray-800 rounded w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Main Component
export default async function HomePage() {
  const supabase = await createClient()

  // Check for authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all challenges
  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching challenges:', error)
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-500">Veri Yükleme Hatası</h2>
          <p className="text-gray-400 text-sm">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
        </div>
      </main>
    )
  }

  const typedChallenges = challenges as Challenge[] || []

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 pb-20 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/5 via-black to-black pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <PageHeader user={user} />

        {/* Stats Bar */}
        {typedChallenges.length > 0 && (
          <StatsBar totalChallenges={typedChallenges.length} />
        )}

        {/* Section Title */}
        {typedChallenges.length > 0 && (
          <div className="flex items-center justify-between animate-in fade-in slide-in-from-left duration-700 delay-300">
            <div>
              <h2 className="text-2xl font-bold text-white">Aktif Görevler</h2>
              <p className="text-sm text-gray-500 mt-1">Meydan okunan cepheleri keşfet</p>
            </div>
            <Link
              href="/leaderboard"
              className="group flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-yellow-600 hover:bg-gray-950 transition-all"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                Liderlik
              </span>
            </Link>
          </div>
        )}

        {/* Challenge List */}
        <Suspense fallback={<ChallengeListSkeleton />}>
          {typedChallenges.length > 0 ? (
            <ChallengeList challenges={typedChallenges} />
          ) : (
            <EmptyState user={user} />
          )}
        </Suspense>

      </div>
    </main>
  )
}