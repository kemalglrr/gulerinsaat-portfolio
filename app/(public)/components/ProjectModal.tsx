'use client'

import { ProjectWithMedia } from '@/lib/types/database'
import { X, MapPin, Calendar } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface ProjectModalProps {
  project: ProjectWithMedia
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const images = project.media?.filter(m => m.media_type === 'image') || []
  const videos = project.media?.filter(m => m.media_type === 'video') || []

  const lightboxSlides = images.map(img => ({
    src: img.public_url,
    alt: project.title
  }))

  const handleImageClick = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between z-10">
            <div className="flex-1 pr-4">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {project.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-slate-600">
                {project.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                )}
                {mounted && project.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Description */}
            {project.description && (
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Proje Detayları</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            )}

            {/* Images */}
            {images.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Fotoğraflar ({images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                      onClick={() => handleImageClick(index)}
                    >
                      <Image
                        src={image.public_url}
                        alt={`${project.title} - ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Videolar ({videos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden"
                    >
                      <video
                        src={video.public_url}
                        controls
                        className="w-full h-full object-contain"
                        poster={video.thumbnail_url || undefined}
                      >
                        Tarayıcınız video oynatmayı desteklemiyor.
                      </video>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lightboxSlides}
          index={lightboxIndex}
        />
      )}
    </>
  )
}
