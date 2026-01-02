export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 md:p-20 font-sans max-w-4xl mx-auto pt-32">
      <h1 className="text-3xl font-bold text-white mb-8">Kullanım Şartları</h1>
      
      <div className="space-y-8 text-sm leading-relaxed border-l border-gray-800 pl-6">
        
        <section>
          <h3 className="text-white font-bold mb-2">1. Kabul Edilme</h3>
          <p>
            90DAYS platformuna ("Hizmet") erişerek veya kullanarak, bu Kullanım Şartlarını kabul etmiş sayılırsınız. 
            Bu şartları kabul etmiyorsanız, lütfen hizmeti kullanmayınız.
          </p>
        </section>

        <section>
          <h3 className="text-white font-bold mb-2">2. Hizmetin Amacı</h3>
          <p>
            90DAYS, kullanıcıların kişisel hedeflerine ulaşmalarına yardımcı olmak amacıyla tasarlanmış bir öz disiplin ve takip aracıdır. 
            Platformda sunulan içerikler, tavsiyeler veya kullanıcı yorumları profesyonel tıbbi veya psikolojik danışmanlık yerine geçmez.
          </p>
        </section>

        <section>
          <h3 className="text-white font-bold mb-2">3. Kullanıcı Sorumlulukları</h3>
          <p>
            Hesabınızın güvenliğinden ve şifrenizin korunmasından tamamen siz sorumlusunuz. 
            Platform üzerinde paylaştığınız içeriklerin (yorumlar, hedefler) yasalara ve genel ahlak kurallarına uygun olması gerekmektedir.
            Nefret söylemi, taciz veya yasa dışı içerik paylaşımı hesabın kapatılmasına neden olur.
          </p>
        </section>

        <section>
          <h3 className="text-white font-bold mb-2">4. Hesap Silme</h3>
          <p>
            Kullanıcılar diledikleri zaman hesaplarını silme hakkına sahiptir. Hesap silindiğinde, tüm veriler (loglar, hedefler) kalıcı olarak yok edilir ve geri getirilemez.
          </p>
        </section>

        <section>
          <h3 className="text-white font-bold mb-2">5. Değişiklikler</h3>
          <p>
            90DAYS, bu kullanım şartlarını dilediği zaman güncelleme hakkını saklı tutar. Değişiklikler sitede yayınlandığı andan itibaren geçerli olur.
          </p>
        </section>

      </div>

      <div className="mt-12 pt-12 border-t border-gray-800">
        <a href="/" className="text-white font-bold hover:underline">← Ana Sayfaya Dön</a>
      </div>
    </div>
  )
}