// components/ChallengeSelector.tsx
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

// Types
type Challenge = {
  title: string
  end_date?: string
}

type UserChallenge = {
  challenge_id: string
  challenges: Challenge | null
}

type ChipIconType = '🔥' | '⚠️' | '📋'

// Constants
const SCROLL_AMOUNT = 200

// Utility Functions
function calculateDaysRemaining(endDate?: string): number | null {
  if (!endDate) return null
  
  const end = new Date(endDate)
  const today = new Date()
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}

function getChallengeIcon(
  isActive: boolean, 
  daysRemaining: number | null
): ChipIconType {
  if (isActive) return '🔥'
  if (daysRemaining !== null && daysRemaining < 7) return '⚠️'
  return '📋'
}

// Sub-components
function ScrollButton({ 
  direction, 
  onClick,
  visible 
}: { 
  direction: 'left' | 'right'
  onClick: () => void
  visible: boolean
}) {
  if (!visible) return null

  const isLeft = direction === 'left'

  return (
    <button
      onClick={onClick}
      className={`
        absolute top-1/2 -translate-y-1/2 z-10 
        w-10 h-10 bg-gray-900/90 backdrop-blur-sm 
        border border-gray-800 rounded-full 
        flex items-center justify-center
        transition-all duration-300
        hover:bg-gray-800 hover:border-gray-700 hover:scale-110 
        active:scale-95 shadow-lg
        ${isLeft ? 'left-0' : 'right-0'}
      `}
      aria-label={`${direction === 'left' ? 'Sola' : 'Sağa'} kaydır`}
    >
      <svg 
        className="w-5 h-5 text-gray-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={isLeft ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} 
        />
      </svg>
    </button>
  )
}

function ChallengeChip({ 
  challenge,
  isActive,
  daysRemaining
}: { 
  challenge: UserChallenge
  isActive: boolean
  daysRemaining: number | null
}) {
  const icon = getChallengeIcon(isActive, daysRemaining)
  const showDaysLabel = daysRemaining !== null && daysRemaining < 30

  return (
    <Link
      href={`/dashboard?id=${challenge.challenge_id}`}
      scroll={false}
      className={`
        group relative flex-shrink-0 px-5 py-3 rounded-xl 
        border text-sm font-bold overflow-hidden
        transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-r from-red-600 to-red-500 border-red-500 text-white shadow-[0_0_20px_-5px_#dc2626] scale-105' 
          : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-900'
        }
      `}
    >
      {/* Shine Effect (Active Only) */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        <span className={isActive ? 'animate-pulse' : ''}>
          {icon}
        </span>
        <span className="truncate max-w-[150px] md:max-w-[200px]">
          {challenge.challenges?.title}
        </span>
        {showDaysLabel && (
          <span className={`
            text-[10px] px-2 py-0.5 rounded-full font-bold
            ${isActive 
              ? 'bg-white/20 text-white' 
              : daysRemaining < 7 
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gray-800 text-gray-500'
            }
          `}>
            {daysRemaining}g
          </span>
        )}
      </span>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center py-8 px-4 bg-gray-900/30 border border-dashed border-gray-800 rounded-xl">
      <div className="text-center space-y-2">
        <span className="text-4xl block">📭</span>
        <p className="text-sm text-gray-500">Henüz bir göreve katılmadınız</p>
        <Link 
          href="/"
          className="inline-block text-xs text-red-500 hover:text-red-400 underline transition-colors"
        >
          Görevleri keşfedin
        </Link>
      </div>
    </div>
  )
}

function GradientFade({ 
  direction, 
  visible 
}: { 
  direction: 'left' | 'right'
  visible: boolean 
}) {
  if (!visible) return null

  const isLeft = direction === 'left'

  return (
    <div 
      className={`
        absolute top-0 bottom-4 w-12 pointer-events-none
        ${isLeft 
          ? 'left-0 bg-gradient-to-r from-black via-black/50 to-transparent' 
          : 'right-0 bg-gradient-to-l from-black via-black/50 to-transparent'
        }
      `}
    />
  )
}

// Main Component
export default function ChallengeSelector({ 
  userChallenges 
}: { 
  userChallenges: UserChallenge[] 
}) {
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)

  const currentId = searchParams.get('id')
  const activeId = currentId || userChallenges[0]?.challenge_id

  // Check scroll availability
  const checkScroll = () => {
    if (!containerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setShowLeftScroll(scrollLeft > 0)
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [userChallenges])

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return

    const scrollAmount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT
    containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    
    setTimeout(checkScroll, 300)
  }

  // Empty state
  if (!userChallenges || userChallenges.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="relative w-full">
      {/* Scroll Buttons */}
      <ScrollButton 
        direction="left" 
        onClick={() => scroll('left')}
        visible={showLeftScroll}
      />
      <ScrollButton 
        direction="right" 
        onClick={() => scroll('right')}
        visible={showRightScroll}
      />

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        onScroll={checkScroll}
        className="w-full overflow-x-auto pb-4 mb-2 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex gap-3 px-1">
          {userChallenges.map((uc) => {
            if (!uc.challenges) return null
            
            const isActive = uc.challenge_id === activeId
            const daysRemaining = calculateDaysRemaining(uc.challenges.end_date)

            return (
              <ChallengeChip
                key={uc.challenge_id}
                challenge={uc}
                isActive={isActive}
                daysRemaining={daysRemaining}
              />
            )
          })}
        </div>
      </div>

      {/* Gradient Fade Edges */}
      <GradientFade direction="left" visible={showLeftScroll} />
      <GradientFade direction="right" visible={showRightScroll} />

      {/* Challenge Count */}
      {userChallenges.length > 1 && (
        <div className="text-xs text-gray-600 text-center mt-2">
          {userChallenges.length} görev
        </div>
      )}
    </div>
  )
}