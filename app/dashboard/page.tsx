import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signout } from '@/app/login/actions'
import { logDailyStatus } from './actions'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()

  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Profil Bilgisini Çek (Username için)
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  // Eğer kullanıcı adı yoksa, ayarlara gitmesi için uyarı gösterilebilir veya yönlendirilebilir.
  // Şimdilik e-mail gösterelim eğer yoksa.

  // 3. Tarih Hesapları
  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]

  // 4. Verileri Çek
  const { data: todaysLog } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('created_at', todayISO)
    .single()

  const { data: allLogs } = await supabase
    .from('daily_logs')
    .select('*') // Tüm sütunları çek (is_successful, created_at)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) // En yeniden eskiye

  // 5. Seri Hesaplama
  let currentStreak = 0
  let checkDate = new Date(today)
  const successfulDates = new Set(allLogs?.filter(l => l.is_successful).map(l => l.created_at) || [])

  while (true) {
    const checkString = checkDate.toISOString().split('T')[0]
    if (successfulDates.has(checkString)) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      if (checkString === todayISO) {
         checkDate.setDate(checkDate.getDate() - 1)
         continue
      }
      break
    }
  }

  const totalDays = allLogs?.filter(l => l.is_successful).length || 0

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center py-6 border-b border-gray-800">
          <Link href="/" className="text-2xl font-bold text-red-600 tracking-tighter">90 GÜN</Link>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-gray-400 hover:text-white text-sm hidden sm:inline transition border-b border-transparent hover:border-gray-500">
              {profile?.username ? `@${profile.username}` : user.email}
            </Link>
            <form action={signout}>
              <button className="text-gray-400 hover:text-white text-sm transition">Çıkış</button>
            </form>
          </div>
        </header>

        {/* Ana İçerik */}
        <div className="mt-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Günlük Takip</h1>
            <p className="text-gray-400">
              {today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">Toplam Başarı</p>
              <p className="text-3xl font-bold text-white">{totalDays} Gün</p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">Mevcut Seri</p>
              <p className={`text-3xl font-bold ${currentStreak > 0 ? 'text-green-500' : 'text-gray-500'}`}>
                {currentStreak} Gün
              </p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">Hedef</p>
              <p className="text-3xl font-bold text-red-600">90 Gün</p>
            </div>
          </div>

          {/* Aksiyon Alanı */}
          <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800 text-center space-y-4">
            {todaysLog ? (
              <div className="py-4">
                {todaysLog.is_successful ? (
                   <div>
                     <h3 className="text-3xl font-bold text-green-500 mb-2">GÖREV TAMAMLANDI</h3>
                     <p className="text-gray-400">Zincir devam ediyor.</p>
                   </div>
                ) : (
                   <div>
                     <h3 className="text-3xl font-bold text-red-600 mb-2">BAŞARISIZ</h3>
                     <p className="text-gray-400">Seri bozuldu.</p>
                   </div>
                )}
              </div>
            ) : (
              <>
                <p className="text-gray-300">Bugün hedeflerini tamamladın mı?</p>
                <form action={logDailyStatus} className="flex gap-4 justify-center">
                  <button name="status" value="true" className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-all hover:scale-105">✓ Başarılı</button>
                  <button name="status" value="false" className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all hover:scale-105">✗ Başarısız</button>
                </form>
              </>
            )}
          </div>

          {/* Geçmiş Listesi - ARTIK DOLU! */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Geçmiş Kayıtlar</h2>
            <div className="space-y-2">
              {allLogs && allLogs.length > 0 ? (
                allLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center bg-gray-900/30 p-4 rounded border border-gray-800">
                    <span className="text-gray-300">
                      {new Date(log.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </span>
                    <span className={log.is_successful ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                      {log.is_successful ? 'Tamamlandı' : 'Başarısız'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">Henüz kayıt yok.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}