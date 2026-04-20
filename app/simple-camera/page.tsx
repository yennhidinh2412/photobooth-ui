"use client"

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'

export default function SimpleCameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false)
          console.log('Camera ready:', {
            width: videoRef.current?.videoWidth,
            height: videoRef.current?.videoHeight
          })
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera.')
      setIsLoading(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.log('Video or canvas not available')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video dimensions not ready')
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('Cannot get canvas context')
      return
    }

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Save context
    ctx.save()
    
    // Mirror effect for selfie
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    
    // Restore context
    ctx.restore()
    
    try {
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
      setCapturedImages(prev => [...prev, imageDataUrl])
      console.log('Photo captured successfully')
      
      // Flash effect
      const flashDiv = document.createElement('div')
      flashDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        opacity: 0.7;
        z-index: 9999;
        pointer-events: none;
      `
      document.body.appendChild(flashDiv)
      setTimeout(() => {
        if (document.body.contains(flashDiv)) {
          document.body.removeChild(flashDiv)
        }
      }, 150)
    } catch (err) {
      console.error('Error capturing photo:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
        console.log('Camera track stopped')
      })
      setStream(null)
    }
  }

  useEffect(() => {
    startCamera()
    
    return () => {
      stopCamera()
    }
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md text-center">
          <p>{error}</p>
        </div>
        <Button onClick={startCamera} className="mb-4">
          <Camera className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
        <p className="text-sm text-gray-600 text-center">
          Hướng dẫn: Trên macOS, bạn cần cho phép quyền truy cập camera trong System Preferences → Security & Privacy → Camera
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">Camera Test - MacBook Air M3</h1>
        <p className="text-sm text-gray-300">
          {isLoading ? 'Đang khởi động camera...' : 'Camera đã sẵn sàng'}
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Camera view */}
        <div className="flex-1 relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-lg">Đang tải camera...</div>
            </div>
          )}
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              transform: 'scaleX(-1)', // Mirror effect
              display: isLoading ? 'none' : 'block'
            }}
          />
          
          {/* Capture button */}
          {!isLoading && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={capturePhoto}
                size="lg"
                className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-gray-900"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          )}

          {/* Debug info */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
            <div>Stream: {stream ? 'Connected' : 'Disconnected'}</div>
            <div>Video: {videoRef.current?.videoWidth || 0} x {videoRef.current?.videoHeight || 0}</div>
            <div>Captured: {capturedImages.length} photos</div>
          </div>
        </div>

        {/* Captured images */}
        {capturedImages.length > 0 && (
          <div className="w-full lg:w-80 bg-gray-800 p-4">
            <h3 className="text-white font-semibold mb-4">
              Ảnh đã chụp ({capturedImages.length})
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {capturedImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Captured ${index + 1}`}
                    className="w-full rounded-lg border-2 border-gray-600"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setCapturedImages([])}
              variant="outline"
              size="sm"
              className="w-full mt-4"
            >
              Xóa tất cả ảnh
            </Button>
          </div>
        )}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
