'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// ==================== TYPES ====================
type ToastType = 'message' | 'error' | 'info' | 'warning'

interface ToastConfig {
  title: string
  description: string
  duration: number
}

type ToastMessages = Record<string, ToastConfig>

interface ToastParams {
  message: string | null
  error: string | null
  info: string | null
  warning: string | null
}

// ==================== CONSTANTS ====================
const TOAST_MESSAGES: ToastMessages = {
  // Success Messages
  saved: {
    title: 'Rapor İşlendi',
    description: 'Saha verileri başarıyla güncellendi.',
    duration: 4000,
  },
  joined: {
    title: 'Cepheye Katıldınız',
    description: 'Yeni göreviniz kaydedildi.',
    duration: 4000,
  },
  updated: {
    title: 'Profil Güncellendi',
    description: 'Değişiklikler kaydedildi.',
    duration: 3000,
  },
  created: {
    title: 'Görev Oluşturuldu',
    description: 'Meydan okuma sisteme eklendi.',
    duration: 4000,
  },
  completed: {
    title: 'Görev Tamamlandı',
    description: 'Tebrikler! Başarıyla tamamladınız.',
    duration: 5000,
  },
  left: { // Yeni eklenen çıkış mesajı
    title: 'Hedeften Ayrıldınız',
    description: 'Bu görevden çıkış yapıldı.',
    duration: 4000,
  },
  
  // Error Messages
  failed: {
    title: 'İşlem Başarısız',
    description: 'Sunucu bağlantısında sorun var.',
    duration: 5000,
  },
  unauthorized: {
    title: 'Yetki Hatası',
    description: 'Bu işlem için giriş yapmalısınız.',
    duration: 4000,
  },
  validation: {
    title: 'Geçersiz Veri',
    description: 'Lütfen alanları kontrol edin.',
    duration: 4000,
  },
} as const

const CLEANUP_DELAY_MS = 100
const MAX_PROCESSED_KEYS = 10
const DEFAULT_TOAST_DURATION = 4000

// ==================== UTILITY FUNCTIONS ====================
function getToastConfig(key: string, type: ToastType): ToastConfig {
  return TOAST_MESSAGES[key] ?? {
    title: type === 'error' ? 'Hata' : 'Başarılı',
    description: key, // Eğer key listede yoksa direkt mesaj olarak göster
    duration: DEFAULT_TOAST_DURATION,
  }
}

function buildCleanUrl(pathname: string, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams)
  const toastParams: ToastType[] = ['message', 'error', 'info', 'warning']
  toastParams.forEach(param => params.delete(param))
  const queryString = params.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

function createNotificationKey(params: ToastParams, pathname: string): string {
  return `${params.message ?? ''}-${params.error ?? ''}-${params.info ?? ''}-${params.warning ?? ''}-${pathname}`
}

function extractToastParams(searchParams: URLSearchParams): ToastParams {
  return {
    message: searchParams.get('message'),
    error: searchParams.get('error'),
    info: searchParams.get('info'),
    warning: searchParams.get('warning'),
  }
}

function hasAnyToast(params: ToastParams): boolean {
  return !!(params.message || params.error || params.info || params.warning)
}

// ==================== TOAST HANDLERS (BUTONSUZ) ====================
function showSuccessToast(key: string): void {
  const config = getToastConfig(key, 'message')
  // Action (Buton) kısmını kaldırdık, sade toast
  toast.success(config.title, {
    description: config.description,
    duration: config.duration,
  })
}

function showErrorToast(key: string): void {
  const config = getToastConfig(key, 'error')
  // Action (Buton) kısmını kaldırdık
  toast.error(config.title, {
    description: config.description,
    duration: config.duration,
  })
}

function showInfoToast(message: string): void {
  toast.info(message, {
    description: 'Bilgilendirme',
    duration: DEFAULT_TOAST_DURATION,
  })
}

function showWarningToast(message: string): void {
  toast.warning(message, {
    description: 'Dikkat',
    duration: DEFAULT_TOAST_DURATION,
  })
}

// ==================== MAIN COMPONENT ====================
export default function ToastWatcher() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const processedRef = useRef(new Set<string>())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const params = extractToastParams(searchParams)
    
    if (!hasAnyToast(params)) return

    const notificationKey = createNotificationKey(params, pathname)

    if (processedRef.current.has(notificationKey)) return

    if (params.message) {
      showSuccessToast(params.message)
    } else if (params.error) {
      showErrorToast(params.error)
    } else if (params.info) {
      showInfoToast(params.info)
    } else if (params.warning) {
      showWarningToast(params.warning)
    }

    processedRef.current.add(notificationKey)
    
    setTimeout(() => {
      const cleanedUrl = buildCleanUrl(pathname, searchParams)
      router.replace(cleanedUrl, { scroll: false })
      
      if (processedRef.current.size > MAX_PROCESSED_KEYS) {
        const keysArray = Array.from(processedRef.current)
        processedRef.current = new Set(keysArray.slice(-MAX_PROCESSED_KEYS))
      }
    }, CLEANUP_DELAY_MS)
  }, [searchParams, router, pathname, mounted])

  return null
}