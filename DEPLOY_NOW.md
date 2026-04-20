# 🚀 HƯỚNG DẪN DEPLOY NGAY - FIX LỖI iOS

## ⚠️ VẤN ĐỀ HIỆN TẠI

iOS Safari chặn HTTP URL vì lý do bảo mật. Để fix, BẮT BUỘC phải deploy lên server có HTTPS.

## ✅ GIẢI PHÁP: DEPLOY LÊN VERCEL (5 PHÚT)

### Bước 1: Tạo tài khoản GitHub (nếu chưa có)

1. Vào https://github.com/signup
2. Đăng ký tài khoản miễn phí
3. Xác nhận email

### Bước 2: Push code lên GitHub

**Cách 1: Dùng GitHub Desktop (Dễ nhất)**

1. Tải GitHub Desktop: https://desktop.github.com/
2. Cài đặt và đăng nhập
3. File → Add Local Repository
4. Chọn thư mục project này
5. Publish repository → Đặt tên "photobooth-app"
6. Bỏ tick "Keep this code private" (hoặc giữ private nếu muốn)
7. Click "Publish repository"

**Cách 2: Dùng Terminal**

```bash
# Tạo repository mới trên GitHub web interface
# Sau đó chạy:

git remote add origin https://github.com/YOUR_USERNAME/photobooth-app.git
git branch -M main
git push -u origin main
```

### Bước 3: Deploy lên Vercel

1. Vào https://vercel.com/signup
2. Chọn "Continue with GitHub"
3. Cho phép Vercel truy cập GitHub
4. Click "Import Project"
5. Chọn repository "photobooth-app"
6. Click "Deploy"
7. Đợi 2-3 phút...
8. ✅ XONG! Nhận được URL HTTPS

### Bước 4: Test trên điện thoại

1. Mở URL Vercel trên máy tính (ví dụ: https://photobooth-app.vercel.app)
2. Chụp ảnh và tạo QR code
3. Quét QR bằng điện thoại
4. ✅ iOS và Android đều hoạt động!

## 🎯 SAU KHI DEPLOY

### URL của bạn sẽ là:
- `https://photobooth-app.vercel.app` (hoặc tên bạn đặt)
- Có thể custom domain sau

### Tính năng hoạt động:
- ✅ QR code với HTTPS URL
- ✅ iOS Safari quét được
- ✅ Android quét được
- ✅ Không cần cùng WiFi
- ✅ Truy cập từ mọi nơi

### Cập nhật code sau này:

```bash
# Sau khi sửa code
git add .
git commit -m "Update features"
git push

# Vercel tự động deploy lại!
```

## 🔧 TROUBLESHOOTING

### Lỗi: "Build failed"

**Nguyên nhân:** Dependencies hoặc TypeScript errors

**Giải pháp:**
```bash
# Test build locally trước
npm run build

# Nếu có lỗi, fix rồi commit lại
git add .
git commit -m "Fix build errors"
git push
```

### Lỗi: "Function timeout"

**Nguyên nhân:** Ảnh quá lớn, xử lý quá lâu

**Giải pháp:**
- Vercel free tier có timeout 10 giây
- Nếu cần nhiều hơn, upgrade plan hoặc dùng platform khác

### Session bị mất sau khi deploy

**Nguyên nhân:** Vercel serverless functions không lưu state

**Giải pháp tạm thời:**
- Session lưu trong memory, tồn tại trong 1 request lifecycle
- Đã được optimize để hoạt động tốt

**Giải pháp lâu dài:**
- Dùng database (MongoDB, PostgreSQL)
- Dùng Redis cho session storage
- Dùng cloud storage (AWS S3, Cloudinary) cho ảnh

## 📱 ALTERNATIVE: NGROK (TẠM THỜI)

Nếu không muốn deploy ngay, dùng ngrok để tạo HTTPS URL tạm thời:

```bash
# Cài ngrok
brew install ngrok  # macOS
# hoặc tải từ https://ngrok.com/download

# Chạy ngrok
ngrok http 3000

# Nhận được URL HTTPS tạm thời
# Ví dụ: https://abc123.ngrok.io
```

**Lưu ý:** 
- URL ngrok thay đổi mỗi lần restart
- Chỉ dùng cho test, không dùng production

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi deploy lên Vercel:
- ✅ URL HTTPS: `https://your-app.vercel.app`
- ✅ QR code chứa URL HTTPS
- ✅ iOS Safari mở được
- ✅ Android mở được
- ✅ Tải ảnh về điện thoại OK
- ✅ Không cần cùng WiFi

## 💡 TIPS

1. **Custom domain:** Vercel cho phép add domain miễn phí
2. **Analytics:** Vercel có analytics built-in
3. **Auto-deploy:** Mỗi lần push code, tự động deploy
4. **Preview URLs:** Mỗi PR có URL preview riêng

## 📞 CẦN HỖ TRỢ?

Nếu gặp khó khăn:
1. Chụp screenshot lỗi
2. Copy error message
3. Liên hệ support

---

**LƯU Ý QUAN TRỌNG:** 
- Vercel free tier đủ cho testing và small-scale usage
- Nếu cần scale lớn, cân nhắc upgrade hoặc self-host
- Session storage hiện tại là in-memory, cân nhắc database cho production
