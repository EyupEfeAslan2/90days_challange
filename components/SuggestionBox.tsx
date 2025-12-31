'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation'; // ✅ EKLENDİ

interface Props {
  user: User | null;
}

export default function SuggestionBox({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // ✅ URL KONTROLÜ
  const pathname = usePathname();
  
  // Eğer Login veya Register sayfasındaysak, component HİÇBİR ŞEY döndürmesin (Gizlensin)
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('suggestions' as any)
      .insert([{ user_id: user.id, message: message }]);

    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setMessage('');
      setTimeout(() => {
        setIsOpen(false);
        setStatus('idle');
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all z-50 flex items-center justify-center group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out group-hover:ml-2">
          Öneri Kutusu
        </span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-5 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Fikrini Söyle 💡</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>

          {!user ? (
            <div className="text-center py-4">
              <p className="text-gray-300 mb-4 text-sm">
                Öneri ve görüş bildirmek için aramıza katılmalısın Komutan!
              </p>
              <a href="/login" className="block w-full bg-white text-black py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                Giriş Yap
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Şunu da eklesek efsane olur..."
                className="w-full h-32 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-white placeholder-gray-500"
                required
              />
              {status === 'error' && <p className="text-red-500 text-xs mt-2">Bir hata oluştu.</p>}
              {status === 'success' && <p className="text-green-500 text-xs mt-2">Mesajın iletildi! 🚀</p>}
              <button
                type="submit"
                disabled={loading || status === 'success'}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? '...' : status === 'success' ? 'Teşekkürler' : 'Gönder'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}