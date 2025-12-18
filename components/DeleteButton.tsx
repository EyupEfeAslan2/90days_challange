'use client'

import { useState } from 'react'

interface DeleteButtonProps {
  onDelete: () => Promise<void> // Silme fonksiyonu buraya gelecek
  title?: string // "Konuyu sil" veya "Cepheyi sil" yazısı için
  className?: string
}

export default function DeleteButton({ onDelete, title = "Sil", className = "" }: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete()
    // İşlem bitince (Redirect olacağı için burası genelde çalışmaz ama olsun)
    setIsDeleting(false) 
    setIsOpen(false)
  }

  return (
    <>
      {/* TETİKLEYİCİ BUTON (ÇÖP KUTUSU) */}
      <button
        onClick={(e) => {
          e.preventDefault() // Link'e tıklamayı engelle
          e.stopPropagation() // Kartın tıklanmasını engelle
          setIsOpen(true)
        }}
        className={`group p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-900/10 ${className}`}
        title={title}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* ONAY MODALI (POP-UP) */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          
          {/* Arkaplan Karartma */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Modal Kutusu */}
          <div className="relative bg-[#0a0a0a] border border-red-900/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-white">Emin misin Asker?</h3>
              <p className="text-gray-400 text-sm">
                Bu işlem geri alınamaz. Silinen veriler sonsuzluğa karışır.
              </p>

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition"
                  disabled={isDeleting}
                >
                  İPTAL
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'SİLİNİYOR...' : 'SİL GİTSİN'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}