import projectsData from '@/data/projects.json'
import type { ProjectWithMedia } from '@/lib/types/database'

const R2_URL = process.env.NEXT_PUBLIC_R2_URL ?? ''

type RawMedia = {
  type: string
  path: string
  displayOrder: number
}

type RawProject = {
  id: string
  title: string
  description: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  displayOrder: number
  media: RawMedia[]
}

function mediaUrl(type: string, path: string): string {
  const bucket = type === 'video' ? 'project-videos' : 'project-images'
  return `${R2_URL}/${bucket}/${path}`
}

export function getProjects(): ProjectWithMedia[] {
  return (projectsData as RawProject[]).map((p) => {
    const media = p.media.map((m, i) => ({
      id: `${p.id}-${i}`,
      project_id: p.id,
      media_type: m.type as 'image' | 'video',
      storage_path: m.path,
      public_url: mediaUrl(m.type, m.path),
      display_order: m.displayOrder,
    }))
    const firstImage = media.find((m) => m.media_type === 'image') ?? media[0]

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      location: p.location,
      start_date: p.startDate,
      end_date: p.endDate,
      display_order: p.displayOrder,
      media,
      thumbnail: firstImage?.public_url,
    }
  })
}
