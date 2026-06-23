'use client'

import { ProjectWithMedia } from '@/lib/types/database'
import { getProjectStatus } from '@/lib/utils'
import { MapPin, Image as ImageIcon, Video, Clock, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

interface ProjectCardProps {
  project: ProjectWithMedia
  onClick: () => void
}

const STATUS_STYLES = {
  completed: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  ongoing: {
    icon: Clock,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
} as const

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const imageCount = project.media?.filter(m => m.media_type === 'image').length || 0
  const videoCount = project.media?.filter(m => m.media_type === 'video').length || 0

  const status = getProjectStatus(project.start_date, project.end_date)
  const statusStyle = status ? STATUS_STYLES[status.type] : null
  
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer group h-full"
    >
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Proje Görseli */}
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-slate-300" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status Badge */}
          {status && statusStyle && (
            <div className={`absolute top-3 right-3 px-3 py-1.5 ${statusStyle.bgColor} ${statusStyle.borderColor} border-2 rounded-full backdrop-blur-sm flex items-center gap-1.5`}>
              <statusStyle.icon className={`w-4 h-4 ${statusStyle.textColor}`} />
              <span className={`${statusStyle.textColor} text-xs font-semibold leading-tight`}>
                {status.label}
              </span>
            </div>
          )}
        </div>
        
        {/* Proje Bilgileri */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
            {project.title}
          </h3>
          
          {project.description && (
            <p className="text-gray-600 mb-4 line-clamp-2 flex-1">
              {project.description}
            </p>
          )}
          
          {/* Meta Bilgiler */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4 pb-4 border-b border-slate-100">
            {project.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{project.location}</span>
              </div>
            )}
            
            {imageCount > 0 && (
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-orange-500" />
                <span>{imageCount} Fotoğraf</span>
              </div>
            )}
            
            {videoCount > 0 && (
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4 text-orange-500" />
                <span>{videoCount} Video</span>
              </div>
            )}
          </div>
          
          {/* Detay Butonu */}
          <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-300">
            Detayları İncele
          </button>
        </div>
      </div>
    </div>
  )
}
