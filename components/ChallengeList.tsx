'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Challenge } from '@/types/database.types'

type FilterType = 'active' | 'future' | 'past'

// Utility Functions
const getTodayString = (): string => {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD format
}

const calculateDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate)
  const today = new Date()
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const calculateProgress = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const today = new Date().getTime()
  
  if (today < start) return 0
  if (today > end) return 100
  
  const total = end - start
  const elapsed = today - start
  return Math.round((elapsed / total) * 100)
}

const getChallengeStatus = (startDate: string, endDate: string, today: string) => {
  if (startDate > today) return 'future'
  if (endDate < today) return 'past'
  return 'active'
}

// Sub-components
const TabButton = ({ 
  children, 
  active, 
  onClick,
  count 
}: { 
  children: React.ReactNode
  active: boolean
  onClick: () => void
  count: number
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all duration-300
        ${active
          ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }
      `}
    >
      <span className="flex items-center justify-center gap-2">
        {children}
        {count > 0 && (
          <span className={`
            text-xs px-2 py-0.5 rounded-full font-bold
            ${active 
              ? 'bg-white/20 text-white' 
              : 'bg-gray-700 text-gray-400'
            }
          `}>
            {count}
          </span>
        )}
      </span>
    </button>
  )
}

const ChallengeCard = ({ 
  challenge, 
  status 
}: { 
  challenge: Challenge
  status: 'active' | 'future' | 'past'
}) => {
  const progress = status === 'active' ? calculateProgress(challenge.start_date, challenge.end_date) : 0
  const daysRemaining = status === 'active' ? calculateDaysRemaining(challenge.end_date) : 0

  const statusConfig = {
    active: {
      badge: 'Aktif',
      badgeColor: 'bg-green-500/10 text-green-500 border-green-500/20',
      indicator: 'bg-green-500 shadow-[0_0_10px_#22c55e]',
      showProgress: true
    },
    future: {
      badge: 'Yakında',
      badgeColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      indicator: 'bg-yellow-500',
      showProgress: false
    },
    past: {
      badge: 'Tamamlandı',
      badgeColor: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      indicator: 'bg-gray-500',
      showProgress: false
    }
  }[status]

  return (
    <Link 
      href={`/challenge/${challenge.id}`}
      className="group relative block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-red-600/50 transition-all hover:shadow-xl hover:shadow-red-900/10 hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <div className={`
          flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold
          ${statusConfig.badgeColor}
        `}>
          <span className={`w-2 h-2 rounded-full ${statusConfig.indicator} ${status === 'active' ? 'animate-pulse' : ''}`} />
          {statusConfig.badge}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors pr-24">
        {challenge.title}
      </h3>
      
      {/* Description */}
      <p className="mt-3 text-sm text-gray-400 line-clamp-2 leading-relaxed">
        {challenge.description || "Açıklama girilmemiş."}
      </p>

      {/* Progress Bar (Active only) */}
      {statusConfig.showProgress && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">İlerleme</span>
            <span className="text-white font-bold font-mono">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {daysRemaining > 0 && (
            <div className="text-xs text-gray-500">
              <span className="text-red-400 font-bold">{daysRemaining}</span> gün kaldı
            </div>
          )}
        </div>
      )}

      {/* Date Range */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500 font-mono">
        <div className="flex items-center gap-2">
          <span>🚀</span>
          <span>{new Date(challenge.start_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
        </div>
        <div className="w-8 h-[1px] bg-gray-700" />
        <div className="flex items-center gap-2">
          <span>🏁</span>
          <span>{new Date(challenge.end_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>
    </Link>
  )
}

const EmptyState = ({ filter }: { filter: FilterType }) => {
  const messages = {
    active: {
      icon: '🔥',
      title: 'Aktif Görev Yok',
      description: 'Şu anda devam eden bir görev bulunmuyor.'
    },
    future: {
      icon: '⏳',
      title: 'Gelecek Görev Yok',
      description: 'Yakında başlayacak bir görev henüz planlanmadı.'
    },
    past: {
      icon: '🏁',
      title: 'Tamamlanan Görev Yok',
      description: 'Henüz tamamlanmış bir görev bulunmuyor.'
    }
  }[filter]

  return (
    <div className="col-span-full text-center py-16 px-4 border border-dashed border-gray-800 rounded-xl bg-gray-950/30">
      <div className="w-16 h-16 mx-auto bg-gray-900 rounded-full flex items-center justify-center text-3xl mb-4">
        {messages.icon}
      </div>
      <h3 className="text-lg font-bold text-gray-300 mb-2">
        {messages.title}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        {messages.description}
      </p>
    </div>
  )
}

// Main Component
export default function ChallengeList({ challenges }: { challenges: Challenge[] }) {
  const [filter, setFilter] = useState<FilterType>('active')
  const today = getTodayString()

  // Memoized filtering and categorization
  const categorizedChallenges = useMemo(() => {
    const active: Challenge[] = []
    const future: Challenge[] = []
    const past: Challenge[] = []

    challenges.forEach((c) => {
      const status = getChallengeStatus(c.start_date, c.end_date, today)
      if (status === 'active') active.push(c)
      else if (status === 'future') future.push(c)
      else past.push(c)
    })

    return { active, future, past }
  }, [challenges, today])

  const filteredChallenges = categorizedChallenges[filter]

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex p-1 bg-gray-900 rounded-xl border border-gray-800 w-full sm:w-auto">
          <TabButton 
            active={filter === 'active'} 
            onClick={() => setFilter('active')}
            count={categorizedChallenges.active.length}
          >
            Aktif 🔥
          </TabButton>
          <TabButton 
            active={filter === 'future'} 
            onClick={() => setFilter('future')}
            count={categorizedChallenges.future.length}
          >
            Gelecek ⏳
          </TabButton>
          <TabButton 
            active={filter === 'past'} 
            onClick={() => setFilter('past')}
            count={categorizedChallenges.past.length}
          >
            Geçmiş 🏁
          </TabButton>
        </div>

        {/* Create New Button */}
        <Link 
          href="/create-challenge" 
          className="group flex items-center gap-2 bg-gradient-to-r from-white to-gray-100 text-black px-6 py-3 rounded-xl font-bold text-sm hover:from-gray-100 hover:to-gray-200 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Yeni Yarışma</span>
        </Link>
      </div>

      {/* Challenge Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredChallenges.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          filteredChallenges.map((challenge) => (
            <ChallengeCard 
              key={challenge.id} 
              challenge={challenge}
              status={filter}
            />
          ))
        )}
      </div>

      {/* Summary Stats */}
      {challenges.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap gap-6 justify-center text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{challenges.length}</span>
            <span>Toplam Görev</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-green-500">{categorizedChallenges.active.length}</span>
            <span>Aktif</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-yellow-500">{categorizedChallenges.future.length}</span>
            <span>Gelecek</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500">{categorizedChallenges.past.length}</span>
            <span>Tamamlandı</span>
          </div>
        </div>
      )}
    </div>
  )
}