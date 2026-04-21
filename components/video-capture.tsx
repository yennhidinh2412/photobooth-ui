"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Video, StopCircle, RotateCcw, Download, CheckCircle } from 'lucide-react'

interface VideoCaptureProps {
  onVideoCapture: (videoBlob: Blob, videoUrl: string) => void
  maxDuration?: number // seconds
  countdown?: number // seconds
}

interface MediaRecorderOptions {
  mimeType?: string
  audioBitsPerSecond?: number
  videoBitsPerSecond?: number
  bitsPerSecond?: number
}

export default function VideoCapture({ 
  onVideoCapture, 
  maxDuration = 5,
  countdown = 3 
}: VideoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordedBlobRef = useRef<Blob | null>(null)
  
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string>('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [countdownValue, setCountdownValue] = useState<number>(0)
  const [recordingTime, setRecordingTime] = useState<number>(0)
  const [error, setError] = useState<string>('')
  const [videoInfo, setVideoInfo] = useState<{ size: string; duration: string }>({ size: '', duration: '' })

  // Initialize camera
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 0.1
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isRecording, maxDuration])

  // Capture thumbnail from video
  const captureThumbnail = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        setThumbnailUrl(thumbnail)
        console.log('📹 Thumbnail captured')
      }
    }
  }

  // Handle video playback when preview starts - SIMPLIFIED
  useEffect(() => {
    if (isPreviewing && recordedBlobRef.current) {
      // Just capture thumbnail, don't try to play video
      captureThumbnail()
      
      // Calculate video info
      const sizeMB = (recordedBlobRef.current.size / (1024 * 1024)).toFixed(2)
      setVideoInfo({
        size: sizeMB + ' MB',
        duration: maxDuration + 's'
      })
      
      console.log('📹 Preview ready (thumbnail mode)')
    }
  }, [isPreviewing, maxDuration])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
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
      setError('Không thể truy cập camera/microphone')
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
    if (!stream) return

    try {
      chunksRef.current = []
      
      // Check if stream has both audio and video
      const videoTracks = stream.getVideoTracks()
      const audioTracks = stream.getAudioTracks()
      
      console.log('📹 Video tracks:', videoTracks.length)
      console.log('📹 Audio tracks:', audioTracks.length)
      
      if (videoTracks.length === 0) {
        setError('Không có video track')
        return
      }
      
      // Use simple codec that's widely supported
      let mimeType = 'video/webm'
      
      // Try with codecs if supported
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus'
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8'
      }
      
      console.log('📹 Using MIME type:', mimeType)
      
      const options: MediaRecorderOptions = {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000,
      }
      
      // Add audio bitrate if audio is available
      if (audioTracks.length > 0) {
        options.audioBitsPerSecond = 128000
      }
      
      const mediaRecorder = new MediaRecorder(stream, options)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
          console.log('📹 Chunk #' + chunksRef.current.length + ':', event.data.size, 'bytes')
        }
      }

      mediaRecorder.onstop = () => {
        console.log('📹 Recording stopped')
        console.log('📹 Total chunks:', chunksRef.current.length)
        
        if (chunksRef.current.length === 0) {
          console.error('📹 ERROR: No chunks recorded!')
          setError('Không có dữ liệu video')
          return
        }
        
        const totalSize = chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
        console.log('📹 Total size:', totalSize, 'bytes')
        
        // Capture thumbnail BEFORE stopping camera
        captureThumbnail()
        
        // Create blob with the SAME mime type used for recording
        const blob = new Blob(chunksRef.current, { type: mimeType })
        console.log('📹 Blob created:', blob.size, 'bytes, type:', blob.type)
        
        if (blob.size === 0) {
          console.error('📹 ERROR: Blob is empty!')
          setError('Video không có dữ liệu')
          return
        }
        
        // Store blob
        recordedBlobRef.current = blob
        
        // Create blob URL (for download, not for preview)
        const blobUrl = URL.createObjectURL(blob)
        console.log('📹 Blob URL:', blobUrl)
        setRecordedVideoUrl(blobUrl)
        
        // Stop camera AFTER capturing thumbnail
        setTimeout(() => {
          stopCamera()
          setIsPreviewing(true)
          console.log('📹 Preview mode ON (thumbnail only)')
        }, 100)
      }

      mediaRecorder.onerror = (event: Event) => {
        console.error('📹 MediaRecorder error:', event)
        setError('Lỗi khi quay video')
      }

      // Request data every 100ms
      mediaRecorder.start(100)
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)
      
      console.log('📹 Recording STARTED')
      console.log('📹 State:', mediaRecorder.state)
    } catch (err) {
      console.error('📹 Error starting recording:', err)
      setError('Không thể bắt đầu quay: ' + (err as Error).message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const retake = () => {
    // Revoke blob URL to free memory
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl)
    }
    
    setRecordedVideoUrl('')
    setThumbnailUrl('')
    setIsPreviewing(false)
    setRecordingTime(0)
    setVideoInfo({ size: '', duration: '' })
    recordedBlobRef.current = null
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = ''
    }
    
    startCamera()
  }

  const confirmVideo = () => {
    if (recordedBlobRef.current && recordedVideoUrl) {
      // Pass both blob and URL to parent
      onVideoCapture(recordedBlobRef.current, recordedVideoUrl)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={startCamera}>Thử lại</Button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Hidden canvas for thumbnail capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video Preview */}
      <div className="relative w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden">
        {!isPreviewing ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        ) : (
          /* Show thumbnail instead of trying to play video */
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white text-center">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Video đã quay xong</p>
              </div>
            )}
            
            {/* Success overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
              <div className="bg-green-500 rounded-full p-6 mb-4">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Video đã quay xong!</h3>
              <div className="text-white text-lg space-y-1">
                <p>📹 Thời lượng: {videoInfo.duration}</p>
                <p>💾 Dung lượng: {videoInfo.size}</p>
              </div>
            </div>
          </div>
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
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-bold">{recordingTime.toFixed(1)}s / {maxDuration}s</span>
          </div>
        )}
        
        {/* Recording Progress Bar */}
        {isRecording && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
            <div 
              className="h-full bg-red-500 transition-all duration-100"
              style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        {!isPreviewing && !isRecording && (
          <Button
            size="lg"
            onClick={startCountdown}
            className="px-8 py-6 text-lg bg-red-500 hover:bg-red-600"
          >
            <Video className="mr-2 h-6 w-6" />
            Bắt đầu quay ({maxDuration}s)
          </Button>
        )}
        
        {isRecording && (
          <Button
            size="lg"
            onClick={stopRecording}
            className="px-8 py-6 text-lg bg-red-600 hover:bg-red-700"
          >
            <StopCircle className="mr-2 h-6 w-6" />
            Dừng quay
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
              onClick={confirmVideo}
              className="px-8 py-6 text-lg bg-green-500 hover:bg-green-600"
            >
              <Download className="mr-2 h-6 w-6" />
              Xác nhận
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!isRecording && !isPreviewing && (
        <div className="mt-4 text-center text-gray-600">
          <p>📹 Video sẽ tự động dừng sau {maxDuration} giây</p>
          <p>🎤 Microphone sẽ ghi âm cùng video</p>
        </div>
      )}
    </div>
  )
}
