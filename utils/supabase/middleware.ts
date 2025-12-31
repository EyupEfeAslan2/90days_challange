import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Kullanıcıyı kontrol et
  const { data: { user } } = await supabase.auth.getUser()

  // 🛡️ KORUMA MANTIĞI (WHITELIST / BLACKLIST)
  
  // Eğer kullanıcı YOKSA
  if (!user) {
    const path = request.nextUrl.pathname

    // VE korumalı bir rotaya girmeye çalışıyorsa
    // (Dashboard, Yeni Hedef Oluşturma, Onboarding vb.)
    if (
        path.startsWith('/dashboard') || 
        path.startsWith('/create-challenge') ||
        path.startsWith('/onboarding')
    ) {
      // Login sayfasına postala
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return response
}