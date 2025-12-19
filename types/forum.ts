// types/forum.ts (ÖNERİLEN)
export interface Profile {
  username: string | null;
  avatar_url?: string | null;
}

export interface ForumPost {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id: string;
  profiles: Profile | null; // Join ile gelen veri
}

export interface ForumComment {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  profiles: Profile | null;
}

export interface ForumLike {
  user_id: string;
  vote_type: 'up' | 'down';
}