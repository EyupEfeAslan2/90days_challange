import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // updateSession fonksiyonunu çağırıyoruz
  const response = await updateSession(request)

  // FIX: "!response.supabase" kontrolünü kaldırdık.
  // Çünkü dönen şey bir NextResponse objesidir ve içinde supabase client olmaz.
  // Sadece response'un varlığını kontrol etmek yeterli.
  if (!response) {
     return NextResponse.next()
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}