import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { createClient } from '@/utils/supabase/server';
import { Toaster } from 'sonner';
import ToastWatcher from "@/components/ToastWatcher";
import { Suspense } from "react";
import SuggestionBox from '@/components/SuggestionBox';
import Script from 'next/script'; // ✅ IMPORT EKLENDİ

// ==================== FONTS ====================
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

// ==================== METADATA ====================
export const metadata: Metadata = {
  title: {
    template: '%s | 90DAYS',
    default: '90DAYS - İrade ve Disiplin Yönetimi',
  },
  description: "Konfor alanını terk et. İradeni test edecek bir hedef seç ve 90 gün boyunca sürece sadık kal.",
  keywords: ["disiplin", "irade", "challenge", "90 gün", "kişisel gelişim", "stoicism"],
  authors: [{ name: "90Days Team" }],
  openGraph: {
    title: '90DAYS - İrade ve Disiplin',
    description: 'Sınırlarını zorla. Yeni bir sen inşa et.',
    type: 'website',
    locale: 'tr_TR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ==================== LAYOUT ====================
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <body 
        suppressHydrationWarning={true}
        className={`
          ${geistSans.variable} ${geistMono.variable} 
          antialiased bg-black text-white 
          selection:bg-red-900 selection:text-white
          min-h-screen flex flex-col
        `}
      >
        {/* ✅ GOOGLE ANALYTICS BAŞLANGIÇ */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-5B7NE8DGEM"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5B7NE8DGEM');
          `}
        </Script>
        {/* ✅ GOOGLE ANALYTICS BİTİŞ */}

        <Navbar user={user} />
        
        <main className="flex-1">
          {children}
        </main>
        
        {/* ÖNERİ KUTUSU */}
        <SuggestionBox user={user} />

        {/* Toast System */}
        <Suspense fallback={null}>
          <ToastWatcher />
        </Suspense>
        
        <Toaster 
          position="bottom-right" 
          theme="dark"
          richColors={true}
          closeButton={true}
          duration={4000}
          toastOptions={{
            style: {
              background: '#0a0a0a',
              border: '1px solid #333',
              color: '#fff',
            },
            classNames: {
              toast: 'group',
              title: 'font-bold',
              description: 'text-sm text-gray-400',
              closeButton: 'bg-gray-800 hover:bg-gray-700 border-gray-700',
            },
          }}
        />
      </body>
    </html>
  );
}