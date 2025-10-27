export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          start_date: string | null
          end_date: string | null
          display_order: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          display_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          display_order?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_media: {
        Row: {
          id: string
          project_id: string
          media_type: 'image' | 'video'
          storage_path: string
          public_url: string
          thumbnail_url: string | null
          file_size: number | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          media_type: 'image' | 'video'
          storage_path: string
          public_url: string
          thumbnail_url?: string | null
          file_size?: number | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          media_type?: 'image' | 'video'
          storage_path?: string
          public_url?: string
          thumbnail_url?: string | null
          file_size?: number | null
          display_order?: number
          created_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type ProjectMedia = Database['public']['Tables']['project_media']['Row']
export type ProjectMediaInsert = Database['public']['Tables']['project_media']['Insert']
export type ProjectMediaUpdate = Database['public']['Tables']['project_media']['Update']

export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
export type ContactMessageInsert = Database['public']['Tables']['contact_messages']['Insert']

// Extended types with relations
export type ProjectWithMedia = Project & {
  media: ProjectMedia[]
  media_count?: number
  thumbnail?: string
}

