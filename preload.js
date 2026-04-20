const { contextBridge, ipcRenderer } = require('electron')

/**
 * Preload Script for Photobooth Professional
 * 
 * Provides secure IPC communication between Electron main process
 * and the Next.js renderer process for hardware integration.
 */

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Display and hardware info
  getDisplayInfo: () => ipcRenderer.invoke('get-display-info'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Kiosk mode control
  toggleKiosk: (enable) => ipcRenderer.invoke('toggle-kiosk', enable),
  
  // Error reporting
  reportError: (error) => ipcRenderer.invoke('report-error', error),
  
  // Platform detection
  platform: process.platform,
  
  // Hardware detection helpers
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
  
  // Photobooth specific features
  photobooth: {
    // Check if running in kiosk mode
    isKioskMode: () => {
      return process.env.NODE_ENV !== 'development'
    },
    
    // Get hardware capabilities
    getHardwareCapabilities: async () => {
      const displays = await ipcRenderer.invoke('get-display-info')
      const system = await ipcRenderer.invoke('get-system-info')
      
      return {
        displays,
        system,
        isViewSonic: displays.some(d => 
          d.bounds.width === 1920 && d.bounds.height === 1080
        ),
        supportsTouch: displays.some(d => d.touchSupport),
        multiDisplay: displays.length > 1
      }
    },
    
    // Log messages to main process
    log: (level, message, data = {}) => {
      console[level](`[Photobooth] ${message}`, data)
      if (level === 'error') {
        ipcRenderer.invoke('report-error', { message, data, timestamp: new Date().toISOString() })
      }
    }
  }
})

// Add global error handler for uncaught errors
window.addEventListener('error', (event) => {
  const errorInfo = {
    message: event.error?.message || event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString()
  }
  
  ipcRenderer.invoke('report-error', errorInfo)
})

// Add handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const errorInfo = {
    message: 'Unhandled Promise Rejection',
    reason: event.reason?.toString() || 'Unknown reason',
    stack: event.reason?.stack,
    timestamp: new Date().toISOString()
  }
  
  ipcRenderer.invoke('report-error', errorInfo)
})

console.log('✅ Photobooth preload script loaded')

