// components/DeleteButton.tsx
'use client'

import { useState } from 'react'

// Types
type DeleteButtonProps = {
  onDelete: () => Promise<void>
  title?: string
  className?: string
}

// Sub-components
function DeleteIcon() {
  return (
    <svg 
      className="w-5 h-5" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
      />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg 
      className="w-6 h-6" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
      />
    </svg>
  )
}

function ConfirmationModal({
  isDeleting,
  onConfirm,
  onCancel
}: {
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
        onClick={onCancel}
      />

      {/* Modal Box */}
      <div className="relative bg-[#0a0a0a] border border-red-900/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
        
        <div className="flex flex-col items-center text-center space-y-4">
          
          {/* Warning Icon */}
          <div className="w-12 h-12 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-2">
            <WarningIcon />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white">
            Emin misiniz?
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm">
            Bu işlem geri alınamaz. Silinen veriler kalıcı olarak silinecektir.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full pt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-800 rounded-xl font-bold text-white transition-colors hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDeleting}
            >
              İptal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 rounded-xl font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Siliniyor...</span>
                </>
              ) : (
                'Sil'
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

// Main Component
export default function DeleteButton({ 
  onDelete, 
  title = "Sil", 
  className = "" 
}: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
    } catch (error) {
      console.error('Delete error:', error)
      setIsDeleting(false)
    }
  }

  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleTriggerClick}
        className={`group transition-colors rounded-lg hover:bg-red-900/10 ${className}`}
        title={title}
        aria-label={title}
      >
        <DeleteIcon />
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <ConfirmationModal
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setIsOpen(false)}
        />
      )}
    </>
  )
}