'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProjectWithMedia } from '@/lib/types/database'
import { toast } from 'sonner'
import { 
  Plus, 
  LogOut, 
  Building2,
  LayoutDashboard,
  FolderOpen
} from 'lucide-react'
import Image from 'next/image'
import ProjectList from './components/ProjectList'
import ProjectFormModal from './components/ProjectFormModal'

export default function AdminDashboard() {
  const [projects, setProjects] = useState<ProjectWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectWithMedia | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchProjects()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_media(*)')
        .order('display_order', { ascending: true })
        .order('display_order', { foreignTable: 'project_media', ascending: true })

      if (error) throw error
      
      // Map project_media to media to match ProjectWithMedia type
      const mappedProjects = (data || []).map((project: any) => {
        const media = project.project_media || []
        const firstImage = media.find((m: any) => m.media_type === 'image')
        
        return {
          ...project,
          media,
          thumbnail: firstImage?.public_url || project.thumbnail || null,
        }
      })
      
      setProjects(mappedProjects)
    } catch (err: any) {
      console.error('Error fetching projects:', err)
      toast.error('Projeler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Çıkış yapıldı')
    router.push('/admin/login')
  }

  const handleAddProject = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const handleEditProject = (project: ProjectWithMedia) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return

    try {
      // API route kullanarak sil (Service Role ile RLS bypass)
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Silme işlemi başarısız')
      }

      toast.success('Proje başarıyla silindi')
      fetchProjects()
    } catch (err: any) {
      console.error('Error deleting project:', err)
      toast.error(err.message || 'Proje silinirken bir hata oluştu')
    }
  }

  const handleReorderProjects = async (reorderedProjects: ProjectWithMedia[]) => {
    try {
      // Update display_order for all projects
      const updates = reorderedProjects.map((project, index) => ({
        id: project.id,
        display_order: index
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('projects')
          .update({ display_order: update.display_order })
          .eq('id', update.id)

        if (error) throw error
      }

      toast.success('Proje sırası güncellendi')
      setProjects(reorderedProjects)
    } catch (err: any) {
      console.error('Error reordering projects:', err)
      toast.error('Sıralama güncellenirken bir hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 bg-white border-b border-gray-200 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Güler Yapı Proje Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GÜLER YAPI PROJE</h1>
                <p className="text-gray-600 text-sm">Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                Siteyi Görüntüle
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-600 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Toplam Proje</p>
                <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Yayınlanan</p>
                <p className="text-3xl font-bold text-gray-900">
                  {projects.filter(p => p.is_published).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Projeler</h2>
          <button
            onClick={handleAddProject}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Yeni Proje Ekle
          </button>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-orange-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Projeler yükleniyor...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz proje eklenmedi</h3>
            <p className="text-gray-600 mb-6">İlk projenizi ekleyerek başlayın</p>
            <button
              onClick={handleAddProject}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Proje Ekle
            </button>
          </div>
        ) : (
          <ProjectList
            projects={projects}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onReorder={handleReorderProjects}
          />
        )}
      </main>

      {/* Project Form Modal */}
      {isModalOpen && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProject(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingProject(null)
            fetchProjects()
          }}
        />
      )}
    </div>
  )
}
