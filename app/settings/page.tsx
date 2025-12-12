import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'
import Link from 'next/link'

export default async function Settings() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Mevcut profili çek (Eski username'i inputa yazmak için)
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-gray-900/50 p-8 rounded-lg border border-gray-800">
        
        <div>
          <h2 className="text-2xl font-bold text-red-600">Kimlik Oluştur</h2>
          <p className="text-gray-400 text-sm mt-2">
            Toplulukta görünecek ismini (Rumuz) belirle.
          </p>
        </div>

        <form action={updateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı Adı</label>
            <input
              name="username"
              type="text"
              defaultValue={profile?.username || ''}
              placeholder="Örn: StoicWarrior"
              className="w-full bg-gray-950 border border-gray-700 rounded p-3 text-white focus:border-red-600 outline-none"
              required
            />
          </div>

          <button className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition">
            Kaydet ve Dön
          </button>
        </form>

        <div className="text-center">
             <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-300">
                İptal Et
             </Link>
        </div>

      </div>
    </div>
  )
}