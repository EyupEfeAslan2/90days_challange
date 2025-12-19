import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'
import Link from 'next/link'

// --- 1. TİP TANIMI (DOĞRUSU BU) ---
// Veritabanından tam olarak ne beklediğimizi tanımlıyoruz.
// "Any" diyip geçmek yerine, yapıyı kurallara bağlıyoruz.
interface ProfileData {
  username: string | null
  created_at: string
}

// --- MAIN PAGE ---
export default async function SettingsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string, success?: string }> 
}) {
  const supabase = await createClient()
  
  // Next.js 15 standardı: searchParams await edilir
  const params = await searchParams
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Veriyi çekiyoruz
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('username, created_at')
    .eq('id', user.id)
    .single()

  // --- 2. TİP GÜVENLİ DÖNÜŞÜM ---
  // Buraya gelen verinin 'ProfileData' şablonuna uyduğunu belirtiyoruz.
  // Artık TypeScript 'username'in varlığından emin olduğu için hata vermez.
  const profile = rawProfile as ProfileData | null

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 pt-24 pb-20">
      
      <div className="w-full max-w-xl space-y-6">
        
        {/* Breadcrumb / Nav */}
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition w-fit">
           <span>←</span> Dashboard'a Dön
        </Link>

        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-2xl shadow-xl">
          
          <div className="mb-8 border-b border-gray-800 pb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Hesap Ayarları</h1>
            <p className="text-gray-500 text-sm">Kimlik bilgilerinizi ve tercihlerinizi yönetin.</p>
          </div>

          {/* Feedback Messages */}
          {params?.error && (
             <div className="p-4 mb-6 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
                {params.error === 'short' && 'Kullanıcı adı çok kısa.'}
                {params.error === 'exists' && 'Bu kullanıcı adı zaten kullanımda.'}
                {params.error === 'failed' && 'Güncelleme başarısız oldu.'}
             </div>
          )}
          
          {params?.success && (
             <div className="p-4 mb-6 bg-green-900/20 border border-green-900/50 rounded-lg text-green-400 text-sm">
                Profil başarıyla güncellendi.
             </div>
          )}

          <form action={updateProfile} className="space-y-8">
            
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                Kullanıcı Adı
              </label>
              <input
                name="username"
                type="text"
                // Tip tanımlı olduğu için artık burada hata almazsın
                defaultValue={profile?.username || ''}
                required
                className="w-full bg-black border border-gray-700 focus:border-white rounded-xl p-4 text-white transition-all font-mono"
              />
            </div>

            {/* Read-only Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
               <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">E-Posta</div>
                  <div className="text-sm font-medium text-gray-300 truncate">{user.email}</div>
               </div>
               <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Katılım Tarihi</div>
                  <div className="text-sm font-medium text-gray-300">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR') : '-'}
                  </div>
               </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition active:scale-95"
              >
                Değişiklikleri Kaydet
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}