export type Media = {
  id: string
  project_id: string
  media_type: 'image' | 'video'
  storage_path: string
  public_url: string
  thumbnail_url?: string
  display_order: number
}

export type Project = {
  id: string
  title: string
  description: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  display_order: number
}

export type ProjectWithMedia = Project & {
  media: Media[]
  thumbnail?: string
}
