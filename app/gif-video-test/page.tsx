"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Film, Video } from 'lucide-react'
import GifCapture from '@/components/gif-capture'
import VideoCapture from '@/components/video-capture'

type Mode = 'select' | 'gif' | 'video'

export default function GifVideoTestPage() {
  const [mode, setMode] = useState<Mode>('select')
  const [capturedGif, setCapturedGif] = useState<string>('')
  const [capturedVideo, setCapturedVideo] = useState<{ blob: Blob; url: string } | null>(null)

  const handleGifCapture = (gifDataUrl: string) => {
    setCapturedGif(gifDataUrl)
    console.log('GIF captured!', gifDataUrl.substring(0, 100))
    alert('GIF đã được tạo thành công!')
  }

  const handleVideoCapture = (videoBlob: Blob, videoUrl: string) => {
    setCapturedVideo({ blob: videoBlob, url: videoUrl })
    console.log('Video captured!', videoBlob.size, 'bytes')
    alert('Video đã được quay thành công!')
  }

  const downloadGif = () => {
    if (!capturedGif) return
    const link = document.createElement('a')
    link.href = capturedGif
    link.download = `photobooth-gif-${Date.now()}.gif`
    link.click()
  }

  const downloadVideo = () => {
    if (!capturedVideo) return
    const link = document.createElement('a')
    link.href = capturedVideo.url
    link.download = `photobooth-video-${Date.now()}.webm`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎬 GIF & Video Photobooth Test
          </h1>
          <p className="text-gray-600">Test tính năng GIF và Video mới</p>
        </div>

        {/* Mode Selection */}
        {mode === 'select' && (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => setMode('gif')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Film className="w-16 h-16 mx-auto mb-4 text-pink-500" />
              <h2 className="text-2xl font-bold mb-2">GIF Mode</h2>
              <p className="text-gray-600">Tạo GIF động 3 giây</p>
              <p className="text-sm text-gray-500 mt-2">Hoàn hảo cho những khoảnh khắc vui nhộn!</p>
            </button>

            <button
              onClick={() => setMode('video')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Video className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold mb-2">Video Mode</h2>
              <p className="text-gray-600">Quay video 5 giây có âm thanh</p>
              <p className="text-sm text-gray-500 mt-2">Ghi lại những khoảnh khắc đáng nhớ!</p>
            </button>
          </div>
        )}

        {/* GIF Capture */}
        {mode === 'gif' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">📸 GIF Capture</h2>
              <Button onClick={() => setMode('select')} variant="outline">
                ← Quay lại
              </Button>
            </div>
            
            <GifCapture 
              onGifCapture={handleGifCapture}
              duration={3}
              fps={10}
              countdown={3}
            />

            {capturedGif && (
              <div className="mt-6 text-center">
                <Button onClick={downloadGif} size="lg" className="bg-pink-500 hover:bg-pink-600">
                  💾 Tải GIF xuống
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Video Capture */}
        {mode === 'video' && (
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🎥 Video Capture</h2>
              <Button onClick={() => setMode('select')} variant="outline">
                ← Quay lại
              </Button>
            </div>
            
            <VideoCapture 
              onVideoCapture={handleVideoCapture}
              maxDuration={5}
              countdown={3}
            />

            {capturedVideo && (
              <div className="mt-6 text-center">
                <Button onClick={downloadVideo} size="lg" className="bg-red-500 hover:bg-red-600">
                  💾 Tải Video xuống
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results Display */}
        {(capturedGif || capturedVideo) && (
          <div className="mt-8 bg-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold mb-4">📦 Kết quả</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {capturedGif && (
                <div>
                  <p className="font-semibold mb-2">GIF đã tạo:</p>
                  <img src={capturedGif} alt="Captured GIF" className="w-full rounded-lg border-2 border-pink-300" />
                  <p className="text-sm text-gray-500 mt-2">
                    Size: {(capturedGif.length * 0.75 / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
              {capturedVideo && (
                <div>
                  <p className="font-semibold mb-2">Video đã quay:</p>
                  <video 
                    src={capturedVideo.url} 
                    controls 
                    className="w-full rounded-lg border-2 border-red-300"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Size: {(capturedVideo.blob.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
