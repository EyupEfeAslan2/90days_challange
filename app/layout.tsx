import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { createClient } from '@/utils/supabase/server';
import { Toaster } from 'sonner'
import ToastWatcher from "@/components/ToastWatcher";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "90 Days Challenge",
  description: "İrade Yönetimi",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // --- ONBOARDING KONTROLÜ ---
  if (user) {
    // 1. Profili Çek
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    // 2. Mevcut URL'i Öğren
    const headersList = await headers();
    const fullUrl = headersList.get('referer') || "";
    // Basit bir kontrol: URL'in içinde 'onboarding' geçiyor mu?
    const isOnboardingPage = fullUrl.includes('onboarding');

    // 3. Adı yoksa ve zaten o sayfada değilse -> GÖNDER
    if (!profile?.username && !isOnboardingPage) {
        // Burada Next.js'in redirect'ini kullanırken dikkatli olalım.
        // Server component içinde bazen middleware daha iyidir ama bu çözüm çalışır.
        // Eğer sonsuz döngü olursa burayı middleware.ts'e taşıyacağız.
    }
  }

  /* NOT: Layout içinde redirect yapmak bazen risklidir.
     Eğer üstteki kod yine sorun çıkarırsa, en temiz yöntem şudur:
     Kullanıcıyı Navbar'da veya Dashboard sayfasının içinde kontrol etmek.
     Şimdilik Layout yönlendirmesini KAPALI tutuyorum ki site açılsın.
     Sen manuel olarak http://localhost:3000/onboarding adresine girip ismini belirle.
  */

  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <Navbar user={user} />
        <main>{children}</main>
        <Suspense fallback={null}><ToastWatcher /></Suspense>
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}