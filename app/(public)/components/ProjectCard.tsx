'use client'

import { ProjectWithMedia } from '@/lib/types/database'
import { MapPin, Image as ImageIcon, Video, Clock, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

interface ProjectCardProps {
  project: ProjectWithMedia
  onClick: () => void
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const imageCount = project.media?.filter(m => m.media_type === 'image').length || 0
  const videoCount = project.media?.filter(m => m.media_type === 'video').length || 0
  
  // Proje durumu hesaplama
  const getProjectStatus = () => {
    if (!project.start_date) return null
    
    const startDate = new Date(project.start_date)
    const endDate = project.end_date ? new Date(project.end_date) : null
    
    if (endDate) {
      // Tamamlandı - Süre hesapla
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth())
      
      let duration = ''
      if (months >= 12) {
        const years = Math.floor(months / 12)
        const remainingMonths = months % 12
        duration = years > 0 ? `${years} yıl` : ''
        if (remainingMonths > 0) {
          duration += (duration ? ' ' : '') + `${remainingMonths} ay`
        }
      } else if (months > 0) {
        duration = `${months} ay`
      } else {
        duration = '1 aydan kısa'
      }
      
      return {
        type: 'completed' as const,
        label: 'Tamamlandı',
        duration,
        icon: CheckCircle2,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
      }
    }
    
    // Devam ediyor
    return {
      type: 'ongoing' as const,
      label: 'Devam Ediyor',
      icon: Clock,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    }
  }
  
  const projectStatus = getProjectStatus()
  
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer group h-full"
    >
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-orange-600 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Proje Görseli */}
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
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
          {projectStatus && (
            <div className={`absolute top-3 right-3 px-3 py-1.5 ${projectStatus.bgColor} ${projectStatus.borderColor} border-2 rounded-full backdrop-blur-sm flex items-center gap-1.5`}>
              <projectStatus.icon className={`w-4 h-4 ${projectStatus.textColor}`} />
              <span className={`${projectStatus.textColor} text-xs font-semibold leading-tight`}>
                {projectStatus.label}
              </span>
            </div>
          )}
        </div>
        
        {/* Proje Bilgileri */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
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
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>{project.location}</span>
              </div>
            )}
            
            {imageCount > 0 && (
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-orange-600" />
                <span>{imageCount} Fotoğraf</span>
              </div>
            )}
            
            {videoCount > 0 && (
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4 text-orange-600" />
                <span>{videoCount} Video</span>
              </div>
            )}
          </div>
          
          {/* Detay Butonu */}
          <button className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
            Detayları İncele
          </button>
        </div>
      </div>
    </div>
  )
}
