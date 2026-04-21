# 🎬 Tính năng GIF/Video Photobooth

## Tổng quan
Đã tích hợp hoàn chỉnh tính năng GIF và Video vào photobooth chính. Người dùng có thể chọn giữa 3 chế độ:
- 📸 **Photo**: Chụp ảnh tĩnh truyền thống (có filter và nền)
- 🎬 **GIF**: Tạo GIF động 3 giây vui nhộn
- 🎥 **Video**: Quay video 5 giây có âm thanh

## Luồng hoạt động

### 1. Màn hình Welcome
- Người dùng bấm "TOUCH TO START"
- Chuyển đến màn hình chọn chế độ chụp

### 2. Màn hình Capture Mode (MỚI)
Người dùng chọn 1 trong 3 chế độ:

#### 📸 Photo Mode
- Chụp ảnh tĩnh truyền thống
- Có filter (8 loại) và background (13 loại)
- Chọn số lượng ảnh (2-12 cut)
- Có thể in ảnh hoặc tải về QR code

#### 🎬 GIF Mode
- Tạo GIF động 3 giây
- 10 FPS (frames per second)
- Countdown 3 giây trước khi quay
- Không có filter/background (GIF nguyên bản)
- Chỉ tải về qua QR code (không in)

#### 🎥 Video Mode
- Quay video 5 giây
- Có âm thanh (microphone)
- Countdown 3 giây trước khi quay
- Không có filter/background
- Chỉ tải về qua QR code (không in)

### 3. Màn hình Mode Selection
- Chọn góc chụp: Ngang hoặc Overhead
- Áp dụng cho cả 3 chế độ

### 4. Màn hình Pricing (chỉ Photo)
- Chọn số lượng ảnh (2-12 cut)
- GIF/Video bỏ qua bước này

### 5. Màn hình Payment (chỉ Photo)
- Thanh toán tiền mặt
- GIF/Video bỏ qua bước này

### 6. Màn hình Countdown
- Hiển thị thông tin chế độ đã chọn
- Photo: "Total X cut"
- GIF: "GIF 3 giây"
- Video: "Video 5 giây"

### 7. Màn hình Capture
- **Photo**: Component PhotoCapture (chụp nhiều ảnh)
- **GIF**: Component GifCapture (tạo GIF 3s)
- **Video**: Component VideoCapture (quay video 5s)

### 8. Màn hình Photo Selection (chỉ Photo)
- Chọn ảnh để in
- GIF/Video bỏ qua bước này

### 9. Màn hình Filter/Background (chỉ Photo)
- Chọn filter và background
- GIF/Video bỏ qua bước này

### 10. Màn hình Print Control
- Photo: Có thể in hoặc tạo QR code
- GIF/Video: Chỉ tạo QR code

### 11. Màn hình Download (Mobile)
- Hiển thị đúng loại media (Photo/GIF/Video)
- Video: Hiển thị video player với controls
- GIF: Hiển thị GIF animation
- Photo: Hiển thị ảnh tĩnh
- Hỗ trợ tải về và chia sẻ trên mobile

## Thay đổi kỹ thuật

### 1. File `photobooth.tsx`
- Thêm type `CaptureMode = "photo" | "gif" | "video"`
- Thêm state `captureMode`
- Thêm màn hình `captureMode` để chọn Photo/GIF/Video
- Thêm màn hình `gifCapture` và `videoCapture`
- Cập nhật logic countdown để chuyển đến đúng màn hình
- Cập nhật `generateQRCode()` để gửi `captureMode`

### 2. File `app/api/session/route.ts`
- Thêm field `captureMode` vào session storage
- Cập nhật type definition
- Log thông tin captureMode

### 3. File `app/download/[id]/page.tsx`
- Thêm field `captureMode` vào `SessionData` interface
- Hiển thị video player cho video
- Hiển thị GIF animation cho GIF
- Cập nhật download function để xử lý đúng file type
- Cập nhật share function với đúng MIME type
- Cập nhật UI text dựa trên captureMode

### 4. Components đã sử dụng
- `components/gif-capture.tsx`: Tạo GIF từ video stream
- `components/video-capture.tsx`: Quay video với MediaRecorder API

## Test trên Local

### 1. Chạy server
```bash
npm run dev
```

### 2. Test Photo Mode
1. Mở http://localhost:3000
2. Bấm "TOUCH TO START"
3. Chọn "PHOTO"
4. Chọn góc chụp
5. Chọn số lượng ảnh
6. Thanh toán
7. Chụp ảnh
8. Chọn ảnh, filter, background
9. Tạo QR code và test tải về

### 3. Test GIF Mode
1. Mở http://localhost:3000
2. Bấm "TOUCH TO START"
3. Chọn "GIF"
4. Chọn góc chụp
5. Countdown 3s
6. Tạo GIF (3 giây)
7. Xác nhận GIF
8. Tạo QR code
9. Quét QR bằng điện thoại
10. Kiểm tra GIF hiển thị và tải về

### 4. Test Video Mode
1. Mở http://localhost:3000
2. Bấm "TOUCH TO START"
3. Chọn "VIDEO"
4. Chọn góc chụp
5. Countdown 3s
6. Quay video (5 giây, có âm thanh)
7. Xác nhận video
8. Tạo QR code
9. Quét QR bằng điện thoại
10. Kiểm tra video player và tải về

## Lưu ý quan trọng

### 1. GIF/Video không có Filter/Background
- GIF và Video không hỗ trợ filter/background
- Chỉ Photo mode mới có tính năng này
- Lý do: GIF/Video đã có animation, không cần thêm hiệu ứng

### 2. GIF/Video không in được
- Chỉ có thể tải về qua QR code
- Máy in chỉ hỗ trợ ảnh tĩnh
- Người dùng có thể tải về điện thoại và in sau

### 3. Kích thước file
- Photo: ~100-500 KB/ảnh
- GIF: ~500KB-2MB (3 giây, 10 FPS)
- Video: ~500KB-3MB (5 giây, WebM format)

### 4. Tương thích trình duyệt
- GIF: Hỗ trợ tất cả trình duyệt hiện đại
- Video: WebM format (Chrome, Firefox, Edge)
- Safari: Có thể cần fallback format

### 5. Session storage
- Session lưu trong memory (globalSessions Map)
- Hết hạn sau 2 giờ
- Có thể mất khi server restart (cold start)

## Các bước tiếp theo

### 1. Test đầy đủ trên local
- [ ] Test Photo mode hoàn chỉnh
- [ ] Test GIF mode hoàn chỉnh
- [ ] Test Video mode hoàn chỉnh
- [ ] Test QR code trên mobile (iOS + Android)
- [ ] Test download trên mobile
- [ ] Test share function

### 2. Tối ưu hóa (nếu cần)
- [ ] Giảm kích thước GIF (nếu quá lớn)
- [ ] Tối ưu video encoding
- [ ] Thêm loading indicator
- [ ] Thêm error handling

### 3. Deploy lên Vercel
```bash
git add .
git commit -m "feat: integrate GIF/Video capture into photobooth"
git push origin main
```

### 4. Test trên production
- [ ] Test trên Vercel deployment
- [ ] Test QR code với production URL
- [ ] Test download trên mobile
- [ ] Kiểm tra session storage

## Troubleshooting

### GIF không tạo được
- Kiểm tra camera permission
- Kiểm tra gifshot library đã cài đặt
- Xem console log để debug

### Video không quay được
- Kiểm tra camera + microphone permission
- Kiểm tra MediaRecorder API support
- Thử trên Chrome/Firefox (Safari có thể khác)

### QR code không hoạt động
- Kiểm tra cùng mạng WiFi
- Kiểm tra session chưa hết hạn
- Xem server logs

### Download không hoạt động trên mobile
- iOS: Dùng "Xem" → Bấm giữ → "Lưu vào Ảnh/Video"
- Android: Dùng nút "Tải" hoặc "Chia sẻ"
- Kiểm tra MIME type đúng

## Kết luận

Tính năng GIF/Video đã được tích hợp hoàn chỉnh vào photobooth. Người dùng có thể:
- Chọn giữa Photo/GIF/Video
- Tạo nội dung vui nhộn và sáng tạo
- Tải về qua QR code trên điện thoại
- Chia sẻ lên mạng xã hội

**Chưa push lên git** - Đang chờ test trên local trước!
