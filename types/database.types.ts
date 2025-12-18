// types/database.types.ts
// Supabase veritabanı tipleri - SQL şemasından otomatik türetilmiştir

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum-like types
export type VoteType = 'up' | 'down'

// Database raw types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          email: string | null
          username: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          email?: string | null
          username?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          email?: string | null
          username?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          start_date: string
          end_date: string
          created_by: string
          is_public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          created_by: string
          is_public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          created_by?: string
          is_public?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_challenges: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          challenge_id: string
          log_date: string
          sins_of_omission: string | null
          sins_of_commission: string | null
          is_completed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          challenge_id: string
          log_date?: string
          sins_of_omission?: string | null
          sins_of_commission?: string | null
          is_completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          challenge_id?: string
          log_date?: string
          sins_of_omission?: string | null
          sins_of_commission?: string | null
          is_completed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_challenge_id_fkey"
            columns: ["challenge_id"]
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_posts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          content?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_comments: {
        Row: {
          id: string
          created_at: string
          post_id: string
          user_id: string
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          post_id: string
          user_id: string
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          post_id?: string
          user_id?: string
          content?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_likes: {
        Row: {
          user_id: string
          post_id: string
          vote_type: VoteType
          created_at: string
        }
        Insert: {
          user_id: string
          post_id: string
          vote_type: VoteType
          created_at?: string
        }
        Update: {
          user_id?: string
          post_id?: string
          vote_type?: VoteType
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      challenge_leaderboard: {
        Row: {
          challenge_id: string | null
          username: string | null
          streak: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// Utility types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

export type Views<T extends keyof Database['public']['Views']> = 
  Database['public']['Views'][T]['Row']

// Exported domain types
export type Profile = Tables<'profiles'>
export type Challenge = Tables<'challenges'>
export type UserChallenge = Tables<'user_challenges'>
export type DailyLog = Tables<'daily_logs'>
export type ForumPost = Tables<'forum_posts'>
export type ForumComment = Tables<'forum_comments'>
export type ForumLike = Tables<'forum_likes'>
export type ChallengeLeaderboard = Views<'challenge_leaderboard'>

// Insert types
export type ProfileInsert = TablesInsert<'profiles'>
export type ChallengeInsert = TablesInsert<'challenges'>
export type UserChallengeInsert = TablesInsert<'user_challenges'>
export type DailyLogInsert = TablesInsert<'daily_logs'>
export type ForumPostInsert = TablesInsert<'forum_posts'>
export type ForumCommentInsert = TablesInsert<'forum_comments'>
export type ForumLikeInsert = TablesInsert<'forum_likes'>

// Update types
export type ProfileUpdate = TablesUpdate<'profiles'>
export type ChallengeUpdate = TablesUpdate<'challenges'>
export type UserChallengeUpdate = TablesUpdate<'user_challenges'>
export type DailyLogUpdate = TablesUpdate<'daily_logs'>
export type ForumPostUpdate = TablesUpdate<'forum_posts'>
export type ForumCommentUpdate = TablesUpdate<'forum_comments'>
export type ForumLikeUpdate = TablesUpdate<'forum_likes'>