import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DeleteButton from '@/components/DeleteButton'
import { deletePost } from './[id]/actions'

// --- TİP TANIMLARI ---
interface PostWithAuthor {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
  profiles: { username: string | null } | null
}

export default async function FeedPage() {
  const supabase = await createClient()
  
  // 1. Auth Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Profil Kontrolü (Onboarding tamamlanmış mı?)
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile?.username) {
    redirect('/onboarding')
  }

  // 3. Postları Getir
  const { data: rawPosts, error } = await supabase
    .from('forum_posts')
    .select(`
      id,
      title,
      content,
      created_at,
      user_id,
      profiles!forum_posts_user_id_fkey (username)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Feed Veri Hatası:", error)
    // Production'da kullanıcıya hata UI'ı gösterilebilir
  }

  // Supabase'den gelen veriyi tiple eşleştir
  const posts = (rawPosts as unknown as PostWithAuthor[]) || []

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 pb-20">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-end justify-between mb-8 border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-4xl font-black tracking-tighter mb-1">FORUM</h1>
                <p className="text-gray-400 text-sm">Tecrübe paylaşımı ve strateji alanı.</p>
            </div>
            <Link 
              href="/feed/create" 
              className="bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-red-600 transition shadow-[0_0_15px_-5px_#dc2626]"
            >
              + KONU AÇ
            </Link>
        </div>

        {/* FEED LISTESI */}
        <div className="space-y-4">
          {posts.map((post) => {
             // Yazar adını güvenli bir şekilde al
             const authorName = post.profiles?.username || 'Anonim Üye'
             const isOwner = user.id === post.user_id

             return (
                <div key={post.id} className="relative group">
                    {/* SİLME BUTONU (Sadece Sahibi Görebilir) */}
                    {isOwner && (
                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DeleteButton 
                                onDelete={async () => {
                                    'use server'
                                    await deletePost(post.id)
                                }} 
                                title="Sil"
                            />
                        </div>
                    )}

                    {/* POST KARTI */}
                    <Link href={`/feed/${post.id}`} className="block bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition group cursor-pointer">
                        <div className="flex justify-between items-start mb-2 pr-10">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-bold text-red-500">@{authorName}</span>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition">
                            {post.title}
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                            {post.content}
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-900 flex gap-4 text-xs font-bold text-gray-600">
                            <span className="group-hover:text-white transition">💬 Yorumlar</span>
                            <span className="group-hover:text-white transition">🔥 Beğeni</span>
                        </div>
                    </Link>
                </div>
             )
          })}
          
          {/* EMPTY STATE */}
          {posts.length === 0 && (
             <div className="text-center py-20 bg-gray-900/20 rounded-xl border border-dashed border-gray-800">
                <div className="text-4xl mb-4 grayscale">📭</div>
                <p className="text-gray-500 font-bold">Henüz hiç konu açılmadı.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}