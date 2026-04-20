"use client"

import CameraComponent from '@/components/camera'

export default function CameraTestPage() {
  const handleCapture = (imageDataUrl: string) => {
    console.log('Image captured:', imageDataUrl)
    // Bạn có thể xử lý ảnh đã chụp ở đây
  }

  return (
    <div className="w-full h-screen">
      <CameraComponent 
        onCapture={handleCapture}
        onClose={() => window.history.back()}
      />
    </div>
  )
}
