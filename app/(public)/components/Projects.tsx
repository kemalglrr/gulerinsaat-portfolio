'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProjectWithMedia } from '@/lib/types/database'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'

export default function Projects() {
  const [projects, setProjects] = useState<ProjectWithMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<ProjectWithMedia | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      // Fetch published projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true })

      if (projectsError) throw projectsError

      // Fetch media for each project
      if (projectsData) {
        const projectsWithMedia = await Promise.all(
          projectsData.map(async (project) => {
            const { data: mediaData } = await supabase
              .from('project_media')
              .select('*')
              .eq('project_id', project.id)
              .order('display_order', { ascending: true })

            return {
              ...project,
              media: mediaData || [],
              media_count: mediaData?.length || 0,
              thumbnail: mediaData?.[0]?.public_url || null
            }
          })
        )
        
        setProjects(projectsWithMedia)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="projeler" className="pt-20 pb-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-zinc-200 rounded-lg w-64 mx-auto mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-zinc-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (projects.length === 0) {
    return (
      <section id="projeler" className="pt-20 pb-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-zinc-900 mb-8">
            Projelerimiz
          </h2>
          <p className="text-xl text-zinc-600">
            Projeler yakında eklenecektir.
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section id="projeler" className="relative pt-20 pb-16 px-4 bg-white">
        <div className="container mx-auto">
          {/* Başlık */}
          <div className="text-center mb-16">
            <div className="inline-block mb-10 px-4 py-2 bg-orange-50 border-2 border-black rounded-full">
              <span className="text-gray-700 font-semibold text-sm tracking-wider">PORTFÖYÜMÜZ</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              Projeler
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Başarıyla tamamladığımız ve devam eden inşaat projelerimiz
            </p>
          </div>
          
          {/* Proje Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id}
                project={project} 
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  )
}

