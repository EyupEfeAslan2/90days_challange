import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md space-y-8 p-8 border border-gray-800 rounded-lg bg-gray-900">
        
        <h2 className="text-3xl font-bold text-center text-red-600">GİRİŞ YAP</h2>

        <form className="space-y-6">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-red-600 outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Şifre"
            required
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-red-600 outline-none"
          />

          <div className="flex gap-4">
            <button formAction={login} className="w-full bg-red-700 hover:bg-red-600 py-3 rounded font-bold transition">
              Giriş Yap
            </button>
            <button formAction={signup} className="w-full border border-gray-600 hover:bg-gray-800 py-3 rounded font-bold transition">
              Kayıt Ol
            </button>
          </div>
        </form>
        
      </div>
    </div>
  )
}