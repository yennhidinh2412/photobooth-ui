# 🚀 Deploy lên Vercel - Bước cuối cùng!

## ✅ Code đã lên GitHub thành công!

Repository: https://github.com/yennhidinh2412/photobooth-ui

## 📱 Bây giờ deploy lên Vercel để có HTTPS (3 phút)

### Bước 1: Đăng nhập Vercel

1. Vào: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Đăng nhập GitHub (nếu chưa đăng nhập)
4. Click **"Authorize Vercel"**

### Bước 2: Import Project

1. Sau khi đăng nhập, click **"Add New..."** → **"Project"**
2. Hoặc vào trực tiếp: **https://vercel.com/new**
3. Tìm repository: **photobooth-ui**
4. Click **"Import"**

### Bước 3: Configure Project

**Vercel sẽ tự động detect Next.js, bạn chỉ cần:**

1. **Project Name:** `photobooth-ui` (hoặc tên bạn thích)
2. **Framework Preset:** Next.js (đã tự động chọn)
3. **Root Directory:** `./` (mặc định)
4. **Build Command:** `npm run build` (đã tự động)
5. **Output Directory:** `.next` (đã tự động)

**Không cần thay đổi gì!**

### Bước 4: Deploy

1. Click **"Deploy"** (nút lớn màu xanh)
2. Đợi 2-3 phút...
3. ✅ **XONG!**

### Bước 5: Nhận URL

Sau khi deploy xong, bạn sẽ thấy:

```
🎉 Congratulations!
Your project is live at:
https://photobooth-ui-xxx.vercel.app
```

**Copy URL này!**

## 🧪 Test trên điện thoại

1. **Mở URL Vercel trên máy tính:**
   - Ví dụ: `https://photobooth-ui-xxx.vercel.app`

2. **Chụp ảnh và tạo QR code:**
   - Chọn chế độ → Chọn gói → Chụp ảnh
   - Chọn ảnh → Chỉnh filter/background
   - Click "Quét QR Code để lưu ảnh"

3. **Quét QR bằng điện thoại:**
   - Mở Camera app (iOS) hoặc QR scanner (Android)
   - Quét QR code
   - ✅ **Trang download sẽ mở!**

4. **Tải ảnh về điện thoại:**
   - Click "Tải ảnh" cho từng ảnh
   - Hoặc "Tải tất cả ảnh"
   - **iOS:** Bấm "Xem" → Bấm giữ ảnh → "Lưu vào Ảnh"
   - **Android:** Bấm "Tải" hoặc "Chia sẻ"

## 🎯 Kết quả mong đợi

- ✅ URL HTTPS: `https://photobooth-ui-xxx.vercel.app`
- ✅ QR code chứa URL HTTPS
- ✅ iOS Safari mở được (không còn lỗi HTTPS-Only)
- ✅ Android mở được
- ✅ Tải ảnh về điện thoại thành công
- ✅ Không cần cùng WiFi
- ✅ Truy cập từ mọi nơi trên thế giới!

## 🔧 Sau khi deploy

### Custom Domain (Tùy chọn)

1. Vào Vercel Dashboard → Project Settings → Domains
2. Add domain của bạn (ví dụ: `photobooth.yourdomain.com`)
3. Follow hướng dẫn config DNS
4. ✅ Có domain riêng!

### Auto-deploy

Mỗi lần bạn push code mới lên GitHub:
```bash
git add .
git commit -m "Update features"
git push
```

Vercel sẽ **tự động deploy** phiên bản mới!

### View Logs

- Vào Vercel Dashboard → Project → Deployments
- Click vào deployment → View Function Logs
- Xem logs để debug nếu có lỗi

## 📊 Vercel Free Tier

- ✅ **Bandwidth:** 100GB/tháng
- ✅ **Builds:** 6000 phút/tháng
- ✅ **Serverless Functions:** 100GB-Hrs
- ✅ **Unlimited projects**
- ✅ **HTTPS tự động**
- ✅ **Custom domains**

**Đủ cho:**
- Testing và development
- Small-scale production (vài trăm users/ngày)
- Personal projects

**Nếu cần scale lớn:**
- Upgrade lên Pro plan ($20/tháng)
- Hoặc self-host trên VPS

## 🐛 Troubleshooting

### Build failed

1. Check logs trong Vercel Dashboard
2. Thường là TypeScript errors hoặc missing dependencies
3. Fix locally: `npm run build`
4. Push lại: `git push`

### Function timeout

- Vercel free tier: 10 giây timeout
- Nếu xử lý ảnh quá lâu → Upgrade plan
- Hoặc optimize code (nén ảnh trước khi lưu)

### Session not found

- Session lưu trong memory
- Vercel serverless functions có thể restart
- Giải pháp: Dùng database (MongoDB, Redis) cho production

## 🎉 HOÀN THÀNH!

Bây giờ bạn có:
- ✅ Code trên GitHub
- ✅ App live trên Vercel với HTTPS
- ✅ QR code hoạt động trên iOS & Android
- ✅ Tải ảnh về điện thoại OK
- ✅ Professional photobooth app!

## 📞 Cần hỗ trợ?

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- GitHub Issues: https://github.com/yennhidinh2412/photobooth-ui/issues

---

**Chúc mừng! Bạn đã hoàn thành deploy! 🎊**
