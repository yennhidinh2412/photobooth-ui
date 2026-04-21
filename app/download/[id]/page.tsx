"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download, Image as ImageIcon, Package, Share2, Eye } from 'lucide-react'

interface SessionData {
  photos: string[]
  filter: string
  background: string
  captureMode: 'photo' | 'gif' | 'video'
  photoCount: number
}

export default function DownloadPage() {
  const params = useParams()
  const sessionId = params.id as string
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/session?id=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      } else if (response.status === 404) {
        setError('Phiên chụp ảnh không tồn tại hoặc đã hết hạn. Có thể máy photobooth đã khởi động lại.')
      } else {
        setError('Lỗi kết nối. Vui lòng thử lại sau.')
      }
    } catch (err) {
      setError('Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // Mobile-friendly download function
  const downloadImage = async (imageUrl: string, index: number) => {
    const captureType = sessionData?.captureMode || 'photo'
    const extension = captureType === 'video' ? 'webm' : captureType === 'gif' ? 'gif' : 'jpg'
    const filename = `photobooth-${sessionId}-${captureType}-${index + 1}.${extension}`
    
    // Try modern approach first (works on most mobile browsers)
    try {
      // Convert data URL to blob
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      // Try Web Share API first (best for mobile)
      if (navigator.share && navigator.canShare) {
        const mimeType = captureType === 'video' ? 'video/webm' : captureType === 'gif' ? 'image/gif' : 'image/jpeg'
        const file = new File([blob], filename, { type: mimeType })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${captureType === 'video' ? 'Video' : captureType === 'gif' ? 'GIF' : 'Ảnh'} Photobooth ${index + 1}`,
            text: `${captureType === 'video' ? 'Video' : captureType === 'gif' ? 'GIF' : 'Ảnh'} từ máy photobooth`
          })
          return
        }
      }
      
      // Fallback: Try download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      
      // iOS Safari needs user interaction
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // Open in new tab for iOS
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
      }
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100)
      
    } catch (error) {
      console.error('Download failed:', error)
      // Ultimate fallback: open in new tab
      window.open(imageUrl, '_blank')
    }
  }
  
  // View image in full screen (alternative for iOS)
  const viewImage = (imageUrl: string, index: number) => {
    window.open(imageUrl, '_blank')
  }
  
  // Share image (mobile-specific)
  const shareImage = async (imageUrl: string, index: number) => {
    try {
      if (navigator.share) {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const captureType = sessionData?.captureMode || 'photo'
        const extension = captureType === 'video' ? 'webm' : captureType === 'gif' ? 'gif' : 'jpg'
        const mimeType = captureType === 'video' ? 'video/webm' : captureType === 'gif' ? 'image/gif' : 'image/jpeg'
        const file = new File([blob], `${captureType}-${index + 1}.${extension}`, { type: mimeType })
        
        await navigator.share({
          files: [file],
          title: `${captureType === 'video' ? 'Video' : captureType === 'gif' ? 'GIF' : 'Ảnh'} Photobooth ${index + 1}`,
          text: `${captureType === 'video' ? 'Video' : captureType === 'gif' ? 'GIF' : 'Ảnh'} từ máy photobooth`
        })
      } else {
        // Fallback: copy to clipboard or open
        viewImage(imageUrl, index)
      }
    } catch (error) {
      console.error('Share failed:', error)
      viewImage(imageUrl, index)
    }
  }

  const downloadAllImages = async () => {
    if (!sessionData) return
    
    // On mobile, ask user to download one by one
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    if (isMobile) {
      alert('💡 Mẹo cho điện thoại: Hãy tải từng ảnh một bằng cách bấm nút "Tải" ở mỗi ảnh. iOS: Bấm và giữ ảnh > "Lưu vào Ảnh"')
      return
    }
    
    // Desktop: download with delay
    for (let i = 0; i < sessionData.photos.length; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, i * 800))
        await downloadImage(sessionData.photos[i], i)
      } catch (error) {
        console.error(`Failed to download image ${i + 1}:`, error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải ảnh...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-lg text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <Button
              onClick={fetchSession}
              className="bg-pink-500 hover:bg-pink-600"
              disabled={loading}
            >
              {loading ? 'Đang tải...' : '🔄 Thử lại'}
            </Button>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>💡 <strong>Mẹo khắc phục:</strong></p>
              <p>• Kiểm tra kết nối WiFi</p>
              <p>• Quét lại QR code từ máy photobooth</p>
              <p>• Chụp ảnh mới nếu máy đã khởi động lại</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-teal-50 p-4">
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

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-8 py-4 rounded-3xl shadow-lg inline-block mb-4">
            <h1 className="text-3xl font-bold text-white">
              {sessionData?.captureMode === 'photo' && '📸 Ảnh Photobooth của bạn'}
              {sessionData?.captureMode === 'gif' && '🎬 GIF Photobooth của bạn'}
              {sessionData?.captureMode === 'video' && '🎥 Video Photobooth của bạn'}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {sessionData?.captureMode === 'photo' && `Tải về ${sessionData?.photoCount} ảnh đẹp của bạn`}
            {sessionData?.captureMode === 'gif' && 'Tải về GIF vui nhộn của bạn'}
            {sessionData?.captureMode === 'video' && 'Tải về video đáng nhớ của bạn'}
          </p>
        </div>

        {/* Photo/GIF/Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {sessionData?.photos.map((photo, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-lg">
              {/* Display based on capture mode */}
              {sessionData.captureMode === 'video' ? (
                <video 
                  src={photo} 
                  controls
                  className="w-full h-40 sm:h-32 object-cover rounded-lg mb-4"
                />
              ) : sessionData.captureMode === 'gif' ? (
                <img 
                  src={photo} 
                  alt={`GIF ${index + 1}`}
                  className="w-full h-40 sm:h-32 object-cover rounded-lg mb-4"
                />
              ) : (
                <img 
                  src={photo} 
                  alt={`Photo ${index + 1}`}
                  className="w-full h-40 sm:h-32 object-cover rounded-lg mb-4"
                />
              )}
              
              {/* Mobile-optimized buttons */}
              <div className="space-y-2">
                {/* Primary download button */}
                <Button
                  onClick={() => downloadImage(photo, index)}
                  className="w-full text-sm bg-pink-500 hover:bg-pink-600 h-10 touch-manipulation"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải {sessionData.captureMode === 'video' ? 'video' : sessionData.captureMode === 'gif' ? 'GIF' : 'ảnh'} {index + 1}
                </Button>
                
                {/* Mobile-specific actions */}
                <div className="flex gap-2 sm:hidden">
                  <Button
                    onClick={() => shareImage(photo, index)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-9 touch-manipulation"
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Chia sẻ
                  </Button>
                  <Button
                    onClick={() => viewImage(photo, index)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-9 touch-manipulation"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Xem
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Download All Button */}
        <div className="text-center mb-8">
          <Button
            onClick={downloadAllImages}
            size="lg"
            className="px-8 py-4 text-lg sm:text-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-xl h-14 touch-manipulation"
          >
            <Package className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
            Tải tất cả {sessionData?.captureMode === 'video' ? 'video' : sessionData?.captureMode === 'gif' ? 'GIF' : 'ảnh'} ({sessionData?.photoCount})
          </Button>
          
          {/* Mobile instructions */}
          <div className="mt-4 sm:hidden">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mx-4">
              <p className="text-sm text-amber-700 font-semibold mb-2">
                📱 Hướng dẫn tải {sessionData?.captureMode === 'video' ? 'video' : sessionData?.captureMode === 'gif' ? 'GIF' : 'ảnh'} trên điện thoại:
              </p>
              <div className="text-xs text-amber-600 space-y-1 text-left">
                <p>• <strong>iPhone/iPad:</strong> Bấm "Xem" → Bấm giữ {sessionData?.captureMode === 'video' ? 'video' : sessionData?.captureMode === 'gif' ? 'GIF' : 'ảnh'} → "Lưu vào {sessionData?.captureMode === 'video' ? 'Video' : 'Ảnh'}"</p>
                <p>• <strong>Android:</strong> Bấm "Tải" hoặc "Chia sẻ" → Chọn app lưu {sessionData?.captureMode === 'video' ? 'video' : sessionData?.captureMode === 'gif' ? 'GIF' : 'ảnh'}</p>
                <p>• <strong>Mẹo:</strong> Dùng nút "Chia sẻ" để gửi qua WhatsApp, Telegram...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
            <p className="text-sm text-gray-500 mb-2">Thông tin phiên chụp:</p>
            <div className="flex gap-4 text-sm">
              <span>
                {sessionData?.captureMode === 'photo' && '📸 Photo'}
                {sessionData?.captureMode === 'gif' && '🎬 GIF'}
                {sessionData?.captureMode === 'video' && '🎥 Video'}
              </span>
              {sessionData?.captureMode === 'photo' && (
                <>
                  <span>🎨 Filter: <strong>{sessionData?.filter}</strong></span>
                  <span>🌈 Nền: <strong>{sessionData?.background}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm space-y-2">
          <p>⏰ Link này sẽ hết hạn sau 2 giờ</p>
          
          {/* Desktop tips */}
          <div className="hidden sm:block">
            <p>💻 <strong>Máy tính:</strong> Click chuột phải {sessionData?.captureMode === 'video' ? 'video' : sessionData?.captureMode === 'gif' ? 'GIF' : 'ảnh'} → "Lưu {sessionData?.captureMode === 'video' ? 'video' : sessionData?.captureMode === 'gif' ? 'GIF' : 'ảnh'} thành..." để tải về</p>
          </div>
          
          {/* Mobile tips */}
          <div className="sm:hidden space-y-1">
            <p>📱 <strong>iOS:</strong> Bấm "Xem" → Bấm giữ {sessionData?.captureMode === 'video' ? 'video' : sessionData?.captureMode === 'gif' ? 'GIF' : 'ảnh'} → "Lưu vào {sessionData?.captureMode === 'video' ? 'Video' : 'Ảnh'}"</p>
            <p>🤖 <strong>Android:</strong> Dùng nút "Tải" hoặc "Chia sẻ"</p>
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-gray-400">
              Gặp vấn đề? Thử quét lại QR code từ máy photobooth
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}