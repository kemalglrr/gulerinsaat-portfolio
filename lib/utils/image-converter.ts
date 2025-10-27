export interface ConversionResult {
  file: File
  wasConverted: boolean
  originalFormat: string
}

/**
 * Converts HEIC images to JPEG format
 * Returns original file if it's already in a supported format
 */
export async function convertImage(file: File): Promise<ConversionResult> {
  // Dynamic import to avoid SSR issues
  const heic2any = (await import('heic2any')).default
  const isHEIC = file.type === 'image/heic' || 
                 file.name.toLowerCase().endsWith('.heic') ||
                 file.type === 'image/heif' ||
                 file.name.toLowerCase().endsWith('.heif')

  if (!isHEIC) {
    // Already in a supported format
    return {
      file,
      wasConverted: false,
      originalFormat: file.type
    }
  }

  try {
    // Convert HEIC to JPEG
    const blob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    }) as Blob | Blob[]

    // heic2any can return Blob or Blob[], handle both cases
    const resultBlob = Array.isArray(blob) ? blob[0] : blob

    // Create new File object
    const convertedFile = new File(
      [resultBlob],
      file.name.replace(/\.(heic|heif)$/i, '.jpg'),
      { type: 'image/jpeg' }
    )

    return {
      file: convertedFile,
      wasConverted: true,
      originalFormat: 'image/heic'
    }
  } catch (error) {
    console.error('HEIC conversion error:', error)
    throw new Error(`Failed to convert ${file.name}: ${error}`)
  }
}

/**
 * Converts multiple images in parallel
 */
export async function convertImages(files: File[]): Promise<ConversionResult[]> {
  const conversionPromises = files.map(file => convertImage(file))
  return Promise.all(conversionPromises)
}

/**
 * Validates if file is a supported image format (before or after conversion)
 */
export function isValidImageFormat(file: File): boolean {
  const validFormats = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
  
  return validFormats.includes(file.type) || 
         file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/) !== null
}

/**
 * Validates if file is a supported video format
 */
export function isValidVideoFormat(file: File): boolean {
  const validFormats = [
    'video/quicktime',  // MOV
    'video/mp4',
    'video/x-m4v'       // M4V
  ]
  
  return validFormats.includes(file.type) ||
         file.name.toLowerCase().match(/\.(mov|mp4|m4v)$/) !== null
}

