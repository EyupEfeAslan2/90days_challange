// components/LogHistory.tsx

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface LogHistoryProps {
  challengeId: string
}

type Log = {
  id: number
  date: string       
  created_at: string
  status: 'success' | 'fail' | 'skip'
  note?: string | null
  sins_of_omission?: string | null
  sins_of_commission?: string | null
}

export default function LogHistory({ challengeId }: LogHistoryProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterDate, setFilterDate] = useState<string>('') 
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true) 
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('daily_logs')
          .select(`
            id,
            created_at,
            date,               
            status,
            note,
            sins_of_omission,
            sins_of_commission
          `) 
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId) 
          .order('date', { ascending: false })

        if (error) {
            console.error("History Hatası (Veri Çekilemedi):", error.message)
        }

        if (data) {
          setLogs(data as unknown as Log[])
        }
      }
      setLoading(false)
    }

    if (challengeId) fetchLogs()
  }, [challengeId]) 

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // --- TARİH FİLTRESİ (String Karşılaştırma - Daha Güvenli) ---
  const filteredLogs = logs.filter(log => {
    if (!filterDate) return true
    
    // Veritabanındaki 'date' (YYYY-MM-DD) ile seçilen filtreyi direkt karşılaştırıyoruz
    // Timezone dönüşümü yapmıyoruz ki gün kaymasın.
    return log.date === filterDate
  })

  // Filtre yoksa son 7 kayıt, varsa hepsi
  const displayLogs = filterDate ? filteredLogs : filteredLogs.slice(0, 7)

  if (loading) return <div className="mt-12 text-gray-500 text-center py-4 animate-pulse">Defter aranıyor...</div>

  return (
    <div className="mt-12 border-t border-gray-800 pt-8">
      {/* BAŞLIK VE FİLTRE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-300 flex items-center gap-2">
          <span>📜</span> Muhasebe Geçmişi
        </h3>

        <div className="flex items-center gap-2">
            <div className="relative group">
                <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="bg-[#0a0a0a] border border-gray-800 text-gray-300 text-sm rounded-lg px-3 py-2 pl-10 focus:border-red-500 outline-none block w-full [color-scheme:dark]"
                />
            </div>
             {filterDate && (
                <button onClick={() => setFilterDate('')} className="p-2 text-gray-400 bg-gray-900 border border-gray-700 rounded-lg hover:text-white">Temizle</button>
            )}
        </div>
      </div>
      
      {/* LİSTE */}
      {displayLogs.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl bg-gray-900/30">
            <p className="text-gray-500 font-medium">
                {filterDate ? "Seçilen tarihte kayıt yok." : "Henüz bir rapor kaydı bulunamadı."}
            </p>
             {/* DEBUG İÇİN: Eğer kayıt varsa ama filtre yüzünden görünmüyorsa */}
            {logs.length > 0 && !filterDate && <p className="text-xs text-red-500 mt-2">Veri var ama gösterilemiyor (Logları kontrol et).</p>}
        </div>
      ) : (
        <div className="space-y-3">
            {displayLogs.map((log) => {
                const isOpen = expandedId === log.id
                
                // Tarihi Türkçe formatına çevir (Sadece gösterim için)
                const dateParts = log.date.split('-'); // 2026-01-03 -> [2026, 01, 03]
                const displayDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]))
                                    .toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

                const omissionText = log.sins_of_omission || log.note || ""
                const commissionText = log.sins_of_commission || ""

                return (
                    <div 
                        key={log.id} 
                        className={`border rounded-xl transition-all duration-300 overflow-hidden ${isOpen ? 'bg-gray-900/80 border-gray-600' : 'bg-black/40 border-gray-800 cursor-pointer'}`}
                    >
                        <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(log.id)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border ${log.status === 'success' ? 'text-green-500 border-green-800 bg-green-900/20' : 'text-red-500 border-red-800 bg-red-900/20'}`}>
                                    {log.status === 'success' ? '✓' : 'X'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-200">{displayDate}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{log.status === 'success' ? 'BAŞARILI' : 'BAŞARISIZ'}</p>
                                </div>
                            </div>
                            {/* OK İKONU */}
                            <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <div className={`grid md:grid-cols-2 gap-0 text-sm border-t border-gray-800 bg-black/60 transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            <div className="border-b md:border-b-0 md:border-r border-gray-800 pr-4 pb-4 md:pb-0">
                                <h4 className="text-blue-500 font-bold mb-2 text-xs uppercase tracking-widest">İHMALLER (Yapmadıkların)</h4>
                                <p className="text-gray-300 leading-relaxed">{omissionText || <span className="text-gray-600 italic">Not girilmemiş.</span>}</p>
                            </div>
                            <div className="pl-0 md:pl-4 pt-4 md:pt-0">
                                <h4 className="text-red-500 font-bold mb-2 text-xs uppercase tracking-widest">ENGELLER (Hataların)</h4>
                                <p className="text-gray-300 leading-relaxed">{commissionText || <span className="text-gray-600 italic">Not girilmemiş.</span>}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      )}
    </div>
  )
}