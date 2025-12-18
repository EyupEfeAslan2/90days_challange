// components/ChallengeList.tsx
import Link from 'next/link'
import { getServerUser, queryBuilder } from '@/utils/supabase/server'
import type { Challenge } from '@/types/database.types'
import DeleteButton from './DeleteButton'
import { deleteChallengeAction } from '@/app/actions/challenges'

// Types
type ChallengeWithOwnership = Challenge & {
  isOwner: boolean
}

// Utility Functions
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Sub-components
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">🎯</div>
      <h3 className="text-xl font-bold text-white mb-2">Henüz Cephe Yok</h3>
      <p className="text-gray-500 text-sm text-center max-w-md">
        İlk meydan okumayı oluşturun ve sınırlarınızı zorlayın.
      </p>
    </div>
  )
}

function ChallengeCard({ 
  challenge, 
  isOwner 
}: { 
  challenge: Challenge
  isOwner: boolean 
}) {
  return (
    <div className="group relative bg-gray-900/30 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:border-gray-600 hover:shadow-lg hover:shadow-red-900/10 flex flex-col justify-between">
      
      {/* Delete Button (Owner Only) */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <DeleteButton
            onDelete={async () => {
              'use server'
              await deleteChallengeAction(challenge.id)
            }}
            title="Bu cepheyi sil"
            className="p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white"
          />
        </div>
      )}

      {/* Content */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2 pr-10">
          {challenge.title}
        </h3>
        
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {challenge.description || 'Açıklama yok.'}
        </p>
        
        {/* Dates */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <span className="text-green-500">▶</span>
            <span>BAŞLANGIÇ:</span>
            <span className="text-gray-400">{formatDate(challenge.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <span className="text-red-500">■</span>
            <span>BİTİŞ:</span>
            <span className="text-gray-400">{formatDate(challenge.end_date)}</span>
          </div>
        </div>
      </div>

      {/* Join Button */}
      <Link 
        href={`/dashboard?id=${challenge.id}`}
        className="block w-full text-center bg-gray-800 py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:bg-red-700 hover:text-white hover:shadow-lg hover:shadow-red-900/20"
      >
        CEPHYE KATIL
      </Link>
    </div>
  )
}

// Main Component
export default async function ChallengeList() {
  const user = await getServerUser()

  // Fetch challenges
  const { data: challenges, error } = await queryBuilder('challenges')
    .select('*')
    .eq('is_public', true)
    .order('start_date', { ascending: false })

  if (error) {
    return (
      <div className="text-red-500 pt-32 text-center">
        <p className="text-xl font-bold mb-2">⚠️ Sistem Hatası</p>
        <p className="text-sm text-gray-400">{error.message}</p>
      </div>
    )
  }

  // Add ownership info to challenges
  const challengesWithOwnership: ChallengeWithOwnership[] = (challenges || []).map(
    (challenge) => ({
      ...challenge,
      isOwner: user?.id === challenge.created_by,
    })
  )

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 pt-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              MEYDAN <span className="text-red-600">OKU</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">
              Sınırlarını zorla. Bir cephe seç veya kendin yarat.
            </p>
          </div>
          
          {user && (
            <Link 
              href="/create-challenge" 
              className="group bg-white text-black px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:bg-gray-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span className="text-lg group-hover:rotate-90 transition-transform">+</span>
              <span>YENİ CEPHE OLUŞTUR</span>
            </Link>
          )}
        </div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challengesWithOwnership.length === 0 ? (
            <EmptyState />
          ) : (
            challengesWithOwnership.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isOwner={challenge.isOwner}
              />
            ))
          )}
        </div>

      </div>
    </main>
  )
}