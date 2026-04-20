import { NextRequest, NextResponse } from 'next/server'
import { networkInterfaces } from 'os'

export async function GET(request: NextRequest) {
  try {
    // Get network interfaces
    const nets = networkInterfaces()
    const results: string[] = []

    for (const name of Object.keys(nets)) {
      const netInterface = nets[name]
      if (!netInterface) continue

      for (const net of netInterface) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          results.push(net.address)
        }
      }
    }

    // Return the first valid network IP
    const networkIP = results.length > 0 ? results[0] : 'localhost'
    const port = request.nextUrl.port || '3000'
    const protocol = request.nextUrl.protocol
    
    return NextResponse.json({
      networkIP,
      networkUrl: `${protocol}//${networkIP}:${port}`,
      allIPs: results
    })
  } catch (error) {
    console.error('Error getting network info:', error)
    return NextResponse.json({ 
      networkIP: 'localhost',
      networkUrl: request.nextUrl.origin,
      allIPs: []
    })
  }
}
