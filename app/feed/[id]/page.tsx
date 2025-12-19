import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { addComment, votePost, deletePost } from './actions'

// --- TİP TANIMLARI ---
interface LikeData {
  user_id: string
  vote_type: 'up' | 'down'
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 16: params promise olduğu için await ediyoruz
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Post ve İlgili Verileri Getir (Join)
  const { data: post, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      profiles!forum_posts_user_id_fkey (username),
      forum_likes (user_id, vote_type)
    `)
    .eq('id', id)
    .single()

  if (error || !post) {
    return <div className="text-white pt-32 text-center font-bold">Konu bulunamadı veya silinmiş.</div>
  }

  // 2. Yorumları Getir
  const { data: comments } = await supabase
    .from('forum_comments')
    .select(`
      *, 
      profiles (username)
    `)
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  // 3. Logic: Oyları Hesapla
  // Supabase join response tipini güvenli hale getiriyoruz
  const votes = (post.forum_likes as unknown as LikeData[]) || []
  const upvotes = votes.filter(v => v.vote_type === 'up').length
  
  // Kullanıcının mevcut oyu
  const myVote = votes.find(v => v.user_id === user.id)?.vote_type

  // Yazar Adı
  const authorName = post.profiles?.username || 'Anonim Üye'

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-32 pb-20">
      <div className="max-w-3xl mx-auto">
        
        {/* NAV */}
        <Link href="/feed" className="text-gray-500 hover:text-white mb-6 inline-flex items-center gap-2 transition font-medium text-sm">
            <span>←</span> Akışa Dön
        </Link>

        {/* --- POST KARTI --- */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
           
           {/* HEADER */}
           <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <div className="w-10 h-10 rounded-full bg-blue-900/20 text-blue-500 flex items-center justify-center font-bold text-lg border border-blue-900/30">
                 {authorName[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                 <div className="font-bold text-white text-lg">@{authorName}</div>
                 <div className="text-xs text-gray-500 font-mono">
                   {new Date(post.created_at).toLocaleDateString('tr-TR')}
                 </div>
              </div>
           </div>
           
           {/* BAŞLIK & ACTION */}
           <div className="flex justify-between items-start mb-6 gap-4">
               <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex-1 leading-tight">
                   {post.title}
               </h1>

               {/* DELETE BUTTON (Owner Only) */}
               {user.id === post.user_id && (
                   <form action={async () => { 'use server'; await deletePost(id) }}>
                       <button 
                           className="text-gray-500 hover:text-red-500 p-2 rounded-lg transition-colors hover:bg-red-900/10"
                           title="Konuyu Sil"
                           type="submit"
                       >
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                       </button>
                   </form>
               )}
           </div>

           {/* CONTENT */}
           <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg font-light mb-8">
             {post.content}
           </div>

           {/* VOTING AREA */}
           <div className="flex items-center gap-4">
             <div className="flex items-center bg-gray-900 rounded-full overflow-hidden border border-gray-800">
               
               {/* UPVOTE */}
               <form action={async () => { 'use server'; await votePost(id, 'up') }}>
                 <button type="submit" className={`
                    flex items-center gap-2 px-4 py-2 hover:bg-gray-800 transition
                    ${myVote === 'up' ? 'text-white bg-green-900/30' : 'text-gray-400'}
                 `}>
                    <svg className="w-6 h-6" fill={myVote === 'up' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span className="font-bold text-sm">{upvotes}</span>
                 </button>
               </form>

               <div className="w-[1px] h-6 bg-gray-700"></div>

               {/* DOWNVOTE */}
               <form action={async () => { 'use server'; await votePost(id, 'down') }}>
                 <button type="submit" className={`
                    px-4 py-2 hover:bg-gray-800 transition
                    ${myVote === 'down' ? 'text-red-500 bg-red-900/30' : 'text-gray-400'}
                 `}>
                    <svg className="w-6 h-6" fill={myVote === 'down' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                 </button>
               </form>
             </div>
           </div>
        </div>

        {/* --- YORUMLAR --- */}
        <div className="space-y-6">
           <h3 className="font-black text-gray-500 uppercase tracking-widest text-sm border-b border-gray-900 pb-2">
             YORUMLAR ({comments?.length || 0})
           </h3>
           
           {comments?.map((comment: any) => {
             const commenterName = comment.profiles?.username || 'Anonim Üye';
             return (
               <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition duration-300">
                  <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {commenterName[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">@{commenterName}</span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(comment.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                     </div>
                     <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                  </div>
               </div>
             )
           })}

           {/* YORUM FORMU */}
           <form action={addComment} className="mt-8 flex gap-4">
              <div className="w-8 h-8 rounded-full bg-red-900/50 flex-shrink-0 mt-2"></div>
              <div className="flex-1 space-y-3">
                  <input type="hidden" name="post_id" value={id} />
                  <textarea 
                    name="content" 
                    placeholder="Düşüncelerini paylaş..." 
                    className="w-full bg-transparent border-b border-gray-700 text-white p-2 focus:border-white outline-none transition resize-none min-h-[50px]"
                    required
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-500 transition shadow-lg shadow-blue-900/20">
                        Yorum Yap
                    </button>
                  </div>
              </div>
           </form>
        </div>

      </div>
    </div>
  )
}