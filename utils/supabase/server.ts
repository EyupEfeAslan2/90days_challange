// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Type-safe Supabase client type
export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Server-side Supabase client oluşturur
 * Server Components, Server Actions ve Route Handlers için kullanılır
 * @returns Type-safe Supabase client
 */
export async function createClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component'ta set çağrısı yapılırsa ignore edilir
            // Middleware'de veya Route Handler'da düzgün çalışır
          }
        },
      },
    }
  )
}

/**
 * Type-safe server client getter
 * @returns Type-safe Supabase client
 */
export async function getServerSupabase(): Promise<TypedSupabaseClient> {
  return createClient()
}

/**
 * Mevcut kullanıcıyı getirir
 * @returns User object veya null
 */
export async function getServerUser() {
  const supabase = await createClient()
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
export async function getServerSession() {
  const supabase = await createClient()
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
export async function getServerProfile() {
  const user = await getServerUser()
  if (!user) return null

  const supabase = await createClient()
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
 * Admin kontrolü yapar
 * @param userId - Kontrol edilecek kullanıcı ID'si
 * @returns Admin ise true, değilse false
 */
export async function isServerAdmin(userId?: string): Promise<boolean> {
  const user = userId ? { id: userId } : await getServerUser()
  if (!user) return false

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  if (error || !data) return false

  // Admin kontrolü - örnek: belirli email domain'i
  return data.email?.endsWith('@admin.com') ?? false
}

/**
 * Generic type-safe query builder
 * Örnek kullanım: await queryBuilder('challenges').select('*').eq('is_public', true)
 */
export async function queryBuilder<T extends keyof Database['public']['Tables']>(
  table: T
) {
  const supabase = await createClient()
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
  const supabase = await createClient()
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
  const supabase = await createClient()
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
  const supabase = await createClient()
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
  const supabase = await createClient()
  return supabase.from(table).select('*').eq('id', id).single()
}