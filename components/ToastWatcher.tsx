'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// Toast Message Configurations
const TOAST_MESSAGES = {
  // Success messages
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
  
  // Error messages
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
} as const

type ToastMessageKey = keyof typeof TOAST_MESSAGES

// Utility Functions
const getToastConfig = (key: string, type: 'message' | 'error') => {
  const config = TOAST_MESSAGES[key as ToastMessageKey]
  
  if (config) {
    return config
  }

  // Fallback for custom messages
  return {
    title: type === 'error' ? '❌ Hata' : '✅ Başarılı',
    description: key,
    duration: 4000,
  }
}

const cleanUrl = (pathname: string, searchParams: URLSearchParams) => {
  const params = new URLSearchParams(searchParams)
  params.delete('message')
  params.delete('error')
  params.delete('info')
  params.delete('warning')
  
  const queryString = params.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
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
    // Only run on client after mount
    if (!mounted) return

    // Get notification parameters
    const message = searchParams.get('message')
    const error = searchParams.get('error')
    const info = searchParams.get('info')
    const warning = searchParams.get('warning')

    // Create unique key for this notification
    const notificationKey = `${message}-${error}-${info}-${warning}-${pathname}`

    // Prevent duplicate notifications
    if (processedRef.current.has(notificationKey)) {
      return
    }

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

    // Clean URL and mark as processed
    if (hasShownToast) {
      processedRef.current.add(notificationKey)
      
      // Clean URL after a short delay
      setTimeout(() => {
        const cleanedUrl = cleanUrl(pathname, searchParams)
        router.replace(cleanedUrl, { scroll: false })
        
        // Clean up old processed keys (keep last 10)
        if (processedRef.current.size > 10) {
          const keysArray = Array.from(processedRef.current)
          processedRef.current = new Set(keysArray.slice(-10))
        }
      }, 100)
    }
  }, [searchParams, router, pathname, mounted])

  return null
}

// Export utility for manually triggering toasts
export const showToast = {
  success: (key: ToastMessageKey | string) => {
    const config = getToastConfig(key, 'message')
    toast.success(config.title, {
      description: config.description,
      duration: config.duration,
      icon: '✅',
    })
  },
  
  error: (key: ToastMessageKey | string) => {
    const config = getToastConfig(key, 'error')
    toast.error(config.title, {
      description: config.description,
      duration: config.duration,
      icon: '❌',
    })
  },
  
  info: (message: string, description?: string) => {
    toast.info(message, {
      description: description || 'Bilgilendirme',
      duration: 4000,
      icon: 'ℹ️',
    })
  },
  
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description: description || 'Dikkat',
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

// TypeScript helper for redirect with toast
export const redirectWithToast = (
  url: string,
  type: 'message' | 'error' | 'info' | 'warning',
  value: string
): string => {
  const params = new URLSearchParams()
  params.set(type, value)
  return `${url}?${params.toString()}`
}