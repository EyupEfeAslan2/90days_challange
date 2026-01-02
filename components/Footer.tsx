import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-900 bg-black py-12 mt-20 text-center relative z-50">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tighter text-white">
          90<span className="text-red-600">DAYS</span>
        </h2>
      </div>
      
      {/* LİNKLER GÜNCELLENDİ */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs text-gray-500 font-bold uppercase tracking-widest">
        <Link href="/legal/kvkk" className="hover:text-white transition hover:underline underline-offset-4 decoration-gray-800">
            Gizlilik & KVKK
        </Link>

        <Link href="/legal/terms" className="hover:text-white transition hover:underline underline-offset-4 decoration-gray-800">
            Kullanım Şartları
        </Link>
        
        {/* ARTIK /contact SAYFASINA GİDİYOR */}
        <Link href="/legal/contact" className="hover:text-white transition hover:underline underline-offset-4 decoration-gray-800">
            İletişim
        </Link>
      </div>

      <p className="mt-8 text-[10px] text-gray-700 font-mono">
        © {new Date().getFullYear()} 90DAYS. İrade, kas gibidir; kullandıkça güçlenir.
      </p>
    </footer>
  );
}