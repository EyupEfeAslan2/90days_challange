// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Type-safe Supabase client type
export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Server-side Supabase client oluşturur
 * Server Components, Server Actions ve API Routes için kullanılır
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
            // Server Component içinden cookie set edilemez, bu hata normaldir.
            // Middleware bu işi halleder.
          }
        },
      },
    }
  )
}

/**
 * Mevcut kullanıcıyı getirir (Server-side)
 * @returns User object veya null
 */
export async function getServerUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    // console.error('Error fetching server user:', error.message)
    return null
  }

  return user
}

/**
 * Mevcut profili getirir (Server-side)
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

  if (error) return null
  return data
}

/**
 * Generic type-safe query builder (Server-side)
 * Örnek: await queryBuilder('challenges').select('*')
 */
export function queryBuilder<T extends keyof Database['public']['Tables']>(
  table: T
) {
  // Not: Server tarafında await createClient() gerektiği için bu fonksiyon
  // zincirleme (chaining) yapısında biraz farklı kullanılır.
  // Genelde direkt createClient() kullanmak daha iyidir ama helper olarak kalsın.
  return {
    select: async (query: string = '*') => {
      const supabase = await createClient()
      // FIX: as any eklendi
      return (supabase.from(table) as any).select(query)
    }
  }
}

/**
 * Type-safe insert helper (Server-side)
 */
export async function insertRecord<T extends keyof Database['public']['Tables']>(
  table: T,
  data: Database['public']['Tables'][T]['Insert']
) {
  const supabase = await createClient()
  // FIX: as any eklendi (Hata veren satır buydu)
  return (supabase.from(table) as any).insert(data).select().single()
}

/**
 * Type-safe update helper (Server-side)
 */
export async function updateRecord<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string,
  data: Database['public']['Tables'][T]['Update']
) {
  const supabase = await createClient()
  // FIX: as any eklendi
  return (supabase.from(table) as any).update(data).eq('id', id).select().single()
}

/**
 * Type-safe delete helper (Server-side)
 */
export async function deleteRecord<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string
) {
  const supabase = await createClient()
  // FIX: as any eklendi
  return (supabase.from(table) as any).delete().eq('id', id)
}

/**
 * Type-safe single record getter (Server-side)
 */
export async function getRecordById<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string
) {
  const supabase = await createClient()
  // FIX: as any eklendi
  return (supabase.from(table) as any).select('*').eq('id', id).single()
}