export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_tier: string
          storage_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          subscription_tier?: string
          storage_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_tier?: string
          storage_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      transfers: {
        Row: {
          id: string
          user_id: string | null
          name: string
          message: string | null
          expires_at: string
          password: string | null
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          message?: string | null
          expires_at: string
          password?: string | null
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          message?: string | null
          expires_at?: string
          password?: string | null
          download_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          transfer_id: string
          name: string
          size: number
          mime_type: string
          storage_path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transfer_id: string
          name: string
          size: number
          mime_type: string
          storage_path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transfer_id?: string
          name?: string
          size?: number
          mime_type?: string
          storage_path?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}