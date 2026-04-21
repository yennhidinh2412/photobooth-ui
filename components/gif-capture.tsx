"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Film, StopCircle, RotateCcw, Download, Loader2 } from 'lucide-react'

// @ts-ignore - gifshot doesn't have types
import gifshot from 'gifshot'

interface GifCaptureProps {
  onGifCapture: (gifDataUrl: string) => void
  duration?: number // seconds
  fps?: number // frames per second  
  countdown?: number // seconds
}

export default function GifCapture({ 
  onGifCapture, 
  duration = 3,
  fps = 10,
  countdown = 3 
}: GifCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [gifUrl, setGifUrl] = useState<string>('')
  const [countdownValue, setCountdownValue] = useState<number>(0)
  const [recordingTime, setRecordingTime] = useState<number>(0)
  const [error, setError] = useState<string>('')

  // Initialize camera
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Wait for video to be ready before playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.log('Autoplay prevented:', err)
          })
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Không thể truy cập camera')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const startCountdown = () => {
    setCountdownValue(countdown)
    
    const countdownInterval = setInterval(() => {
      setCountdownValue(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          startRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    
    const frames: string[] = []
    
    // Capture frames from video
    const canvas = document.createElement('canvas')
    canvas.width = 480
    canvas.height = 360
    const ctx = canvas.getContext('2d')
    
    // Capture frame every 100ms (10 FPS)
    const captureInterval = setInterval(() => {
      if (videoRef.current && ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        frames.push(canvas.toDataURL('image/jpeg', 0.8))
        console.log('🎬 Frame captured, total:', frames.length)
      }
    }, 100)
    
    // Update recording time and auto-stop when duration reached
    const recordingInterval = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 0.1
        if (newTime >= duration) {
          clearInterval(recordingInterval)
          clearInterval(captureInterval)
          console.log('🎬 Duration reached, stopping recording with', frames.length, 'frames')
          // Stop recording and create GIF
          setTimeout(() => {
            setIsRecording(false)
            createGifFromFrames(frames)
          }, 100)
          return duration
        }
        return newTime
      })
    }, 100)
  }

  const createGifFromFrames = (frames: string[]) => {
    console.log('🎬 Creating GIF from', frames.length, 'frames...')
    setIsProcessing(true)
    
    try {
      gifshot.createGIF({
        images: frames,
        gifWidth: 480,
        gifHeight: 360,
        frameDuration: 1,
        numWorkers: 2
      }, (obj: any) => {
        console.log('🎬 GIF creation callback:', obj.error ? 'ERROR' : 'SUCCESS')
        if (!obj.error) {
          const gifDataUrl = obj.image
          console.log('🎬 GIF created successfully, size:', gifDataUrl.length, 'bytes')
          setGifUrl(gifDataUrl)
          setIsPreviewing(true)
          stopCamera()
        } else {
          console.error('🎬 GIF creation error:', obj.error)
          setError('Không thể tạo GIF: ' + obj.error)
        }
        setIsProcessing(false)
      })
    } catch (err) {
      console.error('🎬 Error creating GIF:', err)
      setError('Không thể tạo GIF')
      setIsProcessing(false)
    }
  }

  const retake = () => {
    setGifUrl('')
    setIsPreviewing(false)
    setRecordingTime(0)
    startCamera()
  }

  const confirmGif = () => {
    if (gifUrl) {
      onGifCapture(gifUrl)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => { setError(''); startCamera(); }}>Thử lại</Button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Video/GIF Preview */}
      <div className="relative w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden">
        {!isPreviewing ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover transform scale-x-[-1]"
            autoPlay
            playsInline
            muted
          />
        ) : (
          <img
            src={gifUrl}
            alt="GIF Preview"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Countdown Overlay */}
        {countdownValue > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-9xl font-bold text-white animate-pulse">
              {countdownValue}
            </div>
          </div>
        )}
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-bold">
              {recordingTime.toFixed(1)}s / {duration}s
            </span>
          </div>
        )}
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
            <p className="text-white text-lg">Đang tạo GIF...</p>
            <p className="text-white text-sm mt-2">Vui lòng đợi...</p>
          </div>
        )}
        
        {/* Recording Progress Bar */}
        {isRecording && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
            <div 
              className="h-full bg-pink-500 transition-all duration-100"
              style={{ width: `${(recordingTime / duration) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        {!isPreviewing && !isRecording && !isProcessing && (
          <Button
            size="lg"
            onClick={startCountdown}
            className="px-8 py-6 text-lg bg-pink-500 hover:bg-pink-600"
          >
            <Film className="mr-2 h-6 w-6" />
            Tạo GIF ({duration}s)
          </Button>
        )}
        
        {isPreviewing && (
          <>
            <Button
              size="lg"
              onClick={retake}
              variant="outline"
              className="px-6 py-6 text-lg"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Quay lại
            </Button>
            
            <Button
              size="lg"
              onClick={confirmGif}
              className="px-8 py-6 text-lg bg-green-500 hover:bg-green-600"
            >
              <Download className="mr-2 h-6 w-6" />
              Xác nhận GIF
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!isRecording && !isPreviewing && !isProcessing && (
        <div className="mt-4 text-center text-gray-600">
          <p>🎬 GIF sẽ quay {duration} giây</p>
          <p>✨ Tạo những khoảnh khắc vui nhộn!</p>
        </div>
      )}
    </div>
  )
}
