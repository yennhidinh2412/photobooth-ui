"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Printer, QrCode, Monitor, Settings, CheckCircle, AlertCircle, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import PhotoCaptureComponent from "@/components/photo-capture"
import GifCapture from "@/components/gif-capture"
import VideoCapture from "@/components/video-capture"
import PrinterControls from "@/components/printer-controls"
import QRCode from 'qrcode'

// Simple hardware interfaces for basic operation
interface HardwareDevice {
  type: 'camera' | 'printer' | 'display'
  name: string
  model: string
  connected: boolean
  capabilities?: Record<string, any>
}

// Lightweight hardware manager - no external dependencies
const createSimpleHardwareManager = () => ({
  async initialize() {
    // Basic hardware simulation
    return [
      { type: 'camera' as const, name: 'Built-in Camera', model: 'Standard', connected: true },
      { type: 'display' as const, name: 'Standard Display', model: 'Screen', connected: true }
    ]
  },
  getHardwareStatus() {
    return {
      camera: { type: 'camera' as const, name: 'Built-in Camera', model: 'Standard', connected: true },
      printer: null,
      display: { type: 'display' as const, name: 'Standard Display', model: 'Screen', connected: true }
    }
  }
})

type Screen =
  | "welcome"
  | "mode"
  | "captureMode"
  | "pricing"
  | "payment"
  | "countdown"
  | "photoCapture"
  | "gifCapture"
  | "videoCapture"
  | "photoSelection"
  | "filterBackground"
  | "printConfirm"
  | "printControl"
  | "finish"

type CaptureMode = "photo" | "gif" | "video"

interface PricingOption {
  cuts: number
  price: number
  layout: string
}

const pricingOptions: PricingOption[] = [
  { cuts: 2, price: 50000, layout: "2 CUT" },
  { cuts: 3, price: 75000, layout: "3 CUT" },
  { cuts: 4, price: 100000, layout: "4 CUT" },
  { cuts: 5, price: 125000, layout: "5 CUT" },
  { cuts: 6, price: 150000, layout: "6 CUT" },
  { cuts: 8, price: 200000, layout: "8 CUT" },
  { cuts: 10, price: 250000, layout: "10 CUT" },
  { cuts: 12, price: 300000, layout: "12 CUT" },
]

const filters = [
  { name: "Nguyên bản", icon: "✨", id: "original", filter: "none" },
  { name: "Tươi sáng", icon: "☀️", id: "bright", filter: "brightness(130%) contrast(110%)" },
  { name: "Cổ điển", icon: "📸", id: "vintage", filter: "sepia(60%) contrast(120%) brightness(110%)" },
  { name: "Đen trắng", icon: "⚫", id: "bw", filter: "grayscale(100%) contrast(110%)" },
  { name: "Ấm áp", icon: "🧡", id: "warm", filter: "sepia(30%) saturate(130%) brightness(110%)" },
  { name: "Lạnh lùng", icon: "❄️", id: "cool", filter: "hue-rotate(180deg) saturate(120%)" },
  { name: "Mơ màng", icon: "💫", id: "dreamy", filter: "blur(0.5px) brightness(115%) saturate(120%)" },
  { name: "Sống động", icon: "🌈", id: "vivid", filter: "saturate(150%) contrast(120%) brightness(105%)" },
]

const backgrounds = [
  { name: "Không nền", gradient: "transparent" },
  { name: "Hồng ngọt", gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
  { name: "Cam ấm", gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { name: "Xanh mát", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { name: "Tím mộng", gradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)" },
  { name: "Xanh dương", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Hồng đậm", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Vàng ấm", gradient: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)" },
  { name: "Xám nhẹ", gradient: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)" },
  { name: "Xanh lá", gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)" },
  { name: "Cam đậm", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { name: "Tím xanh", gradient: "linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)" },
  { name: "Hồng vàng", gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)" },
]

export default function PhotoboothUI() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [selectedMode, setSelectedMode] = useState<"overhead" | "horizontal" | null>(null)
  const [captureMode, setCaptureMode] = useState<CaptureMode>("photo")
  const [selectedPricing, setSelectedPricing] = useState<PricingOption | null>(null)
  const [countdown, setCountdown] = useState(15)
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>("original")
  const [selectedBackground, setSelectedBackground] = useState<number>(1)
  const [timeRemaining, setTimeRemaining] = useState(90)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]) // Lưu ảnh thật đã chụp
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  
  // Hardware integration state
  const [hardwareStatus, setHardwareStatus] = useState<Record<string, HardwareDevice | null>>({
    camera: null,
    printer: null,
    display: null
  })
  const [isHardwareReady, setIsHardwareReady] = useState(false)
  const [hardwareInitialized, setHardwareInitialized] = useState(false)

  // Simple hardware initialization - no external dependencies
  useEffect(() => {
    const initializeHardware = async () => {
      if (hardwareInitialized) return
      
      console.log('🔧 Initializing basic hardware...')
      
      try {
        const simpleManager = createSimpleHardwareManager()
        const devices = await simpleManager.initialize()
        const status = simpleManager.getHardwareStatus()
        
        setHardwareStatus(status)
        setHardwareInitialized(true)
        setIsHardwareReady(true)
        
        console.log('✅ Basic hardware ready:', { devices: devices.length })
      } catch (error) {
        console.error('❌ Hardware initialization failed:', error)
        setHardwareInitialized(true)
        setIsHardwareReady(true) // Don't block the app
      }
    }

    // Add small delay to prevent blocking
    const timeoutId = setTimeout(initializeHardware, 100)
    return () => clearTimeout(timeoutId)
  }, [hardwareInitialized])

  // Countdown timer effect
  useEffect(() => {
    if (currentScreen === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (currentScreen === "countdown" && countdown === 0) {
      // Chuyển đến màn hình tương ứng với chế độ chụp
      if (captureMode === 'photo') {
        setCurrentScreen("photoCapture")
      } else if (captureMode === 'gif') {
        setCurrentScreen("gifCapture")
      } else if (captureMode === 'video') {
        setCurrentScreen("videoCapture")
      }
    }
  }, [currentScreen, countdown, captureMode])

  // Photo selection timer
  useEffect(() => {
    if (currentScreen === "photoSelection" && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    } else if (currentScreen === "photoSelection" && timeRemaining === 0) {
      // Auto-select photos if none selected
      if (selectedPhotos.length === 0 && capturedPhotos.length > 0) {
        const maxPhotos = selectedPricing?.cuts || 4
        // Auto-select up to maxPhotos (or all available if less than maxPhotos)
        const autoSelected = Array.from(
          { length: Math.min(maxPhotos, capturedPhotos.length) }, 
          (_, i) => i
        )
        setSelectedPhotos(autoSelected)
        console.log(`⏰ Auto-selected ${autoSelected.length} photos due to timeout (max: ${maxPhotos})`)
      }
      setCurrentScreen("filterBackground")
    }
  }, [currentScreen, timeRemaining, selectedPhotos.length, capturedPhotos.length, selectedPricing?.cuts])

  // Helper function to determine grid layout based on number of photos
  const getGridLayout = (numPhotos: number) => {
    if (numPhotos <= 4) return { cols: 2, rows: 2, gridClass: "grid-cols-2" }
    if (numPhotos <= 6) return { cols: 3, rows: 2, gridClass: "grid-cols-3" }
    if (numPhotos <= 8) return { cols: 4, rows: 2, gridClass: "grid-cols-4" }
    if (numPhotos <= 12) return { cols: 4, rows: 3, gridClass: "grid-cols-4" }
    return { cols: 4, rows: 4, gridClass: "grid-cols-4" }
  }

  const handlePhotoSelect = (photoIndex: number) => {
    const maxPhotos = selectedPricing?.cuts || 4
    if (selectedPhotos.includes(photoIndex)) {
      setSelectedPhotos(selectedPhotos.filter((p) => p !== photoIndex))
    } else if (selectedPhotos.length < maxPhotos) {
      setSelectedPhotos([...selectedPhotos, photoIndex])
    }
  }

  const generateQRCode = async () => {
    if (capturedPhotos.length === 0) return

    setIsGeneratingQR(true)
    try {
      // Tạo session với ảnh đã chụp
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: capturedPhotos,
          filter: filters.find(f => f.id === selectedFilter)?.name || 'Nguyên bản',
          background: backgrounds[selectedBackground]?.name || 'Không nền',
          captureMode: captureMode // Thêm thông tin loại capture
        })
      })

      if (response.ok) {
        const { downloadUrl } = await response.json()
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#ec4899', // Pink color
            light: '#ffffff'
          }
        })
        
        setQrCodeUrl(qrCodeDataUrl)
      } else {
        console.error('Failed to create session')
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const FlowerDecoration = () => (
    <>
      <div className="absolute top-20 left-20 w-16 h-16 bg-pink-300 rounded-full opacity-60 flower-star" />
      <div className="absolute top-32 right-32 w-12 h-12 bg-teal-300 rounded-full opacity-60 flower-star" />
      <div className="absolute bottom-40 left-16 w-14 h-14 bg-pink-400 rounded-full opacity-60 flower-star" />
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-teal-200 rounded-full opacity-60 flower-star" />
      <div className="absolute top-1/2 left-8 w-10 h-10 bg-pink-200 rounded-full opacity-60 flower-star" />
    </>
  )

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 p-8">
            <div className="text-center space-y-8">
              <div className="relative">
                <div className="bg-pink-200 px-8 py-4 rounded-3xl border-4 border-pink-300">
                  <h1 className="text-6xl font-bold text-gray-800 tracking-wider">PHOTOBOOTH</h1>
                  <p className="text-lg text-gray-600 mt-2">Professional Photo Studio</p>
                </div>
              </div>
              
              {/* Hardware Status - Optimized for 24" display */}
              <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Camera Status */}
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    <Camera className="h-6 w-6 text-pink-500" />
                    <span className="font-semibold text-gray-700">Camera</span>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    {hardwareStatus.camera ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-green-600 text-center">
                          {hardwareStatus.camera.name}
                        </span>
                      </>
                    ) : hardwareInitialized ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-sm text-yellow-600">Tiêu chuẩn</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Đang kiểm tra...</span>
                    )}
                  </div>
                </div>

                {/* Printer Status */}
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    <Printer className="h-6 w-6 text-purple-500" />
                    <span className="font-semibold text-gray-700">Máy in</span>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    {hardwareStatus.printer ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-green-600 text-center">
                          {hardwareStatus.printer.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-sm text-yellow-600">QR Code</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Display Status */}
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    <Monitor className="h-6 w-6 text-blue-500" />
                    <span className="font-semibold text-gray-700">Màn hình</span>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    {hardwareStatus.display ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-green-600 text-center">
                          {hardwareStatus.display.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">Chuẩn</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Enhanced touch button for 24" touchscreen */}
              <div
                className="bg-gradient-to-r from-pink-400 to-purple-400 px-16 py-8 rounded-3xl shadow-xl hover:from-pink-500 hover:to-purple-500 transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
                onClick={() => {
                  console.log('🎯 TOUCH TO START clicked!')
                  setCurrentScreen("captureMode")
                }}
              >
                <h2 className="text-4xl font-bold text-white mb-2">TOUCH TO START</h2>
                <p className="text-xl text-white opacity-90">Chạm để bắt đầu chụp ảnh chuyên nghiệp</p>
              </div>
              
              {/* Hardware status indicator */}
              <div className="text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  isHardwareReady 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isHardwareReady ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Hệ thống sẵn sàng
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      {hardwareInitialized ? 'Hoạt động với hardware cơ bản' : 'Đang khởi tạo hệ thống...'}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        )

      case "captureMode":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-12 p-8">
            <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-12 py-6 rounded-3xl shadow-lg">
              <h2 className="text-4xl font-bold text-white">Chọn chế độ chụp</h2>
              <p className="text-lg text-pink-100 mt-2 text-center">Photo, GIF hoặc Video?</p>
            </div>

            <div className="flex space-x-8 max-w-6xl w-full">
              {/* Photo Mode */}
              <div
                className="bg-white p-8 rounded-3xl shadow-lg cursor-pointer hover:shadow-xl transition-all border-4 border-pink-200 flex-1 transform hover:scale-105"
                onClick={() => {
                  setCaptureMode("photo")
                  setCurrentScreen("mode")
                }}
              >
                <div className="text-center space-y-4">
                  <div className="bg-pink-100 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                    <span className="text-5xl">📸</span>
                  </div>
                  <h3 className="text-2xl font-bold text-pink-400">PHOTO</h3>
                  <p className="text-base text-gray-600">
                    Chụp ảnh tĩnh truyền thống với nhiều lựa chọn filter và nền đẹp
                  </p>
                  <div className="bg-pink-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-pink-600 font-semibold">✨ Phổ biến nhất</p>
                  </div>
                </div>
              </div>

              {/* GIF Mode */}
              <div
                className="bg-white p-8 rounded-3xl shadow-lg cursor-pointer hover:shadow-xl transition-all border-4 border-purple-200 flex-1 transform hover:scale-105"
                onClick={() => {
                  setCaptureMode("gif")
                  setCurrentScreen("mode")
                }}
              >
                <div className="text-center space-y-4">
                  <div className="bg-purple-100 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                    <span className="text-5xl">🎬</span>
                  </div>
                  <h3 className="text-2xl font-bold text-purple-400">GIF</h3>
                  <p className="text-base text-gray-600">
                    Tạo GIF động 3 giây, vui nhộn và sáng tạo
                  </p>
                  <div className="bg-purple-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-purple-600 font-semibold">🔥 Mới & Hot</p>
                  </div>
                </div>
              </div>

              {/* Video Mode */}
              <div
                className="bg-white p-8 rounded-3xl shadow-lg cursor-pointer hover:shadow-xl transition-all border-4 border-red-200 flex-1 transform hover:scale-105"
                onClick={() => {
                  setCaptureMode("video")
                  setCurrentScreen("mode")
                }}
              >
                <div className="text-center space-y-4">
                  <div className="bg-red-100 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                    <span className="text-5xl">🎥</span>
                  </div>
                  <h3 className="text-2xl font-bold text-red-400">VIDEO</h3>
                  <p className="text-base text-gray-600">
                    Quay video 5 giây có âm thanh, lưu khoảnh khắc đáng nhớ
                  </p>
                  <div className="bg-red-50 px-4 py-2 rounded-lg">
                    <p className="text-sm text-red-600 font-semibold">🎤 Có âm thanh</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="px-6 py-3 text-lg bg-transparent"
              onClick={() => setCurrentScreen("welcome")}
            >
              <ArrowLeft className="mr-2" /> Quay lại
            </Button>
          </div>
        )

      case "mode":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-12 p-8">
            <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-12 py-6 rounded-3xl shadow-lg">
              <h2 className="text-4xl font-bold text-white">Hãy lựa chọn chế độ chụp</h2>
              <p className="text-lg text-pink-100 mt-2 text-center">Chọn góc chụp phù hợp với không gian</p>
            </div>

            <div className="flex space-x-16 max-w-6xl w-full">
              <div
                className="bg-white p-8 rounded-3xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow border-4 border-pink-200 flex-1"
                onClick={() => {
                  setSelectedMode("horizontal")
                  // Nếu là Photo thì đến pricing, GIF/Video thì đến countdown
                  if (captureMode === 'photo') {
                    setCurrentScreen("pricing")
                  } else {
                    setCountdown(15)
                    setCurrentScreen("countdown")
                  }
                }}
              >
                <div className="text-center space-y-4">
                  <div className="bg-pink-100 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                    <span className="text-4xl font-bold text-pink-400">1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-pink-400">GÓC CHỤP NGANG</h3>
                  <p className="text-base text-gray-600">
                    Chụp với chế độ chuẩn và góc chụp ngang tầm mắt, giúp ảnh tự nhiên và hài hòa
                  </p>
                </div>
              </div>

              <div
                className="bg-white p-8 rounded-3xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow border-4 border-pink-200 flex-1"
                onClick={() => {
                  setSelectedMode("overhead")
                  // Nếu là Photo thì đến pricing, GIF/Video thì đến countdown
                  if (captureMode === 'photo') {
                    setCurrentScreen("pricing")
                  } else {
                    setCountdown(15)
                    setCurrentScreen("countdown")
                  }
                }}
              >
                <div className="text-center space-y-4">
                  <div className="bg-pink-100 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                    <span className="text-4xl font-bold text-pink-400">2</span>
                  </div>
                  <h3 className="text-2xl font-bold text-pink-400">GÓC OVERHEAD</h3>
                  <p className="text-base text-gray-600">
                    Góc máy chụp từ trên cao nhìn xuống, tạo cảm giác mới lạ, bắt mắt và sáng tạo trong khung hình
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="px-6 py-3 text-lg bg-transparent"
              onClick={() => setCurrentScreen("captureMode")}
            >
              <ArrowLeft className="mr-2" /> Quay lại
            </Button>
          </div>
        )

      case "pricing":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="bg-pink-400 px-8 py-4 rounded-3xl">
              <h2 className="text-3xl font-bold text-white">Bảng giá chụp</h2>
            </div>

            <div className="grid grid-cols-4 gap-4 max-w-6xl">
              {pricingOptions.map((option, index) => (
                <div
                  key={index}
                  className={`bg-white p-4 rounded-2xl shadow-lg cursor-pointer transition-all border-4 ${
                    selectedPricing?.cuts === option.cuts && selectedPricing?.price === option.price
                      ? "border-pink-400 bg-pink-50"
                      : "border-gray-200 hover:border-pink-200"
                  }`}
                  onClick={() => setSelectedPricing(option)}
                >
                  <div className="text-center space-y-3">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="text-base font-bold">{option.layout}</div>
                      <div className="bg-gray-300 h-12 rounded mt-2"></div>
                    </div>
                    <div
                      className={`text-xl font-bold rounded-full px-3 py-1 ${
                        index < 4 ? "bg-pink-400 text-white" : "bg-teal-400 text-white"
                      }`}
                    >
                      {option.cuts}
                    </div>
                    <div className="text-base font-semibold">{option.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-6">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3 text-lg bg-transparent"
                onClick={() => setCurrentScreen("mode")}
              >
                <ArrowLeft className="mr-2" /> Quay lại
              </Button>
              <Button
                size="lg"
                className="px-6 py-3 text-lg bg-pink-400 hover:bg-pink-500"
                onClick={() => setCurrentScreen("payment")}
                disabled={!selectedPricing}
              >
                Tiếp tục <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        )

      case "payment":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="bg-pink-400 px-8 py-4 rounded-3xl">
              <h2 className="text-3xl font-bold text-white">Vui lòng đưa tiền mặt vào máy</h2>
            </div>

            <div className="flex items-center space-x-12">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="w-32 h-48 bg-gradient-to-b from-green-200 to-green-400 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">💵</div>
                    <div className="text-base font-bold">VND</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-xl font-semibold mb-2">Số tiền cần thanh toán</div>
                  <div className="bg-white px-6 py-3 rounded-full text-3xl font-bold border-4 border-gray-300">
                    {selectedPricing?.price.toLocaleString() || "100,000"}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-semibold mb-2">Số tiền đã nạp</div>
                  <div className="bg-pink-400 px-6 py-3 rounded-full text-3xl font-bold text-white">0</div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-lg">Vui lòng nạp tiền mặt theo đúng số tiền yêu cầu.</p>
              <p className="text-lg text-red-500 font-semibold">*Máy không hoàn tiền thừa*</p>
              <p className="text-base text-pink-500">Sau khi thanh toán xong, máy sẽ tiến hành chụp hình luôn</p>
            </div>

            <div className="flex space-x-6">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3 text-lg bg-transparent"
                onClick={() => {
                  setCurrentScreen("pricing")
                  // Reset countdown khi quay lại
                  setCountdown(15)
                }}
              >
                <ArrowLeft className="mr-2" /> Quay lại
              </Button>
              <Button
                size="lg"
                className="px-6 py-3 text-lg bg-pink-400 hover:bg-pink-500"
                onClick={() => {
                  setCountdown(15)
                  setCurrentScreen("countdown")
                }}
              >
                Tiếp tục
              </Button>
            </div>
          </div>
        )

      case "countdown":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="bg-pink-400 px-8 py-4 rounded-3xl">
              <h2 className="text-4xl font-bold text-white">Ready Action!</h2>
              <p className="text-lg text-pink-100 mt-2 text-center">
                {captureMode === 'photo' && `📸 ${selectedMode === 'overhead' ? 'Góc OVERHEAD' : 'Góc NGANG'}`}
                {captureMode === 'gif' && `🎬 GIF Mode - ${selectedMode === 'overhead' ? 'Góc OVERHEAD' : 'Góc NGANG'}`}
                {captureMode === 'video' && `🎥 Video Mode - ${selectedMode === 'overhead' ? 'Góc OVERHEAD' : 'Góc NGANG'}`}
              </p>
            </div>

            <div className="bg-pink-200 w-64 h-64 rounded-full flex items-center justify-center">
              <span className="text-8xl font-bold text-gray-800">{countdown}</span>
            </div>

            <div className="text-center space-y-2">
              {captureMode === 'photo' && (
                <>
                  <h3 className="text-3xl font-bold text-gray-800">
                    Total <span className="text-pink-500">{selectedPricing?.cuts || 8}</span> cut
                  </h3>
                  {selectedMode === 'overhead' && (
                    <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 max-w-md mx-auto">
                      <p className="text-sm text-amber-700">
                        💡 Chuẩn bị: Đứng dưới camera, nhìn lên trên
                      </p>
                    </div>
                  )}
                </>
              )}
              {captureMode === 'gif' && (
                <>
                  <h3 className="text-3xl font-bold text-gray-800">
                    🎬 GIF <span className="text-purple-500">3 giây</span>
                  </h3>
                  <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 max-w-md mx-auto">
                    <p className="text-sm text-purple-700">
                      ✨ Chuẩn bị tạo dáng vui nhộn!
                    </p>
                  </div>
                </>
              )}
              {captureMode === 'video' && (
                <>
                  <h3 className="text-3xl font-bold text-gray-800">
                    🎥 Video <span className="text-red-500">5 giây</span>
                  </h3>
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3 max-w-md mx-auto">
                    <p className="text-sm text-red-700">
                      🎤 Microphone sẽ ghi âm cùng video!
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )

      case "photoCapture":
        return (
          <PhotoCaptureComponent
            totalPhotos={selectedPricing?.cuts || 8}
            selectedMode={selectedMode || "horizontal"}
            onAllPhotosCapture={(photos) => {
              setCapturedPhotos(photos)
              setCurrentScreen("photoSelection")
              setTimeRemaining(90)
            }}
            onBack={() => setCurrentScreen("countdown")}
          />
        )

      case "gifCapture":
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 px-8 py-4 rounded-3xl shadow-lg mb-6">
              <h2 className="text-3xl font-bold text-white">🎬 Tạo GIF vui nhộn</h2>
              <p className="text-lg text-purple-100 mt-2 text-center">
                {selectedMode === 'overhead' ? 'Góc OVERHEAD' : 'Góc NGANG'}
              </p>
            </div>
            
            <GifCapture
              onGifCapture={(gifDataUrl) => {
                setCapturedPhotos([gifDataUrl])
                setCurrentScreen("printControl")
              }}
              duration={3}
              fps={10}
              countdown={3}
            />

            <Button
              variant="outline"
              size="lg"
              className="mt-6 px-6 py-3 text-lg"
              onClick={() => setCurrentScreen("countdown")}
            >
              <ArrowLeft className="mr-2" /> Quay lại
            </Button>
          </div>
        )

      case "videoCapture":
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="bg-gradient-to-r from-red-400 to-pink-400 px-8 py-4 rounded-3xl shadow-lg mb-6">
              <h2 className="text-3xl font-bold text-white">🎥 Quay Video</h2>
              <p className="text-lg text-red-100 mt-2 text-center">
                {selectedMode === 'overhead' ? 'Góc OVERHEAD' : 'Góc NGANG'}
              </p>
            </div>
            
            <VideoCapture
              onVideoCapture={(videoBlob, videoUrl) => {
                // Convert blob to data URL for storage
                const reader = new FileReader()
                reader.onloadend = () => {
                  const videoDataUrl = reader.result as string
                  setCapturedPhotos([videoDataUrl])
                  setCurrentScreen("printControl")
                }
                reader.readAsDataURL(videoBlob)
              }}
              maxDuration={5}
              countdown={3}
            />

            <Button
              variant="outline"
              size="lg"
              className="mt-6 px-6 py-3 text-lg"
              onClick={() => setCurrentScreen("countdown")}
            >
              <ArrowLeft className="mr-2" /> Quay lại
            </Button>
          </div>
        )

      case "photoSelection":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6 px-4">
            <div className="bg-pink-400 px-8 py-4 rounded-3xl relative">
              <h2 className="text-2xl font-bold text-white">
                Chọn {selectedPricing?.cuts || 4} ảnh để in ({selectedPhotos.length}/{selectedPricing?.cuts || 4})
              </h2>
              <div className={`absolute -top-3 -right-3 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold ${
                timeRemaining <= 10 ? 'bg-red-500 animate-pulse' : 'bg-pink-500'
              }`}>
                {timeRemaining}
              </div>
            </div>

            {/* Auto-select warning */}
            {timeRemaining <= 15 && selectedPhotos.length === 0 && (
              <div className="bg-amber-100 border border-amber-400 rounded-lg p-3 max-w-md">
                <p className="text-amber-700 text-center text-sm font-semibold">
                  ⚠️ Sắp hết thời gian! Máy sẽ tự động chọn ảnh cho bạn
                </p>
              </div>
            )}

            <div className="w-full max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                {/* Preview area - Dynamic layout */}
                <div className="bg-white p-6 rounded-2xl shadow-lg mx-auto lg:mx-0">
                  <h3 className="text-lg font-bold text-pink-500 mb-4 text-center">Ảnh sẽ in ({selectedPhotos.length}/{selectedPricing?.cuts || 4})</h3>
                  {(() => {
                    const maxPhotos = selectedPricing?.cuts || 4
                    const layout = getGridLayout(maxPhotos)
                    const containerWidth = layout.cols <= 2 ? "w-72" : layout.cols === 3 ? "w-96" : "w-[28rem]"
                    
                    return (
                      <div className={`grid ${layout.gridClass} gap-3 ${containerWidth} mx-auto`}>
                        {Array.from({ length: maxPhotos }).map((_, index) => (
                          <div key={index} className="relative">
                            {selectedPhotos[index] !== undefined ? (
                              <img
                                src={capturedPhotos.length > 0 ? capturedPhotos[selectedPhotos[index]] : ""}
                                alt={`Selected ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-pink-300"
                              />
                            ) : (
                              <div className="w-full h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <span className="text-gray-400 text-sm">Ảnh {index + 1}</span>
                              </div>
                            )}
                            {selectedPhotos[index] !== undefined && (
                              <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>

                {/* Grid chọn ảnh - Centered và cân đối */}
                <div className="flex flex-col items-center mx-auto lg:mx-0">
                  <h3 className="text-lg font-bold text-pink-500 mb-4 text-center">Chọn từ ảnh đã chụp</h3>
                  <div className={`grid gap-3 mx-auto ${
                    capturedPhotos.length <= 4 ? 'grid-cols-2 max-w-60' :
                    capturedPhotos.length <= 6 ? 'grid-cols-3 max-w-80' :
                    capturedPhotos.length <= 9 ? 'grid-cols-3 max-w-80' :
                    'grid-cols-4 max-w-96'
                  }`}>
                    {capturedPhotos.length > 0 ? capturedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer transition-all rounded-lg overflow-hidden ${
                          selectedPhotos.includes(index)
                            ? "ring-3 ring-pink-400 scale-105"
                            : "hover:ring-2 hover:ring-pink-200 hover:scale-105"
                        }`}
                        onClick={() => handlePhotoSelect(index)}
                      >
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-20 h-20 object-cover"
                        />
                        {selectedPhotos.includes(index) && (
                          <div className="absolute inset-0 bg-pink-400 bg-opacity-40 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">✓</span>
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    )) : Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                        className={`relative cursor-pointer transition-all rounded-lg overflow-hidden ${
                      selectedPhotos.includes(index)
                            ? "ring-3 ring-pink-400 scale-105"
                            : "hover:ring-2 hover:ring-pink-200 hover:scale-105"
                    }`}
                    onClick={() => handlePhotoSelect(index)}
                  >
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DU18JZoHYYU45LiEjtIrZfFIcpY6mU.png"
                      alt={`Photo ${index + 1}`}
                          className="w-20 h-20 object-cover"
                    />
                    {selectedPhotos.includes(index) && (
                          <div className="absolute inset-0 bg-pink-400 bg-opacity-40 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">✓</span>
                      </div>
                    )}
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-base text-gray-600">
                Chọn đúng {selectedPricing?.cuts || 4} ảnh để in hoặc máy sẽ chọn ảnh ngẫu nhiên khi hết giờ
              </p>
              <div className="bg-pink-400 h-2 rounded-full w-60 mx-auto">
                <div
                  className="bg-pink-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(timeRemaining / 90) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Thời gian còn lại: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3 text-lg"
                onClick={() => {
                  // Reset về màn hình chụp ảnh để chụp lại
                  setCapturedPhotos([])
                  setSelectedPhotos([])
                  setCurrentScreen("photoCapture")
                  console.log("🔙 Quay lại chụp ảnh lại")
                }}
              >
                <ArrowLeft className="mr-2" /> Chụp lại
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3 text-lg"
                onClick={() => setSelectedPhotos([])}
                disabled={selectedPhotos.length === 0}
              >
                Bỏ chọn tất cả
              </Button>
            <Button
              size="lg"
                className="px-8 py-3 text-lg bg-pink-500 hover:bg-pink-600 text-white transition-all"
                onClick={() => {
                  const maxPhotos = selectedPricing?.cuts || 4
                  // Auto-select remaining photos if not enough selected
                  if (selectedPhotos.length < maxPhotos && capturedPhotos.length > 0) {
                    const needed = maxPhotos - selectedPhotos.length
                    const available = capturedPhotos.length
                    const unselected = Array.from(
                      { length: available }, 
                      (_, i) => i
                    ).filter(i => !selectedPhotos.includes(i))
                    
                    const toAdd = unselected.slice(0, needed)
                    setSelectedPhotos([...selectedPhotos, ...toAdd])
                    console.log(`🔄 Auto-selected ${toAdd.length} additional photos (max: ${maxPhotos})`)
                  }
                  setCurrentScreen("filterBackground")
                }}
              >
                <ArrowRight className="mr-2" /> 
                {(() => {
                  const maxPhotos = selectedPricing?.cuts || 4
                  return selectedPhotos.length === maxPhotos 
                    ? "Tiếp tục" 
                    : selectedPhotos.length === 0 
                      ? "Tự động chọn ảnh & Tiếp tục"
                      : `Chọn thêm ${maxPhotos - selectedPhotos.length} ảnh & Tiếp tục`
                })()}
            </Button>
            </div>
          </div>
          </div>
        )

      case "filterBackground":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
            <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-8 py-4 rounded-3xl shadow-lg">
              <h2 className="text-2xl font-bold text-white">✨ Trang trí ảnh của bạn</h2>
            </div>

            <div className="w-full max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                {/* Preview area - Dynamic layout */}
                <div className="bg-white p-6 rounded-3xl shadow-xl mx-auto lg:mx-0">
                  <h3 className="text-lg font-bold text-pink-500 mb-4 text-center">🖼️ Preview ({selectedPhotos.length} ảnh)</h3>
                  {(() => {
                    const layout = getGridLayout(selectedPhotos.length)
                    const containerWidth = layout.cols <= 2 ? "w-72" : layout.cols === 3 ? "w-96" : "w-[28rem]"
                    
                    return (
                      <div className={`grid ${layout.gridClass} gap-3 ${containerWidth} mx-auto`}>
                        {selectedPhotos.map((photoIndex, index) => (
                          <div key={index} className="relative rounded-xl overflow-hidden shadow-md h-20">
                            {selectedBackground === 0 ? (
                              /* No background - simple image */
                              <img
                                src={capturedPhotos[photoIndex] || ""}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                style={{
                                  filter: filters.find(f => f.id === selectedFilter)?.filter || 'none'
                                }}
                              />
                            ) : (
                              /* With background frame */
                              <div 
                                className="w-full h-full rounded-xl p-2"
                                style={{
                                  background: backgrounds[selectedBackground]?.gradient || backgrounds[1].gradient
                                }}
                              >
                                {/* Inner container for image */}
                                <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                                  <img
                                    src={capturedPhotos[photoIndex] || ""}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    style={{
                                      filter: filters.find(f => f.id === selectedFilter)?.filter || 'none'
                                    }}
                />
              </div>
                              </div>
                            )}
                            {/* Number badge - positioned inside the frame */}
                            <div className="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md z-10">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                  <div className="mt-4 text-center space-y-1">
                    <div>
                      <span className="text-sm text-gray-500">Filter: </span>
                      <span className="text-sm font-semibold text-pink-600">
                        {filters.find(f => f.id === selectedFilter)?.name || 'Nguyên bản'}
                      </span>
                    </div>
                <div>
                      <span className="text-sm text-gray-500">Nền: </span>
                      <span className="text-sm font-semibold text-purple-600">
                        {backgrounds[selectedBackground]?.name || 'Hồng ngọt'}
                      </span>
                    </div>
                  </div>
                </div>

              {/* Controls area */}
              <div className="flex-1 space-y-6">
                {/* Filter selection */}
                <div className="bg-white p-6 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-bold text-pink-500 mb-4 flex items-center">
                    🎨 Chọn Filter
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {filters.map((filter) => (
                      <div
                        key={filter.id}
                        className={`p-4 rounded-xl cursor-pointer text-center transition-all duration-200 transform hover:scale-105 ${
                          selectedFilter === filter.id
                            ? "bg-gradient-to-br from-pink-400 to-purple-400 text-white shadow-lg scale-105"
                            : "bg-gray-50 border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                        }`}
                        onClick={() => setSelectedFilter(filter.id)}
                      >
                        <div className="text-2xl mb-2">{filter.icon}</div>
                        <div className="text-xs font-semibold">{filter.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Background selection */}
                <div className="bg-white p-6 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-bold text-pink-500 mb-4 flex items-center">
                    🌈 Chọn nền
                  </h3>
                  <div className="grid grid-cols-8 gap-3 max-w-md">
                    {backgrounds.map((bg, index) => (
                      <div
                        key={index}
                        className={`w-12 h-12 rounded-xl cursor-pointer border-3 transition-all duration-200 transform hover:scale-110 relative ${
                          selectedBackground === index
                            ? "border-purple-500 scale-110 shadow-lg ring-2 ring-purple-300"
                            : "border-gray-300 hover:border-purple-300"
                        }`}
                        style={{
                          background: index === 0 ? '#f8f9fa' : bg.gradient 
                        }}
                        onClick={() => setSelectedBackground(index)}
                        title={bg.name}
                      >
                        {index === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl">🚫</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-sm text-gray-500">Nền đã chọn: </span>
                    <span className="text-sm font-semibold text-purple-600">
                      {backgrounds[selectedBackground]?.name || "Hồng ngọt"}
                    </span>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-3 text-lg bg-white border-2 border-pink-300 text-pink-600 hover:bg-pink-50"
                onClick={() => {
                  setTimeRemaining(90) // Reset timer khi quay lại
                  // Giữ lại selectedPhotos để user có thể chỉnh sửa
                  setCurrentScreen("photoSelection")
                  console.log("🔙 Quay lại bước chọn ảnh - Timer reset to 90s")
                }}
              >
                <ArrowLeft className="mr-2" /> Quay lại
              </Button>
            <Button
              size="lg"
                className="px-10 py-4 text-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => {
                  setCurrentScreen("printControl")
                }}
              >
                <Printer className="mr-3" /> In ảnh ngay ✨
            </Button>
            </div>
          </div>
        )

      case "printConfirm":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-8 py-4 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-bold text-white tracking-wider">🎉 HOÀN THÀNH!</h2>
            </div>

            {/* QR Code Section */}
            <div className="text-center space-y-6">
              {isGeneratingQR ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
                  <p className="text-lg text-gray-600">Đang tạo QR code...</p>
                </div>
              ) : qrCodeUrl ? (
                <div className="space-y-4">
                  {/* QR Code */}
                  <div className="bg-white p-6 rounded-2xl shadow-xl inline-block">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto rounded-lg"
                    />
              </div>

                  {/* Simple Instructions */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-pink-500">📱 Quét để tải ảnh</h3>
                    <p className="text-lg text-gray-600">
                      {capturedPhotos.length} ảnh đẹp • Cùng mạng WiFi
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <QrCode className="w-24 h-24 mx-auto text-gray-400" />
                  <p className="text-lg text-gray-600">Lỗi tạo QR code</p>
              </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
            <Button
              variant="outline"
              size="lg"
                className="px-6 py-3 text-lg bg-white border-2 border-pink-300 text-pink-600 hover:bg-pink-50"
                onClick={() => generateQRCode()}
                disabled={isGeneratingQR}
              >
                🔄 Tạo lại QR
              </Button>
              <Button
                size="lg"
                className="px-8 py-4 text-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-xl"
              onClick={() => setCurrentScreen("finish")}
            >
                Hoàn thành ✨
            </Button>
            </div>
          </div>
        )

      case "printControl":
        return (
          <PrinterControls
            photos={selectedPhotos.map(index => capturedPhotos[index])}
            onPrintComplete={() => setCurrentScreen("finish")}
            onQRGenerate={() => {
              generateQRCode()
              setCurrentScreen("printConfirm")
            }}
            onBack={() => setCurrentScreen("filterBackground")}
          />
        )

      case "finish":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-bold text-pink-400 tracking-wider">CẢM ƠN BẠN!</h2>
              <p className="text-2xl text-gray-600">Hẹn gặp lại bạn lần sau</p>

              <Button
                size="lg"
                className="px-8 py-4 text-xl bg-pink-400 hover:bg-pink-500"
                onClick={() => {
                  setCurrentScreen("welcome")
                  setSelectedMode(null)
                  setCaptureMode("photo")
                  setSelectedPricing(null)
                  setSelectedPhotos([])
                  setSelectedFilter("original")
                  setSelectedBackground(1)
                  setCountdown(15)
                  setTimeRemaining(90)
                  setCapturedPhotos([])
                  setQrCodeUrl('')
                  setIsGeneratingQR(false)
                }}
              >
                Bắt đầu lại
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-teal-50 relative overflow-hidden">
      <FlowerDecoration />
      <div className="relative z-10 w-full h-full p-8">{renderScreen()}</div>
    </div>
  )
}
