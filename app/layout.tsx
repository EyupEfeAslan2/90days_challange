import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { createClient } from '@/utils/supabase/server';
import { Toaster } from 'sonner'
import ToastWatcher from "@/components/ToastWatcher";
import { Suspense } from "react";

// Font Configuration
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

// Metadata Configuration
export const metadata: Metadata = {
  title: {
    default: "90 Days Challenge - İrade ve Disiplin Yönetimi",
    template: "%s | 90 Days Challenge"
  },
  description: "Sınırlarını zorla, iradeni test et. 90 günlük disiplin ve hedef odaklı dönüşüm platformu.",
  keywords: ["90 days", "challenge", "disiplin", "irade", "hedef", "motivasyon", "kişisel gelişim"],
  authors: [{ name: "90 Days Team" }],
  creator: "90 Days Challenge",
  publisher: "90 Days Challenge",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    title: "90 Days Challenge - İrade ve Disiplin Yönetimi",
    description: "Sınırlarını zorla, iradeni test et. 90 günlük disiplin ve hedef odaklı dönüşüm platformu.",
    siteName: "90 Days Challenge",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "90 Days Challenge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "90 Days Challenge - İrade ve Disiplin Yönetimi",
    description: "Sınırlarını zorla, iradeni test et.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

// Navbar Skeleton Component
const NavbarSkeleton = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="h-8 w-32 bg-gray-800 rounded animate-pulse" />
      <div className="flex gap-4">
        <div className="h-8 w-20 bg-gray-800 rounded animate-pulse" />
        <div className="h-8 w-20 bg-gray-800 rounded animate-pulse" />
      </div>
    </div>
  </nav>
);

// Root Layout Component
export default async function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Fetch user data
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user in layout:', error)
  }

  return (
    <html 
      lang="tr" 
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-red-600 selection:text-white overflow-x-hidden`}
        suppressHydrationWarning
      >
        {/* Skip to main content - Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-lg"
        >
          Ana içeriğe geç
        </a>

        {/* Navigation Bar */}
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar user={user} />
        </Suspense>
        
        {/* Main Content */}
        <main id="main-content" className="relative">
          {children}
        </main>

        {/* Toast Notification System */}
        <Suspense fallback={null}>
          <ToastWatcher /> 
        </Suspense>

        <Toaster 
          position="bottom-right" 
          theme="dark"
          duration={4000}
          closeButton
          richColors
          toastOptions={{
            style: {
              background: '#0a0a0a',
              border: '1px solid #333',
              color: 'white',
            },
            className: 'font-sans',
            descriptionClassName: 'text-gray-400',
            actionButtonStyle: {
              background: '#dc2626',
              color: 'white',
            },
          }}
        />

        {/* Background Effects (Global) */}
        <div className="fixed inset-0 pointer-events-none -z-10" suppressHydrationWarning>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-950" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl" />
        </div>
      </body>
    </html>
  );
}