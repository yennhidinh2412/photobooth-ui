"use client"

import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Download, RotateCcw, Sun, Filter, Palette } from 'lucide-react'

interface CameraProps {
  onCapture?: (imageDataUrl: string) => void
  onClose?: () => void
}

// Camera filters - moved outside component to prevent re-creation
const filters = {
  normal: 'none',
  sepia: 'sepia(100%)',
  grayscale: 'grayscale(100%)',
  vintage: 'sepia(50%) contrast(1.2) brightness(1.1)',
  vivid: 'contrast(1.3) saturate(1.4)',
  cool: 'hue-rotate(240deg) saturate(1.2)',
  warm: 'hue-rotate(25deg) saturate(1.1)'
}

export default function CameraComponent({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [currentFilter, setCurrentFilter] = useState('normal')
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [error, setError] = useState<string>('')

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera for MacBook
        },
        audio: false
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Wait for video to be loaded
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded:', {
            width: videoRef.current?.videoWidth,
            height: videoRef.current?.videoHeight
          })
        }
      }
      
      setError('')
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera.')
    }
  }, [stream])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    
    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready yet')
      return
    }
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Save current context state
    ctx.save()
    
    // Apply filter
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${filters[currentFilter as keyof typeof filters]}`
    
    // Mirror the image for selfie effect
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    
    // Restore context state
    ctx.restore()
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImages(prev => [...prev, imageDataUrl])
    
    if (onCapture) {
      onCapture(imageDataUrl)
    }

    // Flash effect
    const flashDiv = document.createElement('div')
    flashDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      opacity: 0.8;
      z-index: 9999;
      pointer-events: none;
    `
    document.body.appendChild(flashDiv)
    setTimeout(() => {
      if (document.body.contains(flashDiv)) {
        document.body.removeChild(flashDiv)
      }
    }, 200)
  }, [brightness, contrast, currentFilter, onCapture])

  // Download image
  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `photobooth-${Date.now()}-${index + 1}.jpg`
    link.click()
  }

  // Clear all captured images
  const clearImages = () => {
    setCapturedImages([])
  }

  useEffect(() => {
    startCamera()
    
    return () => {
      console.log('Cleaning up camera...')
      stopCamera()
    }
  }, []) // Remove dependencies to prevent infinite re-renders

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <Button onClick={startCamera} className="mb-4">
          <Camera className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h2 className="text-xl font-bold">MacBook Camera</h2>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Camera View */}
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              transform: 'scaleX(-1)', // Mirror for selfie effect
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${filters[currentFilter as keyof typeof filters]}`
            }}
          />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
            <Button
              size="lg"
              className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-gray-900"
              onClick={capturePhoto}
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>

          {/* Filter Controls */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-4 text-white">
            <div className="space-y-3">
              <div>
                <label htmlFor="filter-select" className="text-sm">Bộ lọc:</label>
                <select 
                  id="filter-select"
                  value={currentFilter} 
                  onChange={(e) => setCurrentFilter(e.target.value)}
                  className="ml-2 bg-gray-700 text-white rounded px-2 py-1 text-sm"
                  aria-label="Chọn bộ lọc camera"
                >
                  <option value="normal">Bình thường</option>
                  <option value="sepia">Sepia</option>
                  <option value="grayscale">Đen trắng</option>
                  <option value="vintage">Cổ điển</option>
                  <option value="vivid">Sống động</option>
                  <option value="cool">Lạnh</option>
                  <option value="warm">Ấm</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="brightness-slider" className="text-sm">Độ sáng:</label>
                <input
                  id="brightness-slider"
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="ml-2 w-20"
                  aria-label="Điều chỉnh độ sáng"
                />
                <span className="ml-1 text-xs">{brightness}%</span>
              </div>
              
              <div>
                <label htmlFor="contrast-slider" className="text-sm">Độ tương phản:</label>
                <input
                  id="contrast-slider"
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="ml-2 w-20"
                  aria-label="Điều chỉnh độ tương phản"
                />
                <span className="ml-1 text-xs">{contrast}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Captured Images Sidebar */}
        {capturedImages.length > 0 && (
          <div className="w-80 bg-gray-800 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Ảnh đã chụp ({capturedImages.length})</h3>
              <Button size="sm" variant="outline" onClick={clearImages}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Xóa tất cả
              </Button>
            </div>
            
            <div className="space-y-3">
              {capturedImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Captured ${index + 1}`}
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadImage(imageUrl, index)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Tải xuống
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
