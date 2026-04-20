/**
 * Hardware Detection and Integration Library
 * Supports Canon R50, ViewSonic TD2423, and DNP DS-RX1
 */

// Browser compatibility fix
if (typeof globalThis === 'undefined') {
  (window as any).globalThis = window
}

export interface HardwareDevice {
  type: 'camera' | 'printer' | 'display'
  name: string
  model: string
  connected: boolean
  capabilities?: Record<string, any>
}

export interface CanonR50Config {
  deviceId?: string
  width: number
  height: number
  aspectRatio: number
  frameRate: number
  facingMode?: string
}

export interface DNPPrinterConfig {
  port?: string
  paperSize: '4x6' | '5x7' | '6x8'
  quality: 'high' | 'standard'
  copies: number
  lamination?: boolean
}

export interface PrintJob {
  id: string
  imageBase64: string
  settings: DNPPrinterConfig
  status: 'pending' | 'printing' | 'completed' | 'failed'
  timestamp: Date
}

/**
 * Canon R50 Camera Detection
 */
export class CanonR50Controller {
  private deviceId: string | null = null
  private capabilities: MediaTrackCapabilities | null = null

  /**
   * Detect Canon R50 camera
   */
  async detectCamera(): Promise<HardwareDevice | null> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      
      // Look for Canon R50 specifically
      const canonR50 = cameras.find(camera => 
        camera.label?.includes('Canon') && 
        (camera.label?.includes('R50') || camera.label?.includes('EOS'))
      )

      if (canonR50) {
        this.deviceId = canonR50.deviceId
        
        // Test camera capabilities
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: canonR50.deviceId }
          })
          
          const track = stream.getVideoTracks()[0]
          this.capabilities = track.getCapabilities()
          
          // Stop test stream
          stream.getTracks().forEach(track => track.stop())
          
          console.log('📷 Canon R50 detected with capabilities:', this.capabilities)
          
          return {
            type: 'camera',
            name: 'Canon EOS R50',
            model: 'R50',
            connected: true,
            capabilities: this.capabilities
          }
        } catch (error) {
          console.warn('Canon R50 detected but not accessible:', error)
        }
      }

      // Fallback: Look for high-quality external cameras
      const externalCamera = cameras.find(camera => 
        camera.label && 
        !camera.label.includes('FaceTime') && 
        !camera.label.includes('Built-in')
      )

      if (externalCamera) {
        this.deviceId = externalCamera.deviceId
        return {
          type: 'camera',
          name: externalCamera.label || 'External Camera',
          model: 'USB Camera',
          connected: true
        }
      }

      return null
    } catch (error) {
      console.error('Error detecting Canon R50:', error)
      return null
    }
  }

  /**
   * Get optimal Canon R50 configuration
   */
  getOptimalConfig(mode: 'horizontal' | 'overhead'): CanonR50Config {
    if (mode === 'overhead') {
      return {
        deviceId: this.deviceId || undefined,
        width: 2400,           // Canon R50 native resolution
        height: 1600,          // 3:2 aspect ratio
        aspectRatio: 3/2,      // Canon native ratio
        frameRate: 60,         // High frame rate
        facingMode: 'environment'
      }
    } else {
      return {
        deviceId: this.deviceId || undefined,
        width: 1920,
        height: 1080,
        aspectRatio: 16/9,
        frameRate: 30,
        facingMode: 'user'
      }
    }
  }

  /**
   * Initialize Canon R50 with optimal settings
   */
  async initializeCamera(mode: 'horizontal' | 'overhead'): Promise<MediaStream> {
    const config = this.getOptimalConfig(mode)
    
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: config.deviceId ? { exact: config.deviceId } : undefined,
        width: { ideal: config.width },
        height: { ideal: config.height },
        aspectRatio: { ideal: config.aspectRatio },
        frameRate: { ideal: config.frameRate },
        facingMode: config.facingMode
      },
      audio: false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log(`📷 Canon R50 initialized for ${mode} mode:`, {
        width: stream.getVideoTracks()[0].getSettings().width,
        height: stream.getVideoTracks()[0].getSettings().height,
        frameRate: stream.getVideoTracks()[0].getSettings().frameRate
      })
      return stream
    } catch (error) {
      console.warn('Canon R50 optimal config failed, trying fallback...', error)
      
      // Fallback configuration
      const fallbackConstraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16/9 },
          frameRate: { ideal: 30 }
        },
        audio: false
      }
      
      return await navigator.mediaDevices.getUserMedia(fallbackConstraints)
    }
  }
}

/**
 * DNP DS-RX1 Printer Controller
 */
export class DNPPrinterController {
  private printQueue: PrintJob[] = []
  private isConnected: boolean = false

  /**
   * Detect DNP DS-RX1 printer
   */
  async detectPrinter(): Promise<HardwareDevice | null> {
    try {
      // Check for USB printer connection
      if ('usb' in navigator) {
        const devices = await (navigator as any).usb.getDevices()
        const dnpPrinter = devices.find((device: any) => 
          device.vendorId === 0x1343 && // DNP vendor ID
          device.productName?.includes('DS-RX1')
        )

        if (dnpPrinter) {
          this.isConnected = true
          return {
            type: 'printer',
            name: 'DNP DS-RX1',
            model: 'DS-RX1',
            connected: true,
            capabilities: {
              paperSizes: ['4x6', '5x7', '6x8'],
              maxCopies: 99,
              lamination: true,
              printSpeed: '15 seconds per photo'
            }
          }
        }
      }

      // Fallback: Check for printer via system
      if ('navigator' in window && 'permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as any })
          // This is a placeholder - actual printer detection would need native integration
          console.log('System printer check - would need native integration')
        } catch (e) {
          console.log('Printer detection requires native integration')
        }
      }

      return null
    } catch (error) {
      console.error('Error detecting DNP printer:', error)
      return null
    }
  }

  /**
   * Add photo to print queue
   */
  addToPrintQueue(imageBase64: string, settings: DNPPrinterConfig): string {
    const jobId = `print_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job: PrintJob = {
      id: jobId,
      imageBase64,
      settings,
      status: 'pending',
      timestamp: new Date()
    }

    this.printQueue.push(job)
    console.log(`🖨️ Added print job ${jobId} to queue`)
    
    // Auto-process queue
    this.processQueue()
    
    return jobId
  }

  /**
   * Process print queue
   */
  private async processQueue(): Promise<void> {
    const pendingJobs = this.printQueue.filter(job => job.status === 'pending')
    
    for (const job of pendingJobs) {
      try {
        job.status = 'printing'
        await this.printPhoto(job)
        job.status = 'completed'
        console.log(`✅ Print job ${job.id} completed`)
      } catch (error) {
        job.status = 'failed'
        console.error(`❌ Print job ${job.id} failed:`, error)
      }
    }
  }

  /**
   * Print single photo (mock implementation)
   */
  private async printPhoto(job: PrintJob): Promise<void> {
    console.log(`🖨️ Printing photo with DNP DS-RX1:`, {
      jobId: job.id,
      paperSize: job.settings.paperSize,
      copies: job.settings.copies,
      quality: job.settings.quality
    })

    // Simulate printing time
    await new Promise(resolve => setTimeout(resolve, 15000)) // 15 seconds

    // In real implementation, this would:
    // 1. Convert base64 to proper image format
    // 2. Send to DNP printer via USB/Network
    // 3. Monitor print status
    // 4. Handle errors (paper jam, no paper, etc.)
  }

  /**
   * Get printer status
   */
  getStatus(): { connected: boolean, queue: number, lastJob?: PrintJob } {
    const lastJob = this.printQueue[this.printQueue.length - 1]
    return {
      connected: this.isConnected,
      queue: this.printQueue.filter(job => job.status === 'pending').length,
      lastJob
    }
  }
}

/**
 * ViewSonic TD2423 Display Controller
 */
export class ViewSonicDisplayController {
  /**
   * Detect ViewSonic TD2423 display
   */
  async detectDisplay(): Promise<HardwareDevice | null> {
    try {
      const screen = window.screen
      
      // Check for 24" display resolution (1920x1080 is typical)
      if (screen.width === 1920 && screen.height === 1080) {
        return {
          type: 'display',
          name: 'ViewSonic TD2423',
          model: 'TD2423',
          connected: true,
          capabilities: {
            width: screen.width,
            height: screen.height,
            touchSupport: 'ontouchstart' in window,
            orientation: screen.orientation?.type
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error detecting ViewSonic display:', error)
      return null
    }
  }

  /**
   * Optimize UI for 24" touchscreen
   */
  getDisplayOptimization(): Record<string, any> {
    return {
      // Larger touch targets for 24" screen
      buttonSize: 'lg',
      fontSize: 'xl',
      spacing: 'wide',
      // Optimize for standing use
      layout: 'vertical-centered',
      // Touch-friendly interactions
      gestureSupport: true
    }
  }

  /**
   * Enable fullscreen kiosk mode
   */
  async enableKioskMode(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        return
      }

      await document.documentElement.requestFullscreen()
      
      // Hide cursor after 3 seconds of inactivity
      let cursorTimeout: NodeJS.Timeout
      
      const hideCursor = () => {
        document.body.style.cursor = 'none'
      }
      
      const showCursor = () => {
        document.body.style.cursor = 'default'
        clearTimeout(cursorTimeout)
        cursorTimeout = setTimeout(hideCursor, 3000)
      }
      
      document.addEventListener('mousemove', showCursor)
      document.addEventListener('touchstart', showCursor)
      
      console.log('🖥️ Kiosk mode enabled for ViewSonic TD2423')
    } catch (error) {
      console.error('Failed to enable kiosk mode:', error)
    }
  }
}

/**
 * Hardware Manager - Centralized hardware control
 */
export class HardwareManager {
  private camera: CanonR50Controller
  private printer: DNPPrinterController
  private display: ViewSonicDisplayController
  private devices: HardwareDevice[] = []

  constructor() {
    this.camera = new CanonR50Controller()
    this.printer = new DNPPrinterController()
    this.display = new ViewSonicDisplayController()
  }

  /**
   * Initialize all hardware
   */
  async initialize(): Promise<HardwareDevice[]> {
    console.log('🔧 Initializing photobooth hardware...')
    
    const [cameraDevice, printerDevice, displayDevice] = await Promise.allSettled([
      this.camera.detectCamera(),
      this.printer.detectPrinter(),
      this.display.detectDisplay()
    ])

    this.devices = []

    if (cameraDevice.status === 'fulfilled' && cameraDevice.value) {
      this.devices.push(cameraDevice.value)
    }

    if (printerDevice.status === 'fulfilled' && printerDevice.value) {
      this.devices.push(printerDevice.value)
    }

    if (displayDevice.status === 'fulfilled' && displayDevice.value) {
      this.devices.push(displayDevice.value)
    }

    console.log('✅ Hardware initialization complete:', this.devices)
    return this.devices
  }

  /**
   * Get hardware status
   */
  getHardwareStatus(): Record<string, HardwareDevice | null> {
    return {
      camera: this.devices.find(d => d.type === 'camera') || null,
      printer: this.devices.find(d => d.type === 'printer') || null,
      display: this.devices.find(d => d.type === 'display') || null
    }
  }

  /**
   * Get camera controller
   */
  getCameraController(): CanonR50Controller {
    return this.camera
  }

  /**
   * Get printer controller
   */
  getPrinterController(): DNPPrinterController {
    return this.printer
  }

  /**
   * Get display controller
   */
  getDisplayController(): ViewSonicDisplayController {
    return this.display
  }

  /**
   * Print photos with DNP DS-RX1
   */
  async printPhotos(photos: string[], settings: Partial<DNPPrinterConfig> = {}): Promise<string[]> {
    const defaultSettings: DNPPrinterConfig = {
      paperSize: '4x6',
      quality: 'high',
      copies: 1,
      lamination: true,
      ...settings
    }

    const jobIds: string[] = []

    for (const photo of photos) {
      const jobId = this.printer.addToPrintQueue(photo, defaultSettings)
      jobIds.push(jobId)
    }

    return jobIds
  }
}

// Export singleton instance
export const hardwareManager = new HardwareManager()
