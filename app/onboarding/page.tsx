import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateUsername } from './actions'

export default async function Onboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Kullanıcı yoksa login'e at
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-md space-y-8 bg-gray-900 border border-gray-800 p-8 rounded-lg shadow-2xl">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Aramıza Hoşgeldin</h1>
          <p className="text-gray-400">
            Topluluğa katılmadan önce seni tanıyacağımız bir kod adı (Rumuz) belirle.
          </p>
        </div>

        <form action={updateUsername} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı Adı</label>
            <input
              name="username"
              type="text"
              placeholder="Örn: IronWill"
              required
              minLength={3}
              className="w-full bg-black border border-gray-700 rounded p-4 text-white focus:border-red-600 outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-2">Daha sonra değiştirebilirsin.</p>
          </div>

          <button className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded transition text-lg">
            Sisteme Giriş Yap →
          </button>
        </form>
      </div>
    </div>
  )
}