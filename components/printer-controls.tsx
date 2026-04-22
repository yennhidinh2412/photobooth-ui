"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, QrCode, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'
import { DNPPrinterController, PrintJob } from '@/lib/hardware'
// @ts-ignore
import gifshot from 'gifshot'

interface PrinterControlsProps {
  photos: string[]
  outputMode?: 'photos' | 'gif'
  selectedFilter?: string
  selectedBackground?: number
  filters?: Array<{ id: string; filter: string; name: string }>
  backgrounds?: Array<{ name: string; gradient: string }>
  onPrintComplete: () => void
  onQRGenerate: (gifUrl?: string) => void
  onBack: () => void
}

export default function PrinterControls({ 
  photos, 
  outputMode = 'photos',
  selectedFilter = 'original',
  selectedBackground = 0,
  filters = [],
  backgrounds = [],
  onPrintComplete, 
  onQRGenerate, 
  onBack 
}: PrinterControlsProps) {
  const [printerController] = useState(() => new DNPPrinterController())
  const [printerStatus, setPrinterStatus] = useState<{
    connected: boolean
    queue: number
    lastJob?: PrintJob
  }>({ connected: false, queue: 0 })
  const [isDetecting, setIsDetecting] = useState(true)
  const [currentMode, setCurrentMode] = useState<'select' | 'printing' | 'qr' | 'creatingGif'>('select')
  const [gifUrl, setGifUrl] = useState<string>('')
  const [isCreatingGif, setIsCreatingGif] = useState(false)

  // Detect printer on mount
  useEffect(() => {
    const detectPrinter = async () => {
      setIsDetecting(true)
      try {
        const printer = await printerController.detectPrinter()
        console.log('🖨️ Printer detection result:', printer)
        
        // Update status
        const status = printerController.getStatus()
        setPrinterStatus(status)
      } catch (error) {
        console.error('Failed to detect printer:', error)
      } finally {
        setIsDetecting(false)
      }
    }

    detectPrinter()
  }, [printerController])

  // Auto-create GIF if outputMode is 'gif'
  useEffect(() => {
    if (outputMode === 'gif' && photos.length > 0 && !gifUrl && !isCreatingGif) {
      createGifFromPhotos()
    }
  }, [outputMode, photos, gifUrl, isCreatingGif])

  // Create GIF from photos
  const createGifFromPhotos = async () => {
    console.log('🎬 Creating GIF from', photos.length, 'photos...')
    setIsCreatingGif(true)
    setCurrentMode('creatingGif')
    
    try {
      // Apply filters and backgrounds to photos
      const processedPhotos = await Promise.all(photos.map(async (photo) => {
        return new Promise<string>((resolve) => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = 640
            canvas.height = 480
            const ctx = canvas.getContext('2d')
            
            if (ctx) {
              // Draw background if selected
              if (selectedBackground > 0 && backgrounds[selectedBackground]) {
                // Simple solid color background
                ctx.fillStyle = '#ff9a9e' // Default pink
                ctx.fillRect(0, 0, canvas.width, canvas.height)
              }
              
              // Draw image with filter
              const filter = filters.find(f => f.id === selectedFilter)
              if (filter && filter.filter !== 'none') {
                ctx.filter = filter.filter
              }
              
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              resolve(canvas.toDataURL('image/jpeg', 0.9))
            } else {
              resolve(photo)
            }
          }
          img.src = photo
        })
      }))
      
      // Create GIF using gifshot
      gifshot.createGIF({
        images: processedPhotos,
        gifWidth: 640,
        gifHeight: 480,
        interval: 0.5, // 0.5 seconds per frame
        numWorkers: 2
      }, (obj: any) => {
        if (!obj.error) {
          console.log('🎬 GIF created successfully!')
          setGifUrl(obj.image)
          setCurrentMode('select')
        } else {
          console.error('🎬 GIF creation error:', obj.error)
        }
        setIsCreatingGif(false)
      })
    } catch (error) {
      console.error('🎬 Error creating GIF:', error)
      setIsCreatingGif(false)
      setCurrentMode('select')
    }
  }

  // Status polling
  useEffect(() => {
    const interval = setInterval(() => {
      const status = printerController.getStatus()
      setPrinterStatus(status)
    }, 2000)

    return () => clearInterval(interval)
  }, [printerController])

  // Start printing all photos
  const startPrinting = () => {
    setCurrentMode('printing')
    
    const settings = {
      paperSize: '4x6' as const,
      quality: 'high' as const,
      copies: 1,
      lamination: true
    }

    photos.forEach((photo) => {
      printerController.addToPrintQueue(photo, settings)
    })
    
    // Auto complete after all photos printed (simulation)
    setTimeout(() => {
      onPrintComplete()
    }, photos.length * 15000) // 15 seconds per photo
  }

  // Render selection mode
  const renderSelectionMode = () => {
    // If GIF mode, show GIF preview
    if (outputMode === 'gif' && gifUrl) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-6 py-3 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-white">🎬 GIF đã tạo xong!</h2>
          </div>

          {/* GIF Preview */}
          <div className="bg-white p-4 rounded-xl shadow-xl w-full max-w-lg">
            <img 
              src={gifUrl} 
              alt="GIF Preview" 
              className="w-full rounded-lg"
            />
            <p className="text-center text-gray-600 mt-3 text-sm">
              ✨ GIF động từ {photos.length} ảnh
            </p>
          </div>

          {/* Action Buttons for GIF */}
          <div className="flex flex-col gap-3 w-full max-w-lg px-4">
            <Button
              size="lg"
              variant="outline"
              className="w-full py-4 text-lg border-2 border-pink-300 text-pink-600 hover:bg-pink-50 rounded-xl"
              onClick={() => {
                // Save GIF to capturedPhotos and generate QR
                onQRGenerate(gifUrl)
              }}
            >
              <QrCode className="mr-2 h-5 w-5" />
              Quét QR Code để lưu GIF
            </Button>

            <Button
              variant="outline"
              onClick={onBack}
              className="w-full py-3 text-gray-600 hover:bg-gray-50 rounded-xl"
            >
              Quay lại chỉnh sửa
            </Button>
          </div>
        </div>
      )
    }
    
    // Default photo mode
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-6 py-3 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-white">🎉 Hoàn thành chụp ảnh!</h2>
        </div>

        {/* Printer Status */}
        <div className="bg-white p-4 rounded-xl shadow-xl w-full max-w-lg">
          <div className="flex items-center gap-2 mb-3">
            <Printer className="h-5 w-5 text-purple-500" />
            <h3 className="text-base font-bold text-gray-800">Máy in DNP DS-RX1</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <div className="flex items-center gap-2">
                {isDetecting ? (
                  <>
                    <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                    <span className="text-sm text-yellow-600">Đang tìm kiếm...</span>
                  </>
                ) : printerStatus.connected ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Đã kết nối</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Chưa kết nối</span>
                  </>
                )}
              </div>
            </div>
          
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hàng đợi:</span>
              <span className="text-sm font-medium">{printerStatus.queue} công việc</span>
            </div>
          
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Số ảnh:</span>
              <span className="text-sm font-medium">{photos.length} tấm</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-lg px-4">
          <Button
            size="lg"
            className="w-full py-4 text-lg bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
            onClick={startPrinting}
            disabled={isDetecting}
          >
            <Printer className="mr-2 h-5 w-5" />
            {printerStatus.connected ? 'In ảnh ngay' : 'In ảnh (Mô phỏng)'}
          </Button>

          <div className="text-center text-gray-500 text-sm">hoặc</div>

          <Button
            size="lg"
            variant="outline"
            className="w-full py-4 text-lg border-2 border-pink-300 text-pink-600 hover:bg-pink-50 rounded-xl"
            onClick={() => setCurrentMode('qr')}
          >
            <QrCode className="mr-2 h-5 w-5" />
            Quét QR Code để lưu ảnh
          </Button>

          <Button
            variant="outline"
            onClick={onBack}
            className="w-full py-3 text-gray-600 hover:bg-gray-50 rounded-xl"
          >
            Quay lại chỉnh sửa
          </Button>
        </div>
      </div>
    )
  }

  // Render printing mode
  const renderPrintingMode = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-6 py-3 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-white">🖨️ Đang in ảnh...</h2>
      </div>

      {/* Printing Progress */}
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
        <div className="text-center space-y-4">
          <Printer className="h-12 w-12 text-purple-500 mx-auto animate-pulse" />
          
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">DNP DS-RX1</h3>
            <p className="text-sm text-gray-600">Đang in {photos.length} tấm ảnh chất lượng cao</p>
          </div>

          <div className="space-y-2">
            <div className="bg-gray-200 rounded-full h-2 w-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all duration-1000 animate-pulse"
                style={{ width: '60%' }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Thời gian ước tính: {photos.length * 15} giây
            </p>
          </div>

          <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              💡 Ảnh sẽ được in trên giấy chuyên dụng 4x6 inch với lớp phủ bảo vệ
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => setCurrentMode('select')}
        className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-xl"
      >
        Hủy in
      </Button>
    </div>
  )

  // Handle QR mode transition
  useEffect(() => {
    if (currentMode === 'qr') {
      onQRGenerate()
    }
  }, [currentMode, onQRGenerate])

  // Render QR mode
  const renderQRMode = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-6 py-3 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-white">📱 Đang tạo QR Code...</h2>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // Main render
  switch (currentMode) {
    case 'printing':
      return renderPrintingMode()
    case 'qr':
      return renderQRMode()
    case 'creatingGif':
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-800">Đang tạo GIF...</h2>
          <p className="text-base text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      )
    default:
      return renderSelectionMode()
  }
}
