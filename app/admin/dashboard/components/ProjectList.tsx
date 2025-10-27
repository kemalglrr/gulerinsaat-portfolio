'use client'

import { ProjectWithMedia } from '@/lib/types/database'
import { 
  Edit, 
  Trash2, 
  GripVertical, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  Video,
  MapPin
} from 'lucide-react'
import Image from 'next/image'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

interface ProjectListProps {
  projects: ProjectWithMedia[]
  onEdit: (project: ProjectWithMedia) => void
  onDelete: (projectId: string) => void
  onReorder: (projects: ProjectWithMedia[]) => void
}

interface SortableProjectProps {
  project: ProjectWithMedia
  onEdit: (project: ProjectWithMedia) => void
  onDelete: (projectId: string) => void
}

function SortableProject({ project, onEdit, onDelete }: SortableProjectProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const imageCount = project.media?.filter(m => m.media_type === 'image').length || 0
  const videoCount = project.media?.filter(m => m.media_type === 'video').length || 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* Thumbnail */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>

            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
              project.is_published 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-orange-50 text-orange-700 border border-orange-200'
            }`}>
              {project.is_published ? (
                <>
                  <Eye className="w-3 h-3" />
                  Yayında
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3" />
                  Taslak
                </>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {project.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{project.location}</span>
              </div>
            )}
            {imageCount > 0 && (
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                <span>{imageCount} Fotoğraf</span>
              </div>
            )}
            {videoCount > 0 && (
              <div className="flex items-center gap-1">
                <Video className="w-4 h-4" />
                <span>{videoCount} Video</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(project)}
            className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all"
            title="Düzenle"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
            title="Sil"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProjectList({ 
  projects, 
  onEdit, 
  onDelete, 
  onReorder 
}: ProjectListProps) {
  const [localProjects, setLocalProjects] = useState(projects)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localProjects.findIndex((p) => p.id === active.id)
      const newIndex = localProjects.findIndex((p) => p.id === over.id)

      const reordered = arrayMove(localProjects, oldIndex, newIndex)
      setLocalProjects(reordered)
      onReorder(reordered)
    }
  }

  // Update local state when projects prop changes
  if (projects !== localProjects && projects.length !== localProjects.length) {
    setLocalProjects(projects)
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localProjects.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {localProjects.map((project) => (
            <SortableProject
              key={project.id}
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
