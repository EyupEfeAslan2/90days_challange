export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 md:p-20 font-sans max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          90DAYS olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz. 
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca hazırlanmıştır.
        </p>
        
        <h3 className="text-xl font-bold text-white mt-8">1. Veri Sorumlusu</h3>
        <p>
          Kişisel verileriniz; veri sorumlusu sıfatıyla 90DAYS platformu tarafından aşağıda açıklanan kapsamda işlenebilecektir.
        </p>

        <h3 className="text-xl font-bold text-white mt-8">2. İşlenen Kişisel Veriler</h3>
        <p>
          Platformumuza üye olurken paylaştığınız E-posta adresiniz ve belirlediğiniz şifreniz (şifrelenmiş olarak) sistemlerimizde tutulmaktadır.
          Google Analytics aracılığıyla anonimleştirilmiş trafik verileri toplanmaktadır.
        </p>

        <h3 className="text-xl font-bold text-white mt-8">3. Verilerin İşlenme Amacı</h3>
        <p>
          - Üyelik işlemlerinin gerçekleştirilmesi,<br/>
          - Platform güvenliğinin sağlanması,<br/>
          - İletişim faaliyetlerinin yürütülmesi.
        </p>
        
        {/* Buraya daha fazla madde eklenebilir */}
      </div>
      
      <div className="mt-12 pt-12 border-t border-gray-800">
        <a href="/" className="text-white font-bold hover:underline">← Ana Sayfaya Dön</a>
      </div>
    </div>
  )
}