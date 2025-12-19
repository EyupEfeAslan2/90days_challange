'use client'

import { createChallenge } from './actions'
import { useFormStatus } from 'react-dom' // Next.js 16 / React 19
import { useActionState, useState, useEffect } from 'react'

// --- TYPES ---
const initialState = {
  message: '',
  errors: {} as Record<string, string[]>,
}

// --- SUB-COMPONENTS ---

/**
 * Submit Button: Formun loading durumunu dinler.
 */
function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`
        group relative flex-[2] py-4 px-6 rounded-xl font-bold 
        transition-all duration-300 ease-out overflow-hidden
        ${pending 
          ? 'bg-gray-800 cursor-not-allowed text-gray-400 border border-gray-700' 
          : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
    >
      <span className="relative flex items-center justify-center gap-2">
        {pending ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            HEDEF OLUŞTURULUYOR...
          </>
        ) : (
          <>
            HEDEFİ BAŞLAT
            <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">🚀</span>
          </>
        )}
      </span>
    </button>
  )
}

/**
 * Reusable Input Component
 */
function InputField({ label, name, type = "text", required = false, placeholder, rows }: { label: string, name: string, type?: string, required?: boolean, placeholder?: string, rows?: number }) {
  const [isFocused, setIsFocused] = useState(false)
  const InputComponent = rows ? 'textarea' : 'input'
  
  return (
    <div className="space-y-2 group">
      <label 
        htmlFor={name}
        className={`
          block text-xs font-bold uppercase tracking-widest transition-colors duration-200
          ${isFocused ? 'text-white' : 'text-gray-500'}
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <InputComponent
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full bg-black border rounded-xl p-4 text-white 
          transition-all duration-300 ease-out outline-none
          placeholder:text-gray-700
          ${isFocused 
            ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
            : 'border-gray-800 hover:border-gray-600'
          }
          ${rows ? 'resize-none min-h-[120px]' : ''}
        `}
      />
    </div>
  )
}

// --- MAIN PAGE ---
export default function CreateChallengePage() {
  const [mounted, setMounted] = useState(false)
  // useActionState: Form sonucunu ve hatalarını yönetir
  const [state, formAction] = useActionState(createChallenge, initialState)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Ambiyans Işıkları */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[128px]" />
      </div>

      <div 
        className={`
          relative w-full max-w-2xl 
          bg-[#0a0a0a] border border-gray-800 
          rounded-3xl p-8 md:p-10
          shadow-2xl
          transition-all duration-700 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* Header */}
        <header className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-xl mb-2 border border-white/10">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            YENİ HEDEF BELİRLE
          </h1>
          
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Sınırlarını zorla. 90 günlük irade yolculuğunu başlat.
          </p>
        </header>

        {/* Form */}
        <form action={formAction} className="space-y-7">
          
          <InputField
            label="Hedef Başlığı"
            name="title"
            required
            placeholder="Örn: 90 Günlük Yazılım Kampı"
          />

          <InputField
            label="Detaylar & Kurallar"
            name="description"
            rows={4}
            placeholder="Bu süreçte neleri yapacak, neleri yapmayacaksın?"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Başlangıç Tarihi"
              name="start_date"
              type="date"
              required
            />
            <InputField
              label="Bitiş Tarihi"
              name="end_date"
              type="date"
              required
            />
          </div>

          {/* Visibility Switch */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 bg-white/5">
            <input 
              type="checkbox" 
              name="visibility" 
              id="visibility" 
              defaultChecked
              className="w-5 h-5 accent-white cursor-pointer"
            />
            <label htmlFor="visibility" className="flex-1 cursor-pointer select-none">
              <div className="font-bold text-white text-sm">Herkese Açık Yayınla</div>
              <p className="text-xs text-gray-500 mt-0.5">
                Diğer üyeler bu sürece dahil olabilir ve liderlik tablosunda yarışabilir.
              </p>
            </label>
          </div>

          {/* Hata Mesajı Gösterimi */}
          {state?.message && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-500 text-sm font-bold text-center animate-in fade-in">
              {state.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-800">
            <a 
              href="/" 
              className="flex-1 py-4 px-6 text-center rounded-xl border border-gray-800 hover:bg-gray-900 text-gray-400 hover:text-white font-bold transition-all"
            >
              Vazgeç
            </a>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}