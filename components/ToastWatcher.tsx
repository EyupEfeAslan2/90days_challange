// components/ToastWatcher.tsx
'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// Types
type ToastType = 'message' | 'error' | 'info' | 'warning'

type ToastConfig = {
  title: string
  description: string
  duration: number
}

type ToastMessages = {
  [key: string]: ToastConfig
}

// Constants
const TOAST_MESSAGES: ToastMessages = {
  // Success
  saved: {
    title: '✅ Rapor Başarıyla İşlendi',
    description: 'Saha verileri güncellendi komutanım.',
    duration: 4000,
  },
  joined: {
    title: '🎯 Cepheye Katıldınız',
    description: 'Yeni göreviniz başarıyla kaydedildi.',
    duration: 4000,
  },
  updated: {
    title: '💾 Profil Güncellendi',
    description: 'Değişiklikler başarıyla kaydedildi.',
    duration: 3000,
  },
  created: {
    title: '🚀 Görev Oluşturuldu',
    description: 'Yeni meydan okuma sisteme eklendi.',
    duration: 4000,
  },
  completed: {
    title: '🏆 Görev Tamamlandı',
    description: 'Tebrikler! Başarıyla tamamladınız.',
    duration: 5000,
  },
  
  // Errors
  failed: {
    title: '❌ İşlem Başarısız',
    description: 'Sunucu bağlantısında sorun var. Lütfen tekrar deneyin.',
    duration: 5000,
  },
  unauthorized: {
    title: '🔒 Yetki Hatası',
    description: 'Bu işlem için giriş yapmanız gerekiyor.',
    duration: 4000,
  },
  validation: {
    title: '⚠️ Geçersiz Veri',
    description: 'Lütfen tüm alanları doğru şekilde doldurun.',
    duration: 4000,
  },
  timeout: {
    title: '⏱️ Zaman Aşımı',
    description: 'İstek zaman aşımına uğradı. Tekrar deneyin.',
    duration: 4000,
  },
  duplicate: {
    title: '🔄 Tekrar Eden İşlem',
    description: 'Bu işlem zaten gerçekleştirilmiş.',
    duration: 3000,
  },
}

const CLEANUP_DELAY = 100
const MAX_PROCESSED_KEYS = 10

// Utility Functions
function getToastConfig(key: string, type: ToastType): ToastConfig {
  const config = TOAST_MESSAGES[key]
  
  if (config) return config

  // Fallback
  return {
    title: type === 'error' ? '❌ Hata' : '✅ Başarılı',
    description: key,
    duration: 4000,
  }
}

function cleanUrl(pathname: string, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams)
  params.delete('message')
  params.delete('error')
  params.delete('info')
  params.delete('warning')
  
  const queryString = params.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

function createNotificationKey(
  message: string | null,
  error: string | null,
  info: string | null,
  warning: string | null,
  pathname: string
): string {
  return `${message}-${error}-${info}-${warning}-${pathname}`
}

// Main Component
export default function ToastWatcher() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const processedRef = useRef(new Set<string>())
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const message = searchParams.get('message')
    const error = searchParams.get('error')
    const info = searchParams.get('info')
    const warning = searchParams.get('warning')

    const notificationKey = createNotificationKey(message, error, info, warning, pathname)

    // Prevent duplicates
    if (processedRef.current.has(notificationKey)) return

    let hasShownToast = false

    // Success Toast
    if (message) {
      const config = getToastConfig(message, 'message')
      toast.success(config.title, {
        description: config.description,
        duration: config.duration,
        icon: '✅',
        action: {
          label: 'Tamam',
          onClick: () => {},
        },
      })
      hasShownToast = true
    }

    // Error Toast
    if (error) {
      const config = getToastConfig(error, 'error')
      toast.error(config.title, {
        description: config.description,
        duration: config.duration,
        icon: '❌',
        action: {
          label: 'Kapat',
          onClick: () => {},
        },
      })
      hasShownToast = true
    }

    // Info Toast
    if (info) {
      toast.info(info, {
        description: 'Bilgilendirme',
        duration: 4000,
        icon: 'ℹ️',
      })
      hasShownToast = true
    }

    // Warning Toast
    if (warning) {
      toast.warning(warning, {
        description: 'Dikkat edilmesi gereken bir durum var.',
        duration: 4000,
        icon: '⚠️',
      })
      hasShownToast = true
    }

    // Clean URL
    if (hasShownToast) {
      processedRef.current.add(notificationKey)
      
      setTimeout(() => {
        const cleanedUrl = cleanUrl(pathname, searchParams)
        router.replace(cleanedUrl, { scroll: false })
        
        // Cleanup old keys
        if (processedRef.current.size > MAX_PROCESSED_KEYS) {
          const keysArray = Array.from(processedRef.current)
          processedRef.current = new Set(keysArray.slice(-MAX_PROCESSED_KEYS))
        }
      }, CLEANUP_DELAY)
    }
  }, [searchParams, router, pathname, mounted])

  return null
}

// Export utility for manual toasts
export const showToast = {
  success: (key: string) => {
    const config = getToastConfig(key, 'message')
    toast.success(config.title, {
      description: config.description,
      duration: config.duration,
      icon: '✅',
    })
  },
  
  error: (key: string) => {
    const config = getToastConfig(key, 'error')
    toast.error(config.title, {
      description: config.description,
      duration: config.duration,
      icon: '❌',
    })
  },
  
  info: (message: string, description: string = 'Bilgilendirme') => {
    toast.info(message, {
      description,
      duration: 4000,
      icon: 'ℹ️',
    })
  },
  
  warning: (message: string, description: string = 'Dikkat') => {
    toast.warning(message, {
      description,
      duration: 4000,
      icon: '⚠️',
    })
  },
  
  custom: (title: string, description: string, icon: string = '📢') => {
    toast(title, {
      description,
      duration: 4000,
      icon,
    })
  },
}

// Helper for redirect with toast
export function redirectWithToast(
  url: string,
  type: ToastType,
  value: string
): string {
  const params = new URLSearchParams()
  params.set(type, value)
  return `${url}?${params.toString()}`
}