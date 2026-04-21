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

export async function POST(request: NextRequest) {
  try {
    const { photos, filter, background } = await request.json()
    
    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Invalid photos data' }, { status: 400 })
    }

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
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
    
    // Encode session data in URL (base64)
    const sessionData = {
      photos,
      filter: filter || 'original',
      background: background || 'none',
      photoCount: photos.length
    }
    
    const encodedData = Buffer.from(JSON.stringify(sessionData)).toString('base64url')
    const downloadUrl = `${baseUrl}/download/${sessionId}?data=${encodedData}`
    
    console.log(`🌐 Base URL: ${baseUrl}`)
    console.log(`📱 QR Code URL: ${downloadUrl}`)
    console.log(`📦 Data size: ${encodedData.length} chars`)

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
  const encodedData = request.nextUrl.searchParams.get('data')
  
  console.log(`🔍 GET request for session: ${sessionId}`)
  
  if (!sessionId) {
    console.log('❌ No session ID provided')
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  if (!encodedData) {
    console.log('❌ No session data provided')
    return NextResponse.json({ error: 'Session data not found' }, { status: 404 })
  }

  try {
    // Decode session data from URL
    const sessionData = JSON.parse(Buffer.from(encodedData, 'base64url').toString('utf-8'))
    
    console.log(`✅ Session found: ${sessionId} with ${sessionData.photos.length} photos`)
    
    return NextResponse.json({
      photos: sessionData.photos,
      filter: sessionData.filter,
      background: sessionData.background,
      photoCount: sessionData.photoCount
    })
  } catch (error) {
    console.error('Error decoding session data:', error)
    return NextResponse.json({ error: 'Invalid session data' }, { status: 400 })
  }
}
