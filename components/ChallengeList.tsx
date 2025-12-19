import Link from 'next/link'
import { createClient } from '@/utils/supabase/server' // Standart client
import DeleteButton from './DeleteButton'
// HATA ÇÖZÜMÜ: Yanlış dosya yolu yerine ana actions dosyasını kullanıyoruz
import { deleteChallenge } from '@/app/actions' 

// Types (Veritabanı tiplerinden bağımsız manuel tanımladım ki hata riski azalsın)
interface Challenge {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  created_by: string
  is_public: boolean
}

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
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-gray-900/20 rounded-2xl border border-dashed border-gray-800">
      <div className="text-6xl mb-4 grayscale opacity-50">🎯</div>
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
    <div className="group relative bg-[#0f1115] border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:border-gray-600 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-full">
      
      {/* Delete Button (Owner Only) */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <DeleteButton
            onDelete={async () => {
              'use server'
              // Action ismi düzeltildi: deleteChallengeAction -> deleteChallenge
              await deleteChallenge(challenge.id)
            }}
            title="Bu cepheyi sil"
            className="w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-red-900 text-gray-400 hover:text-white border border-gray-700 hover:border-red-500 rounded-full backdrop-blur-md transition"
          />
        </div>
      )}

      {/* Content */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
            <span className={`w-2 h-2 rounded-full ${new Date(challenge.end_date) < new Date() ? 'bg-gray-500' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {new Date(challenge.end_date) < new Date() ? 'TAMAMLANDI' : 'AKTİF'}
            </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-red-500 transition-colors">
          {challenge.title}
        </h3>
        
        <p className="text-gray-400 text-sm line-clamp-2 min-h-[40px]">
          {challenge.description || 'Açıklama girilmemiş.'}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-gray-800 pt-4">
          <div>
            <span className="block text-gray-600 font-bold mb-0.5">BAŞLANGIÇ</span>
            <span className="text-gray-300">{formatDate(challenge.start_date)}</span>
          </div>
          <div className="text-right">
            <span className="block text-gray-600 font-bold mb-0.5">BİTİŞ</span>
            <span className="text-gray-300">{formatDate(challenge.end_date)}</span>
          </div>
        </div>

        <Link 
            href={`/challenge/${challenge.id}`}
            className="block w-full text-center bg-white text-black py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-transform active:scale-95"
        >
            İNCELE & KATIL
        </Link>
      </div>
    </div>
  )
}

// Main Component
export default async function ChallengeList() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch challenges (Standart Supabase sorgusu)
  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_public', true)
    .order('start_date', { ascending: false })

  if (error) {
    return (
      <div className="py-20 text-center border border-red-900/30 bg-red-900/10 rounded-2xl mx-4">
        <p className="text-red-500 font-bold mb-2">⚠️ Veri Bağlantı Hatası</p>
        <p className="text-xs text-red-400 opacity-70 font-mono">{error.message}</p>
      </div>
    )
  }

  // Add ownership info
  const challengesWithOwnership: ChallengeWithOwnership[] = (challenges || []).map(
    (challenge) => ({
      ...challenge,
      isOwner: user?.id === challenge.created_by,
    })
  )

  return (
    <section>
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
    </section>
  )
}