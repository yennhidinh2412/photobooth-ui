import { NextRequest, NextResponse } from 'next/server'
import { networkInterfaces } from 'os'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Get network IP helper function (for local development)
function getNetworkIP(): string {
  try {
    const nets = networkInterfaces()
    
    for (const name of Object.keys(nets)) {
      const netInterface = nets[name]
      if (!netInterface) continue
      
      for (const net of netInterface) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // Prioritize 192.168.x.x addresses
        if (net.family === 'IPv4' && !net.internal) {
          if (net.address.startsWith('192.168.')) {
            return net.address
          }
        }
      }
    }
    
    // Second pass: any non-internal IPv4
    for (const name of Object.keys(nets)) {
      const netInterface = nets[name]
      if (!netInterface) continue
      
      for (const net of netInterface) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address
        }
      }
    }
  } catch (error) {
    console.log('Could not get network IP:', error)
  }
  
  return 'localhost'
}

// Helper to get temp directory path
function getTempDir() {
  // Use /tmp on Vercel (serverless), .temp-photos locally
  return process.env.VERCEL ? '/tmp' : path.join(process.cwd(), '.temp-photos')
}

// Helper to save session to file
async function saveSession(sessionId: string, data: any) {
  try {
    const tempDir = getTempDir()
    
    // Ensure directory exists (locally)
    if (!process.env.VERCEL && !existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }
    
    const filePath = path.join(tempDir, `${sessionId}.json`)
    await writeFile(filePath, JSON.stringify(data))
    console.log(`✅ Session saved to file: ${filePath}`)
  } catch (error) {
    console.error('Error saving session to file:', error)
  }
}

// Helper to load session from file
async function loadSession(sessionId: string) {
  try {
    const tempDir = getTempDir()
    const filePath = path.join(tempDir, `${sessionId}.json`)
    
    if (!existsSync(filePath)) {
      return null
    }
    
    const data = await readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading session from file:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { photos, filter, background } = await request.json()
    
    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Invalid photos data' }, { status: 400 })
    }

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Save session data to file
    const sessionData = {
      photos,
      timestamp: Date.now(),
      filterUsed: filter || 'original',
      backgroundUsed: background || 'none'
    }
    
    await saveSession(sessionId, sessionData)

    console.log(`✅ Session created: ${sessionId} with ${photos.length} photos`)

    // Build base URL
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 
                    (host?.includes('localhost') ? 'http' : 'https')
    
    let baseUrl: string
    
    // Production (Vercel, etc.)
    if (host && !host.includes('localhost')) {
      baseUrl = `${protocol}://${host}`
    } 
    // Local development - use network IP
    else {
      const networkIP = getNetworkIP()
      const port = host?.split(':')[1] || '3000'
      baseUrl = `http://${networkIP}:${port}`
    }
    
    const downloadUrl = `${baseUrl}/download/${sessionId}`
    
    console.log(`🌐 Base URL: ${baseUrl}`)
    console.log(`📱 QR Code URL: ${downloadUrl}`)

    return NextResponse.json({ 
      sessionId,
      downloadUrl
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('id')
  
  console.log(`🔍 GET request for session: ${sessionId}`)
  
  if (!sessionId) {
    console.log('❌ No session ID provided')
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  const session = await loadSession(sessionId)
  
  if (!session) {
    console.log(`❌ Session not found: ${sessionId}`)
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  console.log(`✅ Session found: ${sessionId} with ${session.photos.length} photos`)
  
  // Return photos as base64 (works everywhere, no file system needed)
  return NextResponse.json({
    photos: session.photos,
    filter: session.filterUsed,
    background: session.backgroundUsed,
    photoCount: session.photos.length
  })
}
