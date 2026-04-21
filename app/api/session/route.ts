import { NextRequest, NextResponse } from 'next/server'
import { networkInterfaces } from 'os'

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

// Global in-memory storage (persists within serverless container lifecycle)
// This is a workaround for Vercel serverless - sessions will persist as long as the container is warm
const globalSessions = new Map<string, {
  photos: string[]
  timestamp: number
  filterUsed: string
  backgroundUsed: string
}>()

// Cleanup old sessions (older than 2 hours)
function cleanupOldSessions() {
  const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000)
  let deletedCount = 0
  for (const [sessionId, session] of globalSessions.entries()) {
    if (session.timestamp < twoHoursAgo) {
      globalSessions.delete(sessionId)
      deletedCount++
    }
  }
  if (deletedCount > 0) {
    console.log(`🧹 Cleaned up ${deletedCount} old sessions. Active: ${globalSessions.size}`)
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
    
    // Store in global memory
    globalSessions.set(sessionId, {
      photos,
      timestamp: Date.now(),
      filterUsed: filter || 'original',
      backgroundUsed: background || 'none'
    })
    
    console.log(`✅ Session created: ${sessionId} with ${photos.length} photos. Total: ${globalSessions.size}`)
    
    // Cleanup old sessions
    cleanupOldSessions()

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
    
    // Simple URL without encoded data
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
  
  console.log(`🔍 GET request for session: ${sessionId}. Total sessions: ${globalSessions.size}`)
  
  if (!sessionId) {
    console.log('❌ No session ID provided')
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  const session = globalSessions.get(sessionId)
  
  if (!session) {
    console.log(`❌ Session not found: ${sessionId}`)
    console.log(`📋 Available sessions: ${Array.from(globalSessions.keys()).join(', ')}`)
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  console.log(`✅ Session found: ${sessionId} with ${session.photos.length} photos`)
  
  return NextResponse.json({
    photos: session.photos,
    filter: session.filterUsed,
    background: session.backgroundUsed,
    photoCount: session.photos.length
  })
}
