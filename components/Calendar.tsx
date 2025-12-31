'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  startOfWeek,
  endOfWeek,
  addMonths, // Ay değiştirmek için
  subMonths
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ARTIK CHALLENGE ID İSTİYORUZ
interface CalendarProps {
  challengeId?: string; 
}

export default function Calendar({ challengeId }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    fetchLogs();
  }, [currentDate, challengeId]);

  const fetchLogs = async () => {
    setLoading(true);
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    let query = supabase
      .from('daily_logs')
      .select('*')
      .gte('date', start)
      .lte('date', end);

    // Eğer challengeId varsa sadece ona ait logları getir
    if (challengeId) {
      query = query.eq('challenge_id', challengeId);
    }

    const { data } = await query;

    if (data) setLogs(data);
    setLoading(false);
  };

  const toggleDay = async (day: Date) => {
    if (!challengeId) return; // Hedef ID yoksa işlem yapma (Güvenlik)

    const dateStr = format(day, 'yyyy-MM-dd');
    const existingLog = logs.find(log => log.date === dateStr);
    
    // UI'ı hemen güncelle (Beklemeden)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!existingLog) {
      // 1. YEŞİL (Success) - CHALLENGE_ID EKLENDİ
      await supabase.from('daily_logs').insert([
        { 
          user_id: user.id, 
          challenge_id: challengeId, // <-- ARTIK HANGİ HEDEF OLDUĞUNU BİLİYOR
          date: dateStr, 
          status: 'success' 
        }
      ] as any);
    } else if (existingLog.status === 'success') {
      // 2. KIRMIZI (Fail)
      await supabase.from('daily_logs').update({ status: 'fail' } as any).eq('id', existingLog.id);
    } else {
      // 3. SİL
      await supabase.from('daily_logs').delete().eq('id', existingLog.id);
    }

    fetchLogs();
  };

  // Ay Değiştirme Fonksiyonları
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="w-full">
      
      {/* Üst Kısım: Navigasyon */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button 
            onClick={prevMonth}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition"
        >
            ←
        </button>
        
        <h2 className="text-sm font-bold text-gray-300 capitalize select-none">
          {format(currentDate, 'MMMM yyyy', { locale: tr })}
        </h2>

        <button 
            onClick={nextMonth}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition"
        >
            →
        </button>
      </div>

      {/* Gün İsimleri */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'].map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-gray-600 uppercase select-none">
            {day}
          </div>
        ))}
      </div>

      {/* Günler */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const log = logs.find((l) => l.date === dateStr);
          const isSelectedMonth = isSameMonth(day, monthStart);

          return (
            <button
              key={day.toString()}
              onClick={() => toggleDay(day)}
              disabled={!isSelectedMonth} 
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200 border border-transparent select-none",
                !isSelectedMonth && "opacity-0 pointer-events-none",
                isSelectedMonth && !log && "text-zinc-500 hover:bg-zinc-800 hover:text-white",
                
                // RENKLER
                isSelectedMonth && log?.status === 'success' && "bg-green-900/40 text-green-400 border-green-900/50 shadow-[0_0_10px_-4px_#22c55e]", 
                isSelectedMonth && log?.status === 'fail' && "bg-red-900/40 text-red-400 border-red-900/50 shadow-[0_0_10px_-4px_#ef4444]", 
                
                isToday(day) && !log && "border-blue-500/50 text-blue-400 bg-blue-900/10",
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex justify-between px-2 text-[10px] text-gray-500 font-mono select-none">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500/50"></span> Başarılı</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500/50"></span> Başarısız</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-gray-600"></span> Boş</div>
      </div>
      <p className="text-gray-400 text-sm"> Değiştirmek İçin Tıkla </p>
    </div>
    
  );
}