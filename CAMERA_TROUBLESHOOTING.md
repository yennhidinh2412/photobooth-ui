# Camera Troubleshooting Guide

## Lỗi thường gặp và cách khắc phục

### 1. "Cannot read properties of undefined (reading 'getUserMedia')"

**Nguyên nhân:**
- Truy cập qua HTTP thay vì HTTPS
- Trình duyệt không hỗ trợ Camera API
- Đang chạy trên server-side rendering

**Giải pháp:**
- ✅ Sử dụng `localhost` hoặc `127.0.0.1` cho development
- ✅ Deploy lên server có HTTPS (Vercel, Netlify...)
- ✅ Sử dụng trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)

### 2. "NotAllowedError" hoặc "PermissionDeniedError"

**Nguyên nhân:**
- User từ chối quyền truy cập camera
- Quyền camera bị chặn trong cài đặt trình duyệt

**Giải pháp:**

**Chrome/Edge:**
1. Click vào icon 🔒 hoặc 🎥 bên trái thanh địa chỉ
2. Chọn "Allow" cho Camera
3. Refresh trang

**Firefox:**
1. Click vào icon 🔒 bên trái thanh địa chỉ
2. Chọn "Permissions" → "Use the Camera"
3. Chọn "Allow"
4. Refresh trang

**Safari (macOS):**
1. Safari → Settings → Websites → Camera
2. Tìm website và chọn "Allow"
3. Refresh trang

**Safari (iOS):**
1. Settings → Safari → Camera
2. Chọn "Allow"
3. Refresh trang

### 3. "NotFoundError" hoặc "DevicesNotFoundError"

**Nguyên nhân:**
- Không có camera nào được kết nối
- Camera bị vô hiệu hóa trong hệ thống

**Giải pháp:**
- Kiểm tra camera có được kết nối không
- Kiểm tra camera có hoạt động trong app khác không (Zoom, Skype...)
- Restart máy tính

**macOS:**
1. System Settings → Privacy & Security → Camera
2. Đảm bảo trình duyệt được cho phép

**Windows:**
1. Settings → Privacy → Camera
2. Bật "Allow apps to access your camera"
3. Bật cho trình duyệt cụ thể

### 4. "NotReadableError" hoặc "TrackStartError"

**Nguyên nhân:**
- Camera đang được sử dụng bởi app khác
- Driver camera có vấn đề

**Giải pháp:**
- Đóng tất cả app đang dùng camera (Zoom, Skype, Teams...)
- Restart trình duyệt
- Restart máy tính
- Cập nhật driver camera

### 5. Camera hiển thị nhưng bị đen/trắng

**Nguyên nhân:**
- Camera chưa được khởi tạo đầy đủ
- Vấn đề với video element

**Giải pháp:**
- Đợi vài giây để camera khởi động
- Refresh trang
- Thử trình duyệt khác

### 6. iOS Safari: "HTTPS-Only" error

**Nguyên nhân:**
- iOS Safari yêu cầu HTTPS cho camera API
- HTTPS-Only mode được bật

**Giải pháp:**

**Tạm thời (Development):**
1. Settings → Safari → Advanced
2. Tắt "HTTPS-Only Mode"
3. Refresh trang

**Lâu dài (Production):**
- Deploy lên server có HTTPS (Vercel, Netlify...)

### 7. Camera bị mirror/lật ngược

**Nguyên nhân:**
- CSS transform đang mirror video

**Giải pháp:**
- Đã được xử lý trong code với `transform: scaleX(-1)` cho horizontal mode
- Overhead mode không mirror

## Kiểm tra Camera hoạt động

### Test nhanh:
1. Mở https://webcamtests.com/
2. Cho phép quyền camera
3. Nếu thấy hình ảnh → Camera hoạt động tốt

### Test trong app:
1. Mở http://localhost:3000 hoặc http://192.168.1.78:3000
2. Chọn chế độ chụp
3. Chọn gói giá
4. Bấm "Tiếp tục" → Màn hình camera sẽ hiện

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 53+ | ✅ Full |
| Firefox | 36+ | ✅ Full |
| Safari | 11+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| iOS Safari | 11+ | ✅ Full (cần HTTPS) |
| Android Chrome | 53+ | ✅ Full |

## Yêu cầu hệ thống

### Minimum:
- CPU: Dual-core 2.0 GHz
- RAM: 4GB
- Camera: 720p (1280x720)
- Browser: Chrome 53+, Firefox 36+, Safari 11+

### Recommended:
- CPU: Quad-core 2.5 GHz+
- RAM: 8GB+
- Camera: 1080p (1920x1080) hoặc Canon R50
- Browser: Latest version
- Connection: Stable WiFi/Ethernet

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề sau khi thử các giải pháp trên:
1. Ghi lại thông báo lỗi chính xác
2. Chụp screenshot console (F12 → Console tab)
3. Ghi rõ:
   - Hệ điều hành và phiên bản
   - Trình duyệt và phiên bản
   - Model camera (nếu biết)
4. Liên hệ support
