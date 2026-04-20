"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, QrCode, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { DNPPrinterController, PrintJob } from '@/lib/hardware'

interface PrinterControlsProps {
  photos: string[]
  onPrintComplete: () => void
  onQRGenerate: () => void
  onBack: () => void
}

export default function PrinterControls({ 
  photos, 
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
  const [printJobs, setPrintJobs] = useState<string[]>([])
  const [isDetecting, setIsDetecting] = useState(true)
  const [currentMode, setCurrentMode] = useState<'select' | 'printing' | 'qr'>('select')

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

    const jobIds: string[] = []
    
    photos.forEach((photo) => {
      const jobId = printerController.addToPrintQueue(photo, settings)
      jobIds.push(jobId)
    })

    setPrintJobs(jobIds)
    
    // Auto complete after all photos printed (simulation)
    setTimeout(() => {
      onPrintComplete()
    }, photos.length * 15000) // 15 seconds per photo
  }

  // Render selection mode
  const renderSelectionMode = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-8">
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-8 py-4 rounded-3xl shadow-lg">
        <h2 className="text-3xl font-bold text-white">🎉 Hoàn thành chụp ảnh!</h2>
      </div>

      {/* Printer Status */}
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <Printer className="h-6 w-6 text-purple-500" />
          <h3 className="text-lg font-bold text-gray-800">Máy in DNP DS-RX1</h3>
        </div>
        
        <div className="space-y-3">
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
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          size="lg"
          className="w-full py-6 text-xl bg-purple-500 hover:bg-purple-600 text-white rounded-2xl"
          onClick={startPrinting}
          disabled={isDetecting}
        >
          <Printer className="mr-3 h-6 w-6" />
          {printerStatus.connected ? 'In ảnh ngay' : 'In ảnh (Mô phỏng)'}
        </Button>

        <div className="text-center text-gray-500 text-sm my-2">hoặc</div>

        <Button
          size="lg"
          variant="outline"
          className="w-full py-6 text-xl border-2 border-pink-300 text-pink-600 hover:bg-pink-50 rounded-2xl"
          onClick={() => setCurrentMode('qr')}
        >
          <QrCode className="mr-3 h-6 w-6" />
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

  // Render printing mode
  const renderPrintingMode = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-8">
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-8 py-4 rounded-3xl shadow-lg">
        <h2 className="text-3xl font-bold text-white">🖨️ Đang in ảnh...</h2>
      </div>

      {/* Printing Progress */}
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
        <div className="text-center space-y-6">
          <Printer className="h-16 w-16 text-purple-500 mx-auto animate-pulse" />
          
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">DNP DS-RX1</h3>
            <p className="text-gray-600">Đang in {photos.length} tấm ảnh chất lượng cao</p>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-200 rounded-full h-3 w-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all duration-1000 animate-pulse"
                style={{ width: '60%' }}
              />
            </div>
            <p className="text-sm text-gray-500">
              Thời gian ước tính: {photos.length * 15} giây
            </p>
          </div>

          <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
            <p className="text-sm text-amber-700">
              💡 Ảnh sẽ được in trên giấy chuyên dụng 4x6 inch với lớp phủ bảo vệ
            </p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => setCurrentMode('select')}
        className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-xl"
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
      <div className="flex flex-col items-center justify-center h-full space-y-8 p-8">
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-8 py-4 rounded-3xl shadow-lg">
          <h2 className="text-3xl font-bold text-white">📱 Đang tạo QR Code...</h2>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // Main render
  switch (currentMode) {
    case 'printing':
      return renderPrintingMode()
    case 'qr':
      return renderQRMode()
    default:
      return renderSelectionMode()
  }
}

