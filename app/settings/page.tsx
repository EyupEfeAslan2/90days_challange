import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'
import Link from 'next/link'
import { Suspense } from 'react'

// Types
interface Profile {
  username: string | null
  avatar_url?: string | null
  created_at?: string
}

// Sub-components
const PageHeader = () => (
  <div className="space-y-3 animate-in fade-in slide-in-from-top duration-700">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Profil Ayarları</h1>
        <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Kimlik Yönetimi</p>
      </div>
    </div>
    <div className="h-px bg-gradient-to-r from-red-600 via-red-600/50 to-transparent" />
    <p className="text-gray-400 text-sm leading-relaxed">
      Toplulukta görünecek kimliğini düzenle. Değişiklikler anında etkinleşir.
    </p>
  </div>
)

const UsernameField = ({ defaultValue }: { defaultValue: string }) => (
  <div className="space-y-3 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
    <label 
      htmlFor="username"
      className="flex items-center justify-between text-sm font-bold text-gray-300 uppercase tracking-wide"
    >
      <span>Kullanıcı Adı (Rumuz)</span>
      <span className="text-xs text-gray-600 normal-case tracking-normal font-normal">
        Gerekli *
      </span>
    </label>
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
      <input
        id="username"
        name="username"
        type="text"
        defaultValue={defaultValue}
        placeholder="Örn: StoicWarrior, IronMind, PhoenixSoul"
        required
        minLength={3}
        maxLength={20}
        pattern="^[a-zA-Z0-9_]+$"
        title="Sadece harf, rakam ve alt çizgi kullanabilirsiniz"
        autoComplete="username"
        className="relative w-full bg-gray-950 border-2 border-gray-700 rounded-xl p-4 text-white placeholder:text-gray-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/50 outline-none transition-all"
      />
    </div>
    <div className="flex items-start gap-2 text-xs text-gray-500">
      <svg className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <p>3-20 karakter arası. Sadece harf, rakam ve alt çizgi (_) kullanabilirsin.</p>
    </div>
  </div>
)

const ActionButtons = () => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
    <button 
      type="submit"
      className="group relative w-full bg-gradient-to-r from-white to-gray-100 text-black font-bold py-4 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 overflow-hidden"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Kaydet ve Dön
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/5 to-black/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
    </button>

    <Link 
      href="/dashboard"
      className="block w-full text-center py-3 border-2 border-gray-700 text-gray-400 font-bold rounded-xl hover:bg-gray-800 hover:border-gray-600 hover:text-white transition-all"
    >
      İptal Et
    </Link>
  </div>
)

const ProfileInfo = ({ profile, userEmail }: { profile: Profile | null; userEmail: string }) => (
  <div className="space-y-4 pt-6 border-t border-gray-800 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
      Hesap Bilgileri
    </h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-950/50 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-xs text-gray-500">E-posta</p>
            <p className="text-sm text-white font-mono truncate max-w-[200px]">{userEmail}</p>
          </div>
        </div>
        <span className="text-xs text-green-500 font-bold px-2 py-1 bg-green-500/10 rounded">
          Doğrulandı
        </span>
      </div>
      
      {profile?.created_at && (
        <div className="flex items-center gap-3 p-3 bg-gray-950/50 rounded-lg border border-gray-800">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-xs text-gray-500">Üyelik Tarihi</p>
            <p className="text-sm text-white">
              {new Date(profile.created_at).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
)

const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-3">
      <div className="h-4 bg-gray-800 rounded w-32" />
      <div className="h-14 bg-gray-800 rounded-xl" />
      <div className="h-3 bg-gray-800 rounded w-full" />
    </div>
    <div className="space-y-4">
      <div className="h-14 bg-gray-800 rounded-xl" />
      <div className="h-12 bg-gray-800 rounded-xl" />
    </div>
  </div>
)

// Main Component
export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 pt-24 pb-20 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-black to-black pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="space-y-8 bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl hover:border-gray-700 transition-all duration-500">
          
          {/* Header */}
          <PageHeader />

          {/* Form */}
          <Suspense fallback={<FormSkeleton />}>
            <form action={updateProfile} className="space-y-6">
              <UsernameField defaultValue={profile?.username || ''} />
              <ActionButtons />
            </form>
          </Suspense>

          {/* Account Info */}
          <ProfileInfo profile={profile} userEmail={user.email || 'Bilinmiyor'} />

        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center space-y-2 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <p className="text-xs text-gray-600">
            Değişiklikler anında tüm sistemde güncellenir.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard'a Dön
          </Link>
        </div>
      </div>
    </div>
  )
}