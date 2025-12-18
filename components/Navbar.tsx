'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from './SignOutButton'
import { User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client' // Client import eklendi

export default function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // --- YENİ EKLENEN KISIM: Username State ve Fetch ---
  const [username, setUsername] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUsername() {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        
        if (data?.username) {
          setUsername(data.username)
        }
      }
    }
    fetchUsername()
  }, [user])
  // ---------------------------------------------------

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const shouldHideNavbar = pathname === '/login' || pathname === '/signup' || pathname === '/onboarding'

  if (shouldHideNavbar) {
    return null
  }

  // Gösterilecek isim: Varsa username, yoksa email
  const displayName = username ? `@${username}` : user?.email?.split('@')[0]

  return (
    <>
      <div className="h-16" />

      <nav 
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-black/95 backdrop-blur-xl border-b border-gray-800/50 shadow-xl' 
            : 'bg-black/80 backdrop-blur-md border-b border-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16">
          <div className="flex items-center justify-between h-full">

            {/* LEFT: LOGO */}
            <Link 
              href={user ? "/dashboard" : "/"} 
              className="flex-shrink-0 group"
            >
              <div className="text-2xl md:text-3xl font-black tracking-tighter text-white">
                90<span className="text-red-600 group-hover:text-red-500 transition-colors">DAYS</span>
              </div>
            </Link>

            {/* CENTER: DESKTOP MENU */}
            {user && (
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-2">
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

            {/* RIGHT: USER SECTION */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Desktop User Info */}
                  <div className="hidden lg:flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        HESAP
                      </div>
                      <div className="text-sm font-bold text-white truncate max-w-[120px]">
                        {displayName}
                      </div>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-800" />
                  </div>

                  {/* Sign Out Button (Orjinal hali) */}
                  <SignOutButton />

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Toggle menu"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-bold text-white hover:text-red-500 transition-colors px-4 py-2"
                >
                  Giriş Yap
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* MOBILE MENU */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-gray-800 animate-in slide-in-from-top duration-300">
            <div className="px-4 py-4 space-y-2">
              <MobileNavItem 
                href="/dashboard" 
                active={pathname === '/dashboard'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </MobileNavItem>
              
              <MobileNavItem 
                href="/" 
                active={pathname === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Meydan Oku
              </MobileNavItem>
              
              <MobileNavItem 
                href="/feed" 
                active={pathname === '/feed'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Akış
              </MobileNavItem>
              
              <MobileNavItem 
                href="/leaderboard" 
                active={pathname === '/leaderboard'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Liderlik
              </MobileNavItem>

              {/* Mobile User Info */}
              <div className="pt-4 mt-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold">
                    {displayName.charAt(0).toUpperCase().replace('@', '')}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">HESAP</div>
                    <div className="text-sm font-bold text-white truncate">
                      {displayName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

// Sub-components (Aynen korundu)
function NavItem({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`
        relative text-sm font-bold tracking-wide px-4 py-2 rounded-full transition-all duration-300
        ${active ? 'text-white bg-red-600 shadow-[0_10px_20px_-10px_rgba(220,38,38,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}
      `}
    >
      {children}
    </Link>
  )
}

function MobileNavItem({ href, children, active, onClick }: { href: string; children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-bold text-sm
        ${active ? 'text-white bg-red-600 shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-900'}
      `}
    >
      {children}
    </Link>
  )
}