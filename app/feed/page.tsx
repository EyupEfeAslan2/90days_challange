import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function FeedPage() {
  const supabase = await createClient()

  // Giriş kontrolü (Girmeyen akışı göremez)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // SON 50 HAREKETİ ÇEK
  // İlişkisel veri çekiyoruz: Günlük kaydı + O kaydı atanın kullanıcı adı
  const { data: logs } = await supabase
    .from('daily_logs')
    .select(`
      created_at,
      is_successful,
      profiles ( username, avatar_url )
    `)
    .eq('is_successful', true) // Sadece başarıları gösterelim (Negatiflik yaymayalım)
    .order('created_at', { ascending: false }) // En yeni en üstte
    .limit(50)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Basit Navbar */}
      <nav className="border-b border-gray-800 p-4 sticky top-0 bg-black/80 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard'a Dön
          </Link>
          <h1 className="text-xl font-bold text-red-600 tracking-tighter">CANLI AKIŞ</h1>
          <div className="w-20"></div> {/* Hizalama için boşluk */}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {logs && logs.length > 0 ? (
          logs.map((log: any, index) => (
            <div key={index} className="bg-gray-900/40 border border-gray-800 p-4 rounded-lg flex items-center gap-4 hover:border-gray-700 transition">
              
              {/* Avatar (Basit yuvarlak) */}
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-800 to-black flex items-center justify-center font-bold text-sm border border-gray-700">
                {log.profiles?.username?.[0]?.toUpperCase() || '?'}
              </div>

              {/* İçerik */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-200">
                    @{log.profiles?.username || 'Gizli Üye'}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <p className="text-green-500 text-sm mt-1 flex items-center gap-2">
                  <span>✓</span>
                  Bugünkü hedeflerini tamamladı.
                </p>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>Henüz kimse hareket etmedi.</p>
            <p className="text-sm mt-2">İlk sen ol!</p>
          </div>
        )}
      </main>
    </div>
  )
}