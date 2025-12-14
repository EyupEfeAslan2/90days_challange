'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from './SignOutButton'
import { User } from '@supabase/supabase-js'

export default function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/signup') return null

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-gradient-to-b from-black via-black/80 to-transparent">
      <div className="max-w-7xl mx-auto px-6 h-24 grid grid-cols-3 items-center">

        {/* --- SOL: LOGO --- */}
        <Link href="/dashboard" className="justify-self-start">
          <div className="text-3xl font-black tracking-tighter text-white">
            90<span className="text-red-600 hover:text-red-500 transition-colors">DAYS</span>
          </div>
        </Link>

        {/* --- ORTA: MENÜ (GERÇEK ORTA) --- */}
        {user && (
          <div className="hidden md:flex justify-self-center items-center gap-8">
            <NavItem href="/dashboard" active={pathname === '/dashboard'}>
              Dashboard
            </NavItem>
            <NavItem href="/" active={pathname === '/'}>
              Meydan Oku
            </NavItem>
            <NavItem href="/feed" active={pathname === '/feed'}>
              Akış
            </NavItem>
            <NavItem href="/leaderboard" active={pathname === '/leaderboard'}>
              Liderlik
            </NavItem>
          </div>
        )}

        {/* --- SAĞ: PROFİL --- */}
        <div className="justify-self-end flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                  HESAP
                </div>
                <div className="text-sm font-bold text-white">
                  {user.email?.split('@')[0]}
                </div>
              </div>
              <div className="h-8 w-[1px] bg-gray-800"></div>
              <SignOutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-bold text-white hover:text-red-500 transition-colors"
            >
              Giriş Yap
            </Link>
          )}
        </div>

      </div>
    </nav>
  )
}

function NavItem({
  href,
  children,
  active,
}: {
  href: string
  children: React.ReactNode
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        relative text-sm font-bold tracking-wide px-4 py-2 rounded-full transition-all duration-300
        hover:-translate-y-1
        ${
          active
            ? 'text-white bg-red-600 shadow-[0_10px_20px_-10px_rgba(220,38,38,0.5)]'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {children}
    </Link>
  )
}
