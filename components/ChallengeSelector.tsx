'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type ChallengeSummary = {
  challenge_id: string
  challenges: {
    title: string
  } | null
}

export default function ChallengeSelector({ userChallenges }: { userChallenges: ChallengeSummary[] }) {
  const searchParams = useSearchParams()
  const currentId = searchParams.get('id')

  // Eğer URL'de ID yoksa, listenin ilki "aktif" sayılır (Varsayılan davranış)
  const activeId = currentId || userChallenges[0]?.challenge_id

  return (
    <div className="w-full overflow-x-auto pb-4 mb-2 no-scrollbar">
      <div className="flex gap-3">
        {userChallenges.map((uc) => {
          if (!uc.challenges) return null
          
          const isActive = uc.challenge_id === activeId

          return (
            <Link
              key={uc.challenge_id}
              href={`/dashboard?id=${uc.challenge_id}`} // Tıklayınca URL değişir
              scroll={false} // Sayfa zıplamasın
              className={`
                flex-shrink-0 px-5 py-3 rounded-xl border text-sm font-bold transition-all duration-300
                ${isActive 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_-3px_#dc2626] scale-105' 
                  : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                }
              `}
            >
              {isActive && <span className="mr-2">🔥</span>}
              {uc.challenges.title}
            </Link>
          )
        })}
      </div>
    </div>
  )
}