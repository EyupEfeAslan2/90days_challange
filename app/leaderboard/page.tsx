import { createClient } from '@/utils/supabase/server'
import { Suspense } from 'react'

// Types
interface Leader {
  id: string
  username: string
  streak: number
  total_points: number
  rank: number
}

interface LeaderWithBadge extends Leader {
  badge: string
  badgeColor: string
}

// Utility Functions
const getBadgeInfo = (rank: number, streak: number): { badge: string; color: string } => {
  if (rank === 1) return { badge: 'General ⭐️', color: 'text-yellow-500' }
  if (rank === 2) return { badge: 'Albay 🎖️', color: 'text-gray-400' }
  if (rank === 3) return { badge: 'Yüzbaşı 🏅', color: 'text-orange-600' }
  if (streak >= 30) return { badge: 'Yüzbaşı', color: 'text-blue-500' }
  if (streak >= 14) return { badge: 'Teğmen', color: 'text-green-500' }
  if (streak >= 7) return { badge: 'Çavuş', color: 'text-purple-500' }
  return { badge: 'Er', color: 'text-gray-500' }
}

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'text-yellow-500'
  if (rank === 2) return 'text-gray-400'
  if (rank === 3) return 'text-orange-600'
  return 'text-gray-600'
}

// Sub-components
const PodiumSkeleton = () => (
  <div className="grid grid-cols-3 gap-4 mb-12 items-end">
    {[48, 60, 40].map((height, i) => (
      <div 
        key={i}
        className="bg-gray-900/50 border border-gray-800 rounded-t-2xl p-4 animate-pulse"
        style={{ height: `${height * 4}px` }}
      >
        <div className="h-8 w-8 bg-gray-800 rounded-full mx-auto mb-2" />
        <div className="h-4 bg-gray-800 rounded w-20 mx-auto mb-1" />
        <div className="h-3 bg-gray-800 rounded w-16 mx-auto" />
      </div>
    ))}
  </div>
)

const ListSkeleton = () => (
  <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-5 border-b border-gray-800 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-8 h-6 bg-gray-800 rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-800 rounded w-24" />
            <div className="h-3 bg-gray-800 rounded w-16" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded w-12 ml-auto" />
          <div className="h-3 bg-gray-800 rounded w-20 ml-auto" />
        </div>
      </div>
    ))}
  </div>
)

const PodiumPlace = ({ 
  leader, 
  position 
}: { 
  leader: LeaderWithBadge
  position: 'first' | 'second' | 'third' 
}) => {
  const config = {
    first: {
      height: 'h-60',
      emoji: '🥇',
      gradient: 'bg-gradient-to-b from-yellow-900/30 to-black',
      border: 'border-yellow-600/30',
      glow: 'shadow-2xl shadow-yellow-900/20',
      bottomBar: 'bg-yellow-500 shadow-[0_0_25px_#eab308]',
      crown: true,
      textSize: 'text-2xl',
      order: 'order-2'
    },
    second: {
      height: 'h-48',
      emoji: '🥈',
      gradient: 'bg-gray-900/50',
      border: 'border-gray-800',
      glow: '',
      bottomBar: 'bg-gray-500 shadow-[0_0_15px_gray]',
      crown: false,
      textSize: 'text-lg',
      order: 'order-1'
    },
    third: {
      height: 'h-40',
      emoji: '🥉',
      gradient: 'bg-gray-900/50',
      border: 'border-gray-800',
      glow: '',
      bottomBar: 'bg-orange-700 shadow-[0_0_15px_#c2410c]',
      crown: false,
      textSize: 'text-lg',
      order: 'order-3'
    }
  }[position]

  return (
    <div className={`${config.order}`}>
      <div className={`
        ${config.gradient} ${config.border} ${config.glow}
        border rounded-t-2xl p-4 text-center ${config.height}
        flex flex-col justify-end items-center relative
        group hover:bg-gray-900/80 transition-all duration-300
        transform hover:scale-[1.02]
      `}>
        {config.crown && (
          <div className="absolute -top-6 text-3xl animate-bounce">
            👑
          </div>
        )}
        
        <div className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all duration-300">
          {config.emoji}
        </div>
        
        <div className={`font-black ${config.textSize} text-white mb-1 truncate max-w-full px-2`}>
          {leader.username}
        </div>
        
        <div className={`text-sm font-bold mb-1 ${leader.badgeColor}`}>
          {leader.badge}
        </div>
        
        <div className="text-sm text-gray-400 font-mono">
          {leader.total_points.toLocaleString()} Puan
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          🔥 {leader.streak} gün
        </div>
        
        <div className={`absolute -bottom-[1px] w-full h-1 ${config.bottomBar} transition-all duration-300`} />
      </div>
    </div>
  )
}

const LeaderboardRow = ({ 
  leader, 
  index 
}: { 
  leader: LeaderWithBadge
  index: number 
}) => {
  const rankColor = getRankColor(leader.rank)
  
  return (
    <div 
      className="flex items-center justify-between p-5 border-b border-gray-800 last:border-b-0 hover:bg-white/5 transition-all duration-300 group"
      style={{ 
        animationDelay: `${index * 50}ms`,
        animation: 'fadeIn 0.5s ease-out forwards',
        opacity: 0
      }}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <span className={`
          font-mono font-bold text-lg w-8 text-center flex-shrink-0
          ${rankColor}
        `}>
          #{leader.rank}
        </span>
        
        <div className="min-w-0 flex-1">
          <div className="font-bold text-white group-hover:text-red-500 transition-colors truncate">
            {leader.username}
          </div>
          <div className={`text-xs ${leader.badgeColor} font-medium`}>
            {leader.badge}
          </div>
        </div>
      </div>
      
      <div className="text-right flex-shrink-0">
        <div className="font-mono text-white font-bold">
          {leader.total_points.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
          <span>🔥</span>
          <span>{leader.streak} gün</span>
        </div>
      </div>
    </div>
  )
}

const EmptyState = () => (
  <div className="text-center py-20 px-4">
    <div className="max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
        <span className="text-4xl">🏆</span>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-300 mb-2">
          Henüz Lider Yok
        </h3>
        <p className="text-gray-500 text-sm">
          İlk lider olmak için görevlerini tamamlamaya başla!
        </p>
      </div>
    </div>
  </div>
)

// Main Component
export default async function LeaderboardPage() {
  const supabase = await createClient()
  
  // Fetch real leaderboard data
  // This assumes you have a view or query that calculates user rankings
  const { data: leaders, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      streak,
      total_points
    `)
    .order('total_points', { ascending: false })
    .order('streak', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching leaderboard:', error)
  }

  // Add ranks and badges to leaders
  const leadersWithBadges: LeaderWithBadge[] = (leaders || []).map((leader, index) => {
    const rank = index + 1
    const badgeInfo = getBadgeInfo(rank, leader.streak || 0)
    
    return {
      ...leader,
      rank,
      username: leader.username || `User_${leader.id.slice(0, 6)}`,
      streak: leader.streak || 0,
      total_points: leader.total_points || 0,
      badge: badgeInfo.badge,
      badgeColor: badgeInfo.color
    }
  })

  const topThree = leadersWithBadges.slice(0, 3)
  const remaining = leadersWithBadges.slice(3)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
            LİDERLİK TABLOSU
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base">
            Disiplin, en sessiz çığlıktır. İşte cephenin en iradeli savaşçıları.
          </p>
        </header>

        {/* Content */}
        {leadersWithBadges.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Podium (Top 3) */}
            <Suspense fallback={<PodiumSkeleton />}>
              {topThree.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-12 items-end">
                  <PodiumPlace leader={topThree[1]} position="second" />
                  <PodiumPlace leader={topThree[0]} position="first" />
                  <PodiumPlace leader={topThree[2]} position="third" />
                </div>
              )}
            </Suspense>

            {/* List (Remaining) */}
            <Suspense fallback={<ListSkeleton />}>
              {remaining.length > 0 && (
                <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                  {remaining.map((leader, index) => (
                    <LeaderboardRow 
                      key={leader.id} 
                      leader={leader} 
                      index={index}
                    />
                  ))}
                </div>
              )}
            </Suspense>
          </>
        )}

      </div>
    </div>
  )
}