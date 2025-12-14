'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function ToastWatcher() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // URL'de 'message' veya 'error' parametresi var mı bak
    const message = searchParams.get('message')
    const error = searchParams.get('error')

    if (message) {
      // Yeşil (Başarılı) Bildirim
      toast.success(message === 'saved' ? 'Rapor Başarıyla İşlendi' : message, {
        description: 'Saha verileri güncellendi komutanım.',
        duration: 3000,
      })
      
      // URL'yi temizle (Parametreyi sil)
      router.replace(pathname)
    }

    if (error) {
      // Kırmızı (Hata) Bildirim
      toast.error('İşlem Başarısız', {
        description: error === 'failed' ? 'Sunucu bağlantısında sorun var.' : error,
      })
      router.replace(pathname)
    }
  }, [searchParams, router, pathname])

  return null // Bu bileşen görünmez, sadece mantık çalıştırır
}