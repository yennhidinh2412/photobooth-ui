# 🎥 Fix Video Preview Issue

## Vấn đề
Sau khi quay video xong, màn hình preview bị đen, không hiển thị video vừa quay.

## Nguyên nhân
Khi chuyển sang chế độ preview (`isPreviewing = true`), video element vẫn giữ `srcObject` từ camera stream thay vì load video đã quay từ `src`.

## Giải pháp

### 1. Sửa `mediaRecorder.onstop` callback
Khi recording dừng:
- Clear `srcObject` (camera stream)
- Set `src` thành URL của video đã quay
- Gọi `load()` để load video mới
- Gọi `play()` để phát video

```typescript
mediaRecorder.onstop = () => {
  const blob = new Blob(chunksRef.current, { type: 'video/webm' })
  const url = URL.createObjectURL(blob)
  setRecordedVideoUrl(url)
  setIsPreviewing(true)
  
  // Stop camera stream
  stopCamera()
  
  // Clear srcObject and set src to recorded video
  if (videoRef.current) {
    videoRef.current.srcObject = null  // ← Clear camera stream
    videoRef.current.src = url          // ← Set recorded video
    videoRef.current.load()             // ← Load video
    videoRef.current.play().catch(err => {
      console.log('Playback prevented:', err)
    })
  }
}
```

### 2. Sửa `retake` function
Khi quay lại:
- Clear cả `srcObject` và `src`
- Khởi động lại camera

```typescript
const retake = () => {
  if (recordedVideoUrl) {
    URL.revokeObjectURL(recordedVideoUrl)
  }
  setRecordedVideoUrl('')
  setIsPreviewing(false)
  setRecordingTime(0)
  
  // Clear video element
  if (videoRef.current) {
    videoRef.current.srcObject = null
    videoRef.current.src = ''
  }
  
  startCamera()
}
```

### 3. Cập nhật video element attributes
Thêm `controls` và `loop` khi preview:

```typescript
<video
  ref={videoRef}
  className="w-full h-full object-cover"
  autoPlay
  playsInline
  muted={!isPreviewing}
  controls={isPreviewing}  // ← Show controls when previewing
  loop={isPreviewing}      // ← Loop video when previewing
/>
```

Xóa attribute `src` vì đã set bằng JavaScript:
```typescript
// TRƯỚC (SAI):
src={isPreviewing ? recordedVideoUrl : undefined}

// SAU (ĐÚNG):
// Không có src attribute, set bằng JavaScript
```

## Kết quả
✅ Video preview hiển thị đúng sau khi quay xong
✅ Có controls để play/pause/seek
✅ Video tự động loop
✅ Có thể quay lại và quay video mới

## File đã sửa
- `components/video-capture.tsx`

## Test
1. Chọn Video mode
2. Chọn góc chụp
3. Countdown → Quay video 5 giây
4. **Kiểm tra**: Video preview hiển thị đúng (không còn đen)
5. Bấm "Quay lại" → Camera khởi động lại
6. Bấm "Xác nhận" → Chuyển đến màn hình QR code
