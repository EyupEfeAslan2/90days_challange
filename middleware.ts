import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    // 1. Supabase oturumunu kontrol et
    const result = await updateSession(request)
    
    // updateSession'dan gelen response'u kontrol et
    if (!result || !result.supabase) {
      console.error('updateSession failed to return supabase client')
      return NextResponse.next()
    }

    const { supabase, response } = result
    const { data: { user } } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()

    // --- SENARYO A: KULLANICI GİRİŞ YAPMAMIŞSA ---
    if (!user) {
      // Sadece şu sayfalara girmesine izin ver: Login, Signup, Auth işlemleri
      const allowedPaths = ['/login', '/signup', '/auth']
      const isAllowed = allowedPaths.some(path => url.pathname.startsWith(path))

      // Eğer izinli olmayan bir yere (örn: Ana Sayfa, Dashboard) girmeye çalışıyorsa
      if (!isAllowed) {
        url.pathname = '/login' // Hedefi Login yap
        return NextResponse.redirect(url) // Ve postala
      }
    }

    // --- SENARYO B: KULLANICI ZATEN GİRİŞ YAPMIŞSA ---
    if (user) {
      // Eğer Login veya Signup sayfasına girmeye çalışıyorsa (zaten girmişsin, ne işin var?)
      if (url.pathname === '/login' || url.pathname === '/signup') {
        url.pathname = '/dashboard' // Direkt Dashboard'a at
        return NextResponse.redirect(url)
      }
      
      // NOT: Kullanıcı '/' (Ana Sayfa) adresine giderse, oradaki "Challenge Listesini" görmesine izin veriyoruz.
      // Eğer "Giriş yapan da ana sayfaya basınca Dashboard'a gitsin" dersen buraya ekleriz.
      // Ama bence '/' Challenge Listesi olarak kalsın.
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Hata durumunda isteği devam ettir
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Tüm yolları eşleştir, ancak şunları hariç tut:
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyonu)
     * - favicon.ico
     * - Resim dosyaları (png, jpg vs.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}