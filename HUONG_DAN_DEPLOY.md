# 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL

## ✅ Đã Fix Xong Các Lỗi

1. ✅ Đã clean package.json - loại bỏ các dependencies gây conflict
2. ✅ Đã đơn giản hóa vercel.json
3. ✅ Đã push code lên GitHub: https://github.com/yennhidinh2412/photobooth-ui
4. ✅ Code đã sẵn sàng để deploy

## 📱 DEPLOY NGAY BÂY GIỜ

### Bước 1: Vào Vercel
1. Mở trình duyệt và vào: https://vercel.com
2. Đăng nhập bằng tài khoản GitHub của bạn

### Bước 2: Import Project
1. Click nút **"Add New..."** → chọn **"Project"**
2. Tìm repository: **photobooth-ui**
3. Click **"Import"**

### Bước 3: Configure Project
1. **Framework Preset**: Vercel sẽ tự động detect là Next.js ✅
2. **Root Directory**: Để mặc định (`.`)
3. **Build Command**: Để mặc định (`npm run build`)
4. **Output Directory**: Để mặc định (`.next`)
5. **Install Command**: Để mặc định (`npm install`)

### Bước 4: Deploy
1. Click nút **"Deploy"** màu xanh
2. Đợi 2-3 phút để Vercel build và deploy
3. Khi thấy 🎉 **"Congratulations!"** là xong!

### Bước 5: Lấy URL Production
1. Sau khi deploy xong, bạn sẽ thấy URL như: `https://photobooth-ui-xxx.vercel.app`
2. Copy URL này
3. Mở URL trên máy tính để test

## 🧪 TEST QR CODE TRÊN ĐIỆN THOẠI

### Test trên iPhone (iOS):
1. Mở app trên máy tính: `https://photobooth-ui-xxx.vercel.app`
2. Chụp ảnh và chọn ảnh
3. Quét mã QR bằng Camera app trên iPhone
4. Safari sẽ mở link HTTPS → Không còn lỗi nữa! ✅
5. Bấm nút "Lưu ảnh" để tải ảnh về

### Test trên Android:
1. Mở app trên máy tính: `https://photobooth-ui-xxx.vercel.app`
2. Chụp ảnh và chọn ảnh
3. Quét mã QR bằng Camera app hoặc Google Lens
4. Chrome sẽ mở link HTTPS
5. Bấm nút "Lưu ảnh" để tải ảnh về

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Không Cần Cùng Mạng WiFi
- ✅ App đã deploy lên internet
- ✅ Bất kỳ ai có QR code đều truy cập được
- ✅ Không cần localhost nữa

### 2. HTTPS Tự Động
- ✅ Vercel tự động cấp SSL certificate
- ✅ iOS Safari không còn chặn nữa
- ✅ Android cũng hoạt động tốt

### 3. Lưu Ảnh Trên Điện Thoại
- Khi mở link QR trên điện thoại:
  - Sẽ thấy các ảnh đã chụp
  - Bấm nút "Lưu ảnh" để tải từng ảnh về
  - Ảnh sẽ được lưu vào thư viện ảnh của điện thoại

## 🔧 NẾU GẶP LỖI KHI DEPLOY

### Lỗi: Build Failed
**Giải pháp:**
1. Vào tab "Settings" trong Vercel project
2. Chọn "General"
3. Tìm "Node.js Version"
4. Chọn version `20.x`
5. Click "Save"
6. Vào tab "Deployments"
7. Click "Redeploy" ở deployment mới nhất

### Lỗi: Install Failed
**Giải pháp:**
1. Vào tab "Settings" → "General"
2. Tìm "Install Command"
3. Thay đổi thành: `npm install --legacy-peer-deps`
4. Click "Save"
5. Redeploy lại

## 📞 SAU KHI DEPLOY XONG

1. **Test ngay trên máy tính**: Mở URL Vercel để xem app có chạy không
2. **Test QR code trên iPhone**: Quét QR và xem có mở được không
3. **Test QR code trên Android**: Quét QR và xem có mở được không
4. **Test lưu ảnh**: Bấm nút "Lưu ảnh" trên điện thoại

## ✨ KẾT QUẢ MONG ĐỢI

✅ App chạy trên URL: `https://photobooth-ui-xxx.vercel.app`
✅ Không cần chạy lệnh `npm run dev` nữa
✅ Không cần cùng mạng WiFi
✅ iOS và Android đều quét QR được
✅ Lưu ảnh về điện thoại được
✅ Không còn lỗi HTTPS nữa

---

**Nếu cần hỗ trợ thêm, hãy cho tôi biết kết quả sau khi deploy nhé!** 🎉
