const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

/**
 * Photobooth Professional - Main Electron Process
 * 
 * KIOSK MODE FEATURES:
 * - Fullscreen operation
 * - Disable user exit (kiosk mode)
 * - Auto-restart on crash
 * - Hardware optimization
 * - Multi-display support
 */

class PhotoboothApp {
  constructor() {
    this.mainWindow = null
    this.isKioskMode = !isDev // Enable kiosk mode in production
  }

  createWindow() {
    // Get primary display info
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize

    console.log('🖥️ Display detected:', {
      width,
      height,
      scaleFactor: primaryDisplay.scaleFactor,
      isViewSonic: width === 1920 && height === 1080
    })

    // Window configuration optimized for ViewSonic TD2423
    const windowConfig = {
      width: width,
      height: height,
      fullscreen: this.isKioskMode,
      kiosk: this.isKioskMode,
      autoHideMenuBar: true,
      frame: !this.isKioskMode,
      resizable: !this.isKioskMode,
      alwaysOnTop: this.isKioskMode,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: !isDev,
        // Enable hardware acceleration for better camera performance
        experimentalFeatures: true,
        // Enable getUserMedia for camera access
        allowRunningInsecureContent: isDev
      },
      show: false, // Start hidden until ready
      backgroundColor: '#f8fafc', // Tailwind gray-50
      titleBarStyle: this.isKioskMode ? 'hidden' : 'default',
      
      // Touch and hardware optimizations
      minimizable: !this.isKioskMode,
      maximizable: !this.isKioskMode,
      closable: !this.isKioskMode,
      
      // Icon (you can add icons to assets/ folder)
      icon: this.getAppIcon()
    }

    this.mainWindow = new BrowserWindow(windowConfig)

    // Load the photobooth app
    const startUrl = isDev 
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../out/index.html')}`

    this.mainWindow.loadURL(startUrl)

    // Handle window ready
    this.mainWindow.once('ready-to-show', () => {
      console.log('✅ Photobooth window ready')
      this.mainWindow.show()
      
      if (this.isKioskMode) {
        console.log('🔒 Kiosk mode enabled')
        this.enableKioskFeatures()
      }
      
      // Open DevTools in development
      if (isDev) {
        this.mainWindow.webContents.openDevTools()
      }
    })

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    // Prevent new window creation (security)
    this.mainWindow.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' }
    })

    // Handle navigation (prevent external links)
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)
      const currentUrl = new URL(this.mainWindow.webContents.getURL())
      
      if (parsedUrl.origin !== currentUrl.origin) {
        event.preventDefault()
        console.log('🚫 Blocked external navigation:', navigationUrl)
      }
    })

    // Auto-reload on crash (kiosk reliability)
    this.mainWindow.webContents.on('crashed', (event, killed) => {
      console.error('💥 Window crashed, reloading...', { killed })
      setTimeout(() => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.reload()
        }
      }, 1000)
    })

    // Handle unresponsive app
    this.mainWindow.on('unresponsive', () => {
      console.warn('⚠️ Window became unresponsive')
      if (this.isKioskMode) {
        // In kiosk mode, try to recover
        setTimeout(() => {
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.reload()
          }
        }, 5000)
      }
    })

    return this.mainWindow
  }

  enableKioskFeatures() {
    if (!this.mainWindow) return

    // Disable right-click context menu
    this.mainWindow.webContents.on('context-menu', (event) => {
      event.preventDefault()
    })

    // Disable keyboard shortcuts
    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      // Allow only essential keys
      const allowedKeys = ['Tab', 'Enter', 'Escape', 'Backspace', 'Delete']
      const isAllowed = allowedKeys.includes(input.key) || 
                       input.key.length === 1 || // Single characters
                       input.key.startsWith('Digit') || // Numbers
                       input.key.startsWith('Key') // Letters

      // Block dangerous shortcuts
      if (input.control || input.alt || input.meta) {
        if (!isAllowed) {
          event.preventDefault()
          console.log('🚫 Blocked keyboard shortcut:', input.key)
        }
      }
    })

    // Auto-hide cursor after inactivity
    let cursorTimeout
    const hideCursor = () => {
      this.mainWindow.webContents.insertCSS(`
        * { cursor: none !important; }
      `)
    }
    
    const showCursor = () => {
      this.mainWindow.webContents.insertCSS(`
        * { cursor: default !important; }
      `)
      clearTimeout(cursorTimeout)
      cursorTimeout = setTimeout(hideCursor, 5000) // 5 seconds
    }

    // Track mouse movement
    this.mainWindow.webContents.on('dom-ready', () => {
      this.mainWindow.webContents.executeJavaScript(`
        document.addEventListener('mousemove', () => {
          // Cursor management handled by Electron
        });
        document.addEventListener('touchstart', () => {
          // Touch events for kiosk
        });
      `)
    })

    console.log('🔒 Kiosk security features enabled')
  }

  getAppIcon() {
    // Return appropriate icon path for each platform
    if (process.platform === 'win32') {
      return path.join(__dirname, 'assets/icon.ico')
    } else if (process.platform === 'darwin') {
      return path.join(__dirname, 'assets/icon.icns')
    } else {
      return path.join(__dirname, 'assets/icon.png')
    }
  }

  setupIPC() {
    // Hardware status IPC
    ipcMain.handle('get-display-info', () => {
      const displays = screen.getAllDisplays()
      return displays.map(display => ({
        id: display.id,
        bounds: display.bounds,
        workArea: display.workArea,
        scaleFactor: display.scaleFactor,
        rotation: display.rotation,
        touchSupport: display.touchSupport,
        isPrimary: display === screen.getPrimaryDisplay()
      }))
    })

    // Kiosk control IPC
    ipcMain.handle('toggle-kiosk', (event, enable) => {
      if (this.mainWindow) {
        this.mainWindow.setKiosk(enable)
        this.isKioskMode = enable
        if (enable) {
          this.enableKioskFeatures()
        }
        return enable
      }
      return false
    })

    // System info IPC
    ipcMain.handle('get-system-info', () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome
      }
    })

    // Error reporting IPC
    ipcMain.handle('report-error', (event, error) => {
      console.error('🐛 Renderer error:', error)
      // In production, you might want to log this to a file or service
    })

    console.log('📡 IPC handlers registered')
  }

  initialize() {
    // App event handlers
    app.whenReady().then(() => {
      console.log('🚀 Photobooth Professional starting...')
      
      this.setupIPC()
      this.createWindow()

      // macOS specific: recreate window when dock icon clicked
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow()
        }
      })
    })

    // Quit handling
    app.on('window-all-closed', () => {
      // On macOS, keep app running even when all windows closed
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    // Prevent multiple instances
    if (!app.requestSingleInstanceLock()) {
      console.log('🚫 Another instance is already running')
      app.quit()
      return
    }

    app.on('second-instance', () => {
      // Focus the existing window if someone tries to run another instance
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore()
        }
        this.mainWindow.focus()
      }
    })

    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault()
        console.log('🚫 Blocked new window:', navigationUrl)
      })
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📊 Graceful shutdown initiated')
      app.quit()
    })

    console.log('✅ Photobooth app initialized')
  }
}

// Start the photobooth application
const photoboothApp = new PhotoboothApp()
photoboothApp.initialize()

// Export for testing
module.exports = PhotoboothApp

