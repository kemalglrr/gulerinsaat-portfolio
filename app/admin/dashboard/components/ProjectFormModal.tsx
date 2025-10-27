'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { ProjectWithMedia } from '@/lib/types/database'
import { toast } from 'sonner'
import { X, Save, Upload, Image as ImageIcon, Video, Trash2, GripVertical } from 'lucide-react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { convertImage } from '@/lib/utils/image-converter'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const projectSchema = z.object({
  title: z.string().min(2, 'Proje adı en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_published: z.boolean(),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormModalProps {
  project: ProjectWithMedia | null
  onClose: () => void
  onSuccess: () => void
}

interface MediaFile {
  id: string
  file?: File
  preview?: string
  url?: string
  type: 'image' | 'video'
  storage_path?: string
  display_order: number
}

interface SortableMediaItemProps {
  media: MediaFile
  onDelete: (id: string) => void
}

function SortableMediaItem({ media, onDelete }: SortableMediaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 hover:border-orange-600 transition-all"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-white/90 rounded cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(media.id)}
        className="absolute top-2 right-2 z-10 p-1 bg-red-600 hover:bg-red-700 rounded transition-all"
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>

      {/* Media Preview */}
      <div className="aspect-square relative">
        {media.type === 'image' ? (
          <Image
            src={media.preview || media.url || ''}
            alt="Preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Video className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Type Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 rounded text-xs text-gray-700 font-semibold">
        {media.type === 'image' ? 'Fotoğraf' : 'Video'}
      </div>
    </div>
  )
}

export default function ProjectFormModal({ 
  project, 
  onClose, 
  onSuccess 
}: ProjectFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      location: project?.location || '',
      start_date: project?.start_date || '',
      end_date: project?.end_date || '',
      is_published: project?.is_published ?? true,
    },
  })

  useEffect(() => {
    if (project?.media) {
      const existingMedia: MediaFile[] = project.media.map((m) => ({
        id: m.id,
        url: m.public_url,
        preview: m.public_url, // Add preview for existing media
        type: m.media_type,
        storage_path: m.storage_path,
        display_order: m.display_order,
      }))
      setMediaFiles(existingMedia)
    }
  }, [project])

  const onDrop = async (acceptedFiles: File[]) => {
    const newMedia: MediaFile[] = []

    // File size limits (in bytes)
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500 MB
    const MAX_IMAGE_SIZE = 50 * 1024 * 1024  // 50 MB

    for (const file of acceptedFiles) {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')

      if (!isVideo && !isImage) {
        toast.error(`Geçersiz dosya formatı: ${file.name}`)
        continue
      }

      // File size validation
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        toast.error(`${file.name} çok büyük! Max video boyutu: 500MB (Dosya: ${(file.size / 1024 / 1024).toFixed(2)}MB)`)
        continue
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} çok büyük! Max fotoğraf boyutu: 50MB (Dosya: ${(file.size / 1024 / 1024).toFixed(2)}MB)`)
        continue
      }

      let processedFile = file
      let preview: string | undefined

      // Convert HEIC to JPEG
      if (isImage && (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic'))) {
        try {
          toast.info(`${file.name} JPEG'e dönüştürülüyor...`)
          const result = await convertImage(file)
          processedFile = result.file
          toast.success(`${file.name} başarıyla dönüştürüldü`)
        } catch (error) {
          console.error('HEIC conversion error:', error)
          toast.error(`${file.name} dönüştürülemedi`)
          continue
        }
      }

      // Create preview for images
      if (isImage) {
        preview = URL.createObjectURL(processedFile)
      }

      newMedia.push({
        id: `temp-${Date.now()}-${Math.random()}`,
        file: processedFile,
        preview,
        type: isVideo ? 'video' : 'image',
        display_order: mediaFiles.length + newMedia.length,
      })
    }

    if (newMedia.length > 0) {
      toast.success(`${newMedia.length} dosya eklendi (Toplam: ${mediaFiles.length + newMedia.length})`)
    }

    setMediaFiles([...mediaFiles, ...newMedia])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.heic'],
      'video/*': ['.mp4', '.mov', '.m4v'],
    },
  })

  const handleDeleteMedia = async (id: string) => {
    const mediaToDelete = mediaFiles.find((m) => m.id === id)
    
    // If media exists in storage, delete it
    if (mediaToDelete?.storage_path) {
      try {
        const bucketName = mediaToDelete.type === 'image' ? 'project-images' : 'project-videos'
        await supabase.storage
          .from(bucketName)
          .remove([mediaToDelete.storage_path])
        
        // Also delete from database if it has a UUID (not a temporary ID)
        if (mediaToDelete.id.length > 20) {
          await supabase
            .from('project_media')
            .delete()
            .eq('id', mediaToDelete.id)
        }
      } catch (error) {
        console.error('Error deleting media:', error)
      }
    }
    
    setMediaFiles(mediaFiles.filter((m) => m.id !== id))
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = mediaFiles.findIndex((m) => m.id === active.id)
      const newIndex = mediaFiles.findIndex((m) => m.id === over.id)

      const reordered = arrayMove(mediaFiles, oldIndex, newIndex).map((m, i) => ({
        ...m,
        display_order: i,
      }))
      setMediaFiles(reordered)
    }
  }

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    setUploadProgress(0)

    try {
      let projectId = project?.id

      // Create or update project
      if (project) {
        const { error } = await supabase
          .from('projects')
          .update({
            title: data.title,
            description: data.description,
            location: data.location,
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            is_published: data.is_published,
          })
          .eq('id', project.id)

        if (error) throw error
      } else {
        const { data: newProject, error } = await supabase
          .from('projects')
          .insert([
            {
              title: data.title,
              description: data.description,
              location: data.location,
              start_date: data.start_date || null,
              end_date: data.end_date || null,
              is_published: data.is_published,
              display_order: 0,
            },
          ])
          .select()
          .single()

        if (error) throw error
        projectId = newProject.id
      }

      // Upload new media files
      const newMediaWithFiles = mediaFiles.filter((m) => m.file)
      let uploadedCount = 0
      let firstImageUrl: string | null = null // Track first uploaded image URL for thumbnail

      if (newMediaWithFiles.length > 0) {
        toast.info(`${newMediaWithFiles.length} dosya yükleniyor...`)
      }

      for (const media of newMediaWithFiles) {
        if (!media.file || !projectId) continue

        const fileExt = media.file.name.split('.').pop()
        const fileName = `${projectId}/${Date.now()}-${Math.random()}.${fileExt}`
        const fileSize = (media.file.size / 1024 / 1024).toFixed(2)
        
        // Determine bucket based on media type
        const bucketName = media.type === 'image' ? 'project-images' : 'project-videos'

        try {
          // Toast for large files
          if (media.file.size > 10 * 1024 * 1024) {
            toast.info(`${media.file.name} (${fileSize}MB) yükleniyor... (Bu biraz zaman alabilir)`)
          }

          // Upload to Supabase Storage
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from(bucketName)
            .upload(fileName, media.file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) {
            console.error('Upload error:', uploadError)
            toast.error(`${media.file.name} yüklenemedi: ${uploadError.message}`)
            continue
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName)

          // Insert media record
          await supabase.from('project_media').insert([
            {
              project_id: projectId,
              media_type: media.type,
              public_url: urlData.publicUrl,
              storage_path: fileName,
              display_order: media.display_order,
            },
          ])

          // Save first image URL for thumbnail
          if (!firstImageUrl && media.type === 'image') {
            firstImageUrl = urlData.publicUrl
          }

          uploadedCount++
          const progress = Math.round((uploadedCount / newMediaWithFiles.length) * 100)
          setUploadProgress(progress)
          
          if (media.file.size > 10 * 1024 * 1024) {
            toast.success(`${media.file.name} başarıyla yüklendi!`)
          }
        } catch (err) {
          console.error('Upload failed:', err)
          toast.error(`${media.file.name} yüklenemedi`)
        }
      }

      // Update display_order for existing media
      const existingMedia = mediaFiles.filter((m) => !m.file)
      for (const media of existingMedia) {
        await supabase
          .from('project_media')
          .update({ display_order: media.display_order })
          .eq('id', media.id)
      }

      // Set thumbnail (first image in display order)
      if (projectId) {
        let thumbnailUrl = null
        
        // Find first image in display order
        const firstImage = mediaFiles
          .filter((m) => m.type === 'image')
          .sort((a, b) => a.display_order - b.display_order)[0]
        
        if (firstImage) {
          // Use newly uploaded URL or existing URL
          thumbnailUrl = firstImageUrl || firstImage.url || firstImage.preview || null
        }
        
        // Update thumbnail if we have a URL
        if (thumbnailUrl) {
          await supabase
            .from('projects')
            .update({ thumbnail: thumbnailUrl })
            .eq('id', projectId)
        }
      }

      toast.success(project ? 'Proje güncellendi' : 'Proje eklendi')
      onSuccess()
      onClose() // Close modal after success
    } catch (error: any) {
      console.error('Error saving project:', error)
      toast.error('Proje kaydedilirken bir hata oluştu')
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {project ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Proje Adı *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                placeholder="Örn: Konut Projesi - Ankara"
              />
              {errors.title && (
                <p className="mt-1 text-red-600 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Açıklama
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none"
                placeholder="Proje hakkında detaylı bilgi..."
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Konum
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                placeholder="Örn: Ankara, Türkiye"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Başlangıç Tarihi
                </label>
                <input
                  {...register('start_date')}
                  type="date"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Bitiş Tarihi
                </label>
                <input
                  {...register('end_date')}
                  type="date"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                {...register('is_published')}
                type="checkbox"
                id="is_published"
                className="w-5 h-5 bg-white border-gray-300 rounded text-orange-600 focus:ring-2 focus:ring-orange-600"
              />
              <label htmlFor="is_published" className="text-gray-700 font-medium">
                Projeyi Yayınla
              </label>
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-gray-700 mb-3 font-medium">
              Fotoğraf & Video
            </label>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">
                {isDragActive
                  ? 'Dosyaları buraya bırakın...'
                  : 'Fotoğraf veya video sürükleyip bırakın'}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                Desteklenen formatlar: JPG, PNG, HEIC, MP4, MOV, M4V
              </p>
              <p className="text-gray-500 text-xs">
                Max boyut: Fotoğraf 50MB • Video 500MB
              </p>
            </div>

            {/* Media Grid */}
            {mediaFiles.length > 0 && (
              <div className="mt-6">
                <p className="text-gray-600 text-sm mb-3">
                  {mediaFiles.length} medya • Sıralamak için sürükleyin
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={mediaFiles.map((m) => m.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {mediaFiles.map((media) => (
                        <SortableMediaItem
                          key={media.id}
                          media={media}
                          onDelete={handleDeleteMedia}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 text-sm font-medium">Yükleniyor...</span>
                <span className="text-gray-700 text-sm font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          </div>
        </form>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              disabled={isLoading}
            >
              İptal
            </button>
            <button
              type="submit"
              form="project-form"
              disabled={isLoading}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Kaydet
                </>
              )}
            </button>
          </div>
      </div>
    </div>
  )
}
