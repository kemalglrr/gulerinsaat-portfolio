import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client (RLS bypass için)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // 1. Projeyi bul ve media'larını al
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*, project_media(*)')
      .eq('id', projectId)
      .single()

    if (fetchError) {
      console.error('Project fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Proje bulunamadı' },
        { status: 404 }
      )
    }

    // 2. Storage'dan dosyaları sil
    if (project.project_media && project.project_media.length > 0) {
      for (const media of project.project_media) {
        if (media.storage_path) {
          const bucketName = media.media_type === 'image' ? 'project-images' : 'project-videos'
          
          const { error: storageError } = await supabaseAdmin.storage
            .from(bucketName)
            .remove([media.storage_path])

          if (storageError) {
            console.error('Storage delete error:', storageError)
          }
        }
      }
    }

    // 3. DB'den projeyi sil (cascade ile media records da silinecek)
    const { error: deleteError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (deleteError) {
      console.error('Project delete error:', deleteError)
      return NextResponse.json(
        { error: 'Proje silinirken bir hata oluştu' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
}


