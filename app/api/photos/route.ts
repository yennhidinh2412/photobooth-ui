import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Use file system storage to persist across dev reloads
const STORAGE_DIR = path.join(process.cwd(), '.temp-photos')

// Ensure storage directory exists
const ensureStorageDir = async () => {
  try {
    await fs.access(STORAGE_DIR)
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  }
}

// Cleanup old photos (older than 1 hour)
const cleanupOldPhotos = async () => {
  try {
    await ensureStorageDir()
    const files = await fs.readdir(STORAGE_DIR)
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(STORAGE_DIR, file)
        const stat = await fs.stat(filePath)
        if (stat.mtime.getTime() < oneHourAgo) {
          await fs.unlink(filePath)
          console.log('Cleaned up old file:', file)
        }
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { photos } = await request.json()
    
    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Invalid photos data' }, { status: 400 })
    }

    // Generate unique ID
    const id = `photobooth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Ensure storage directory exists
    await ensureStorageDir()
    
    // Store photos to file system
    const filePath = path.join(STORAGE_DIR, `${id}.json`)
    const data = {
      photos,
      timestamp: Date.now()
    }
    
    await fs.writeFile(filePath, JSON.stringify(data), 'utf8')
    
    // Cleanup old photos
    await cleanupOldPhotos()

    console.log('Photos stored successfully:', { id, photosCount: photos.length, filePath })

    return NextResponse.json({ 
      id,
      downloadUrl: `${request.nextUrl.origin}/download/${id}`
    })
  } catch (error) {
    console.error('Error storing photos:', error)
    return NextResponse.json({ error: 'Failed to store photos' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  
  console.log('GET request for ID:', id)
  
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  try {
    await ensureStorageDir()
    
    const filePath = path.join(STORAGE_DIR, `${id}.json`)
    console.log('Looking for file:', filePath)
    
    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      console.log('File not found:', filePath)
      // List all files to debug
      const files = await fs.readdir(STORAGE_DIR)
      console.log('Available files:', files)
      return NextResponse.json({ error: 'Photos not found' }, { status: 404 })
    }
    
    const fileContent = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(fileContent)
    
    console.log('Photos found:', { id, photosCount: data.photos.length, timestamp: data.timestamp })
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error retrieving photos:', error)
    return NextResponse.json({ error: 'Failed to retrieve photos' }, { status: 500 })
  }
}
