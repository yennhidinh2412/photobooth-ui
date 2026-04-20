import { networkInterfaces } from 'os'

/**
 * Get the local network IP address
 * This will find the first non-localhost IPv4 address
 */
export function getNetworkIP(): string {
  const nets = networkInterfaces()
  
  for (const name of Object.keys(nets)) {
    const net = nets[name]
    if (!net) continue
    
    for (const addr of net) {
      // Skip non-IPv4 and internal/localhost addresses
      if (addr.family === 'IPv4' && !addr.internal) {
        // Prioritize private network addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        if (addr.address.startsWith('192.168.') || 
            addr.address.startsWith('10.') ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(addr.address)) {
          return addr.address
        }
      }
    }
  }
  
  // Fallback to localhost if no network IP found
  return 'localhost'
}

/**
 * Get the full base URL for the application
 */
export function getBaseURL(request: Request): string {
  const host = request.headers.get('host')
  
  if (!host) {
    return `http://localhost:3000`
  }
  
  // If it's localhost, try to use network IP instead
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    const networkIP = getNetworkIP()
    const port = host.split(':')[1] || '3000'
    return `http://${networkIP}:${port}`
  }
  
  // For production or other environments
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

