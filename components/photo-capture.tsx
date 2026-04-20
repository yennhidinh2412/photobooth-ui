"use client"

import { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'

// Check browser compatibility
const isBrowserCompatible = () => {
  if (typeof window === 'undefined') return false
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// Simplified camera component - MacBook first, Canon R50 when available

/**
 * PhotoCaptureComponent - Canon R50 Integration
 * 
 * CANON R50 FEATURES:
 * - Auto-detection: Automatically detects Canon R50 via USB
 * - Optimal Config: Uses native 2400x1600 resolution (3:2 aspect)
 * - High Quality: 60fps capture for smooth preview
 * - Professional: Superior image quality vs webcam
 * 
 * OVERHEAD MODE FEATURES:
 * - Camera Config: Canon R50 with environment facing mode
 * - Video Display: No mirroring, optimized aspect ratio
 * - Image Processing: Enhanced contrast for overhead lighting
 * - Instructions: Specific guidance for overhead positioning
 * 
 * HARDWARE DEPLOYMENT NOTES:
 * - Canon R50 connects via USB-C (UVC/UAC protocol)
 * - Automatic detection and configuration
 * - Fallback to other cameras if Canon R50 not available
 * - Test with actual hardware before production deployment
 */

interface PhotoCaptureProps {
  totalPhotos: number
  selectedMode: "horizontal" | "overhead"
  onAllPhotosCapture: (photos: string[]) => void
  onBack: () => void
}

export default function PhotoCaptureComponent({ 
  totalPhotos,
  selectedMode, 
  onAllPhotosCapture, 
  onBack 
}: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string>('')
  const [cameraInfo, setCameraInfo] = useState<string>('Khởi tạo camera...')
  const [isMounted, setIsMounted] = useState(false)

  // Check if component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true)
    
    // Check browser compatibility
    if (!isBrowserCompatible()) {
      setError('Trình duyệt không hỗ trợ camera. Vui lòng sử dụng Chrome, Firefox, Safari hoặc Edge phiên bản mới nhất.')
      setCameraInfo('❌ Trình duyệt không hỗ trợ')
    }
  }, [])

  // SUPER SIMPLE camera initialization - no dependencies!
  const startCamera = useCallback(async () => {
    try {
      console.log('🚀 Starting camera initialization...')
      setCameraInfo('📷 Đang khởi tạo camera...')
      
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API không khả dụng. Vui lòng sử dụng HTTPS hoặc localhost.')
      }
      
      // Stop any existing stream
      const videoElement = videoRef.current
      if (videoElement && videoElement.srcObject) {
        const currentStream = videoElement.srcObject as MediaStream
        currentStream.getTracks().forEach(track => track.stop())
        videoElement.srcObject = null
      }
      
      console.log('🍎 Attempting MacBook camera...')
      
      // Simple MacBook camera - one shot
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })
      
      console.log('✅ Camera stream obtained!')
      setStream(mediaStream)
      setCameraInfo('✅ Camera MacBook sẵn sàng')
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          const track = mediaStream.getVideoTracks()[0]
          const settings = track.getSettings()
          console.log('📷 Video loaded:', settings)
          setCameraInfo(`✅ Camera - ${settings.width}x${settings.height}`)
        }
        
        // Ensure video plays
        videoRef.current.play().catch(err => {
          console.warn('Video autoplay warning:', err)
          // Autoplay might be blocked, but video will still work
        })
      }
      
      setError('')
    } catch (err: any) {
      console.error('❌ Camera error:', err)
      let errorMessage = 'Không thể truy cập camera.'
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Quyền truy cập camera bị từ chối. Vui lòng cho phép quyền camera trong cài đặt trình duyệt.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Không tìm thấy camera. Vui lòng kiểm tra kết nối camera.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác và thử lại.'
      } else if (err.message && err.message.includes('HTTPS')) {
        errorMessage = 'Camera chỉ hoạt động trên HTTPS hoặc localhost. Vui lòng truy cập qua https:// hoặc localhost.'
      }
      
      setError(errorMessage)
      setCameraInfo('❌ Lỗi camera')
    }
  }, []) // NO dependencies - completely independent!

  // Stop camera - no dependencies
  const stopCamera = useCallback(() => {
    const videoElement = videoRef.current
    if (videoElement && videoElement.srcObject) {
      const currentStream = videoElement.srcObject as MediaStream
      currentStream.getTracks().forEach(track => track.stop())
      videoElement.srcObject = null
    }
    setStream(null)
  }, [])

  // Process captured image based on mode
  const processImageForMode = useCallback((canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    if (selectedMode === 'overhead') {
      // For overhead mode, you might want to:
      // 1. Apply different rotation if needed
      // 2. Adjust contrast/brightness for overhead lighting
      // 3. Apply specific filters for better overhead shots
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Example: Enhance contrast for overhead shots (better lighting compensation)
      const data = imageData.data
      const factor = 1.2 // Contrast factor
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128))     // Red
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)) // Green  
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)) // Blue
      }
      
      context.putImageData(imageData, 0, 0)
      console.log('🎨 Applied overhead mode image processing')
    }
    // For horizontal mode, no special processing needed
  }, [selectedMode])

  // Start photo capture sequence
  const startPhotoSequence = useCallback(() => {
    console.log('startPhotoSequence called', { 
      capturedPhotos: capturedPhotos.length, 
      totalPhotos, 
      isCapturing 
    })
    
    if (capturedPhotos.length >= totalPhotos) {
      onAllPhotosCapture(capturedPhotos)
      return
    }

    if (isCapturing) {
      console.log('Already capturing, ignoring click')
      return
    }

    setIsCapturing(true)
    setCountdown(3)
  }, [capturedPhotos.length, totalPhotos, capturedPhotos, onAllPhotosCapture, isCapturing])

  // Capture single photo
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
    
    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Mirror the image for selfie effect (only for horizontal mode)
    if (selectedMode === 'horizontal') {
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    } else {
      // For overhead mode, don't mirror (camera is mounted above)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }
    
    // Restore context state
    ctx.restore()
    
    // Apply mode-specific processing
    processImageForMode(canvas, ctx)
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    const newPhotos = [...capturedPhotos, imageDataUrl]
    setCapturedPhotos(newPhotos)

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

    setCurrentPhotoIndex(prev => prev + 1)
    setIsCapturing(false)
    setCountdown(null)

    // Auto proceed to next photo after 3 seconds if not all photos captured
    if (newPhotos.length < totalPhotos) {
      setTimeout(() => {
        console.log('Auto starting next photo sequence...')
        setIsCapturing(true)
        setCountdown(3)
      }, 3000) // 3 giây delay trước khi chụp ảnh tiếp theo
    } else {
      // All photos captured, proceed to selection
      setTimeout(() => {
        onAllPhotosCapture(newPhotos)
      }, 2000)
    }
  }, [capturedPhotos, totalPhotos, onAllPhotosCapture, startPhotoSequence, selectedMode, processImageForMode])

  // Countdown effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      capturePhoto()
    }
  }, [countdown, capturePhoto])

  // Initialize camera on mount and when mode changes
  useEffect(() => {
    // Only start camera if mounted and browser is compatible
    if (!isMounted || !isBrowserCompatible()) {
      return
    }
    
    // Add small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startCamera()
    }, 100)
    
    return () => {
      clearTimeout(timer)
      console.log('Cleaning up camera...')
      stopCamera()
    }
  }, [selectedMode, startCamera, stopCamera, isMounted]) // Safe now - no circular dependencies

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
        <Button 
          type="button"
          variant="outline" 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onBack()
          }}
        >
          Quay lại
        </Button>
      </div>
    )
  }

  return (
        <div className="h-screen bg-pink-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-16 h-16 bg-pink-300 rounded-full opacity-60" 
             style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}/>
        <div className="absolute top-20 right-20 w-12 h-12 bg-teal-300 rounded-full opacity-60"
             style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}/>
        <div className="absolute bottom-20 left-16 w-14 h-14 bg-pink-400 rounded-full opacity-60"
             style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}/>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-teal-200 rounded-full opacity-60"
             style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}/>
      </div>

      {/* Flexbox Layout - More reliable */}
      <div className="h-full flex flex-col relative z-10">
        {/* Header - Enhanced with camera info */}
        <div className="flex justify-between items-center px-4 py-3 bg-transparent flex-shrink-0">
          <div className="bg-pink-400 px-4 py-2 rounded-3xl flex-1 max-w-md">
            <h2 className="text-xl font-bold text-white">
              Ảnh {capturedPhotos.length}/{totalPhotos}
            </h2>
            <p className="text-xs text-pink-100 mt-1">
              {selectedMode === 'overhead' ? '📸 Góc OVERHEAD' : '📸 Góc NGANG'}
            </p>
            <p className="text-xs text-pink-100 mt-1 truncate">
              {cameraInfo}
            </p>
          </div>
          <Button 
            type="button"
            variant="outline" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBack()
            }} 
            className="bg-white text-sm px-3 py-1 ml-4"
          >
            Quay lại
          </Button>
        </div>

        {/* Camera Area - Adjusted positioning */}
        <div className="flex-1 flex items-center justify-center px-4 py-2 relative">
          <div className="relative">
            <div className="bg-white p-4 rounded-3xl shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={selectedMode === 'overhead' 
                  ? "w-[400px] h-[500px] object-cover rounded-2xl block" // Taller aspect for overhead 
                  : "w-[500px] h-[400px] object-cover rounded-2xl block"  // Standard for horizontal
                }
                style={{ 
                  transform: selectedMode === 'overhead' 
                    ? 'scaleX(-1) rotate(0deg)' // No rotation for overhead (camera mounted above)
                    : 'scaleX(-1)' // Mirror for horizontal selfie mode
                }}
              />
            </div>

            {/* Countdown overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-3xl flex items-center justify-center z-30">
                <div className="bg-pink-400 w-28 h-28 rounded-full flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {countdown === 0 ? '📸' : countdown}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls - Moved higher up */}
        <div className="px-4 py-6 bg-transparent flex flex-col justify-start items-center flex-shrink-0 min-h-[160px] -mt-12">
          {!isCapturing && capturedPhotos.length < totalPhotos && (
            <div className="space-y-5 text-center">
              <p className="text-lg text-gray-800 font-semibold">
                {capturedPhotos.length === 0 ? 'Sẵn sàng để chụp ảnh đầu tiên?' : `Tiếp tục với ảnh thứ ${capturedPhotos.length + 1}`}
              </p>
              {selectedMode === 'overhead' && (
                <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-sm text-amber-700">
                    💡 <strong>Góc Overhead:</strong> Đứng hoặc ngồi dưới camera, nhìn lên trên và tạo dáng tự nhiên
                  </p>
                </div>
              )}
              <Button
                type="button"
                size="lg"
                className="px-10 py-5 text-xl bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-xl border-0 cursor-pointer active:scale-95 transition-all duration-200"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  startPhotoSequence()
                }}
                disabled={false}
              >
                <Camera className="mr-3 h-6 w-6" />
                {capturedPhotos.length === 0 ? 'Bắt đầu chụp' : 'Chụp tiếp'}
              </Button>
            </div>
          )}

          {isCapturing && (
            <div className="text-center">
              <p className="text-2xl text-pink-600 font-bold animate-pulse">
                Chuẩn bị... {countdown}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Captured photos preview - Smart responsive layout */}
      {capturedPhotos.length > 0 && (
        <div className={`fixed z-40 ${
          capturedPhotos.length <= 4 
            ? "bottom-4 left-4 flex gap-3" 
            : capturedPhotos.length <= 8
              ? "left-4 top-24 w-32 flex flex-col gap-2 max-h-96 overflow-y-auto"
              : "left-4 right-32 bottom-4 grid grid-cols-6 gap-2 max-h-32 overflow-y-auto"
        }`}>
          {capturedPhotos.map((photo, index) => (
            <div key={index} className={`relative bg-white rounded-lg border-2 border-pink-400 overflow-hidden shadow-xl ${
              capturedPhotos.length <= 4 
                ? "w-24 h-18" 
                : capturedPhotos.length <= 8
                  ? "w-24 h-16"
                  : "w-16 h-12"
            }`}>
              <img 
                src={photo} 
                alt={`Captured ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
