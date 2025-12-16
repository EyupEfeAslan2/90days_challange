'use client'

import { createChallenge } from './actions'
import { useFormStatus } from 'react-dom'
import { useState, useEffect } from 'react'

/**
 * Optimized Submit Button Component with Loading State
 * Separated for proper useFormStatus hook usage
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
          ? 'bg-gradient-to-r from-gray-700 to-gray-600 cursor-not-allowed text-gray-400' 
          : 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:via-red-600 hover:to-red-700 text-white shadow-lg shadow-red-900/30 hover:shadow-xl hover:shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
      aria-label={pending ? 'Yarışma oluşturuluyor' : 'Yarışmayı başlat'}
    >
      {/* Animated background effect */}
      {!pending && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      )}
      
      <span className="relative flex items-center justify-center gap-2">
        {pending ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            OLUŞTURULUYOR...
          </>
        ) : (
          <>
            YARIŞMAYI BAŞLAT
            <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">🚀</span>
          </>
        )}
      </span>
    </button>
  )
}

/**
 * Input Field Component with Enhanced Styling
 */
function InputField({ label, name, type = "text", required = false, placeholder, rows }) {
  const [isFocused, setIsFocused] = useState(false)
  const InputComponent = rows ? 'textarea' : 'input'
  
  return (
    <div className="space-y-2 group">
      <label 
        htmlFor={name}
        className={`
          block text-xs font-bold uppercase tracking-widest transition-colors duration-200
          ${isFocused ? 'text-red-500' : 'text-gray-500'}
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
          w-full bg-black/50 backdrop-blur-sm border rounded-xl p-4 text-white 
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 focus:bg-black/70
          hover:border-gray-600
          ${isFocused ? 'border-red-600 shadow-lg shadow-red-900/20' : 'border-gray-700'}
          ${rows ? 'resize-none min-h-[120px]' : ''}
          placeholder:text-gray-600
        `}
      />
    </div>
  )
}

/**
 * Date Input Component with Enhanced UX
 */
function DateField({ label, name, required = false }) {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={name}
        className={`
          block text-xs font-bold uppercase tracking-widest transition-colors duration-200
          ${isFocused ? 'text-red-500' : 'text-gray-500'}
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="date"
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full bg-black/50 backdrop-blur-sm border rounded-xl p-4 text-white 
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 focus:bg-black/70
            hover:border-gray-600
            ${isFocused ? 'border-red-600 shadow-lg shadow-red-900/20' : 'border-gray-700'}
            [color-scheme:dark]
          `}
        />
      </div>
    </div>
  )
}

/**
 * Main Challenge Creation Page Component
 * Enterprise-grade with accessibility and UX enhancements
 */
export default function CreateChallengePage() {
  const [mounted, setMounted] = useState(false)

  // Animation on mount
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content card */}
      <div 
        className={`
          relative w-full max-w-2xl 
          bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 
          rounded-3xl p-8 md:p-10
          shadow-2xl shadow-black/50
          transition-all duration-700 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        {/* Header Section */}
        <header className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl mb-4 shadow-lg shadow-red-900/50">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            YENİ <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">CEPHE</span> AÇ
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
            Kendine ve diğerlerine meydan oku. Hedeflerini belirle, sınırlarını zorla.
          </p>
        </header>

        {/* Challenge Form */}
        <form action={createChallenge} className="space-y-7">
          {/* Title Input */}
          <InputField
            label="Yarışma Adı"
            name="title"
            type="text"
            required
            placeholder="Örn: 90 Günlük Yazılım Kampı"
          />

          {/* Description Textarea */}
          <InputField
            label="Açıklama"
            name="description"
            rows={4}
            placeholder="Yarışmanın kurallarını, hedeflerini ve detaylarını buraya yazın..."
          />

          {/* Date Range Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DateField
              label="Başlangıç Tarihi"
              name="start_date"
              required
            />
            <DateField
              label="Bitiş Tarihi"
              name="end_date"
              required
            />
          </div>

          {/* Visibility Toggle */}
          <div className="relative">
            <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group cursor-pointer">
              <input 
                type="checkbox" 
                name="visibility" 
                id="visibility" 
                defaultChecked
                className="mt-1 w-5 h-5 accent-red-600 rounded-md cursor-pointer transition-transform duration-200 hover:scale-110"
              />
              <label htmlFor="visibility" className="flex-1 cursor-pointer select-none">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white group-hover:text-red-500 transition-colors duration-200">
                    Herkese Açık Yayınla
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">
                  Yarışmanız herkese açık olacak ve diğer kullanıcılar katılabilecek
                </p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <a 
              href="/" 
              className="flex-1 py-4 px-6 text-center rounded-xl border-2 border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 text-gray-300 hover:text-white font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
            >
              İptal
            </a>
            <SubmitButton />
          </div>
        </form>

        {/* Info Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800/50">
          <p className="text-xs text-gray-600 text-center">
            Yarışma oluşturduktan sonra düzenleyebilir ve yönetebilirsiniz
          </p>
        </div>
      </div>
    </div>
  )
}