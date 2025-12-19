import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { createClient } from '@/utils/supabase/server';
import { Toaster } from 'sonner';
import ToastWatcher from "@/components/ToastWatcher";
import { Suspense } from "react";

// --- FONTS ---
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

// --- METADATA (SEO) ---
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
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

// --- LAYOUT ---
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  
  // Navbar için kullanıcı bilgisini alıyoruz.
  // Not: Detaylı profil kontrolü ve yönlendirme (redirect) işlemlerini
  // performansı düşürmemek adına Middleware veya ilgili sayfalarda (Dashboard) yapıyoruz.
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="tr" className="dark">
      <body 
        className={`
          ${geistSans.variable} ${geistMono.variable} 
          antialiased bg-black text-white selection:bg-red-900 selection:text-white
          min-h-screen flex flex-col
        `}
      >
        <Navbar user={user} />
        
        <main className="flex-1">
          {children}
        </main>
        
        {/* Toast Bildirimleri ve URL İzleyici */}
        <Suspense fallback={null}>
          <ToastWatcher />
        </Suspense>
        
        <Toaster 
          position="bottom-right" 
          theme="dark" 
          toastOptions={{
            style: {
              background: '#0a0a0a',
              border: '1px solid #333',
              color: '#fff',
            }
          }}
        />
      </body>
    </html>
  );
}