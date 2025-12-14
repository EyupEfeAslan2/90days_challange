'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Challenge } from '@/types/database.types'

export default function ChallengeList({ challenges }: { challenges: Challenge[] }) {
  const [filter, setFilter] = useState<'active' | 'future' | 'past'>('active')

  // BUGÜNÜN TARİHİNİ STRING OLARAK AL (YYYY-MM-DD formatında)
  // Bu yöntem saat farkını yok sayar, direkt takvim gününe bakar.
  const today = new Date().toLocaleDateString('en-CA') // en-CA formatı YYYY-MM-DD verir

  const filteredChallenges = challenges.filter((c) => {
    // Veritabanından gelen tarihler zaten "YYYY-MM-DD" formatında string
    const start = c.start_date
    const end = c.end_date

    if (filter === 'future') {
      // Başlangıç tarihi bugünden büyükse (Alfabetik kıyaslama stringlerde tarih için çalışır)
      return start > today
    }
    if (filter === 'past') {
      // Bitiş tarihi bugünden küçükse
      return end < today
    }
    if (filter === 'active') {
      // Başlangıç bugün veya geçmişteyse VE Bitiş bugün veya gelecekteyse
      return start <= today && end >= today
    }
    return false
  })

  return (
    <div className="space-y-6">
      {/* --- SEKMELER --- */}
      <div className="flex p-1 bg-gray-900 rounded-xl border border-gray-800">
        <TabButton active={filter === 'active'} onClick={() => setFilter('active')}>Aktif 🔥</TabButton>
        <TabButton active={filter === 'future'} onClick={() => setFilter('future')}>Gelecek ⏳</TabButton>
        <TabButton active={filter === 'past'} onClick={() => setFilter('past')}>Geçmiş 🏁</TabButton>
      </div>

      {/* --- YENİ OLUŞTUR BUTONU --- */}
      <div className="flex justify-end">
        <Link 
          href="/create-challenge" 
          className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition"
        >
          + Yeni Yarışma
        </Link>
      </div>

      {/* --- LİSTE --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredChallenges.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
            <p>Bu kategoride henüz bir meydan okuma yok.</p>
          </div>
        ) : (
          filteredChallenges.map((challenge) => (
            <Link 
              href={`/challenge/${challenge.id}`} 
              key={challenge.id}
              className="group relative block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-red-600/50 transition-all hover:shadow-xl hover:shadow-red-900/10"
            >
              <div className="absolute top-4 right-4">
                {filter === 'active' && <span className="animate-pulse w-2 h-2 rounded-full bg-green-500 block shadow-[0_0_10px_#22c55e]"></span>}
              </div>
              
              <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
                {challenge.title}
              </h3>
              
              <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                {challenge.description || "Açıklama girilmemiş."}
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-mono">
                <span>📅 {challenge.start_date}</span>
                <span>➡</span>
                <span>🏁 {challenge.end_date}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
        active
          ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  )
}