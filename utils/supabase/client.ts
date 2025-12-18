// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Type-safe Supabase client type
export type TypedSupabaseClient = SupabaseClient<Database>

// Singleton instance
let clientInstance: TypedSupabaseClient | undefined

/**
 * Browser-side Supabase client oluşturur (Singleton pattern)
 * Client Components için kullanılır
 * @returns Type-safe Supabase client
 */
export function createClient(): TypedSupabaseClient {
  if (clientInstance) {
    return clientInstance
  }

  clientInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return clientInstance
}

/**
 * Type-safe client getter (alias)
 * @returns Type-safe Supabase client
 */
export function getSupabase(): TypedSupabaseClient {
  return createClient()
}

/**
 * Mevcut kullanıcıyı getirir
 * @returns User object veya null
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user:', error.message)
    return null
  }

  return user
}

/**
 * Mevcut session'ı getirir
 * @returns Session object veya null
 */
export async function getCurrentSession() {
  const supabase = createClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Error fetching session:', error.message)
    return null
  }

  return session
}

/**
 * Kullanıcının profile bilgisini getirir
 * @returns Profile object veya null
 */
export async function getCurrentProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error.message)
    return null
  }

  return data
}

/**
 * Sign out işlemi
 * @returns Success/Error durumu
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error.message)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Generic type-safe query builder
 * Örnek kullanım: queryBuilder('challenges').select('*').eq('is_public', true)
 */
export function queryBuilder<T extends keyof Database['public']['Tables']>(
  table: T
) {
  const supabase = createClient()
  return supabase.from(table)
}

/**
 * Type-safe insert helper
 * @param table - Tablo adı
 * @param data - Insert edilecek veri
 * @returns Insert sonucu
 */
export async function insertRecord<T extends keyof Database['public']['Tables']>(
  table: T,
  data: Database['public']['Tables'][T]['Insert']
) {
  const supabase = createClient()
  return supabase.from(table).insert(data).select().single()
}

/**
 * Type-safe update helper
 * @param table - Tablo adı
 * @param id - Güncellenecek kayıt ID'si
 * @param data - Güncellenecek veri
 * @returns Update sonucu
 */
export async function updateRecord<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string,
  data: Database['public']['Tables'][T]['Update']
) {
  const supabase = createClient()
  return supabase.from(table).update(data).eq('id', id).select().single()
}

/**
 * Type-safe delete helper
 * @param table - Tablo adı
 * @param id - Silinecek kayıt ID'si
 * @returns Delete sonucu
 */
export async function deleteRecord<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string
) {
  const supabase = createClient()
  return supabase.from(table).delete().eq('id', id)
}

/**
 * Type-safe single record getter
 * @param table - Tablo adı
 * @param id - Getirilecek kayıt ID'si
 * @returns Kayıt veya null
 */
export async function getRecordById<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string
) {
  const supabase = createClient()
  return supabase.from(table).select('*').eq('id', id).single()
}

/**
 * Type-safe realtime subscription helper
 * @param table - Tablo adı
 * @param callback - Insert, update, delete event'leri için callback
 * @returns Channel objesi (unsubscribe için)
 */
export function subscribeToTable<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: Database['public']['Tables'][T]['Row']
    old: Database['public']['Tables'][T]['Row']
  }) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Database['public']['Tables'][T]['Row'],
          old: payload.old as Database['public']['Tables'][T]['Row'],
        })
      }
    )
    .subscribe()

  return channel
}

/**
 * Storage'a dosya upload helper
 * @param bucket - Bucket adı
 * @param path - Dosya yolu
 * @param file - Upload edilecek dosya
 * @returns Upload sonucu
 */
export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = createClient()
  return supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
}

/**
 * Storage'dan public URL oluşturur
 * @param bucket - Bucket adı
 * @param path - Dosya yolu
 * @returns Public URL
 */
export function getPublicUrl(bucket: string, path: string) {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

/**
 * Storage'dan dosya siler
 * @param bucket - Bucket adı
 * @param paths - Silinecek dosya yolları
 * @returns Delete sonucu
 */
export async function deleteFiles(bucket: string, paths: string[]) {
  const supabase = createClient()
  return supabase.storage.from(bucket).remove(paths)
}