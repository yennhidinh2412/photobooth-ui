# Hướng dẫn Deploy Photobooth App

## Deploy lên Vercel (Khuyến nghị - Miễn phí + HTTPS)

### Bước 1: Chuẩn bị

1. Tạo tài khoản tại [vercel.com](https://vercel.com)
2. Cài đặt Vercel CLI (tùy chọn):
   ```bash
   npm install -g vercel
   ```

### Bước 2: Deploy

**Cách 1: Deploy qua Web (Dễ nhất)**

1. Push code lên GitHub
2. Vào [vercel.com/new](https://vercel.com/new)
3. Import repository từ GitHub
4. Vercel sẽ tự động detect Next.js và deploy
5. Đợi vài phút → Nhận được URL HTTPS

**Cách 2: Deploy qua CLI**

```bash
# Từ thư mục project
vercel

# Làm theo hướng dẫn:
# - Set up and deploy? Yes
# - Which scope? (chọn account của bạn)
# - Link to existing project? No
# - Project name? (nhập tên hoặc để mặc định)
# - Directory? ./ (enter)
# - Override settings? No

# Deploy production
vercel --prod
```

### Bước 3: Sau khi Deploy

1. Bạn sẽ nhận được URL dạng: `https://your-app.vercel.app`
2. QR code sẽ tự động sử dụng URL này (có HTTPS)
3. iOS và Android đều quét được!

## Lưu ý quan trọng

### Về Session Storage

- Ảnh được lưu trong **memory** (RAM)
- Session tồn tại **2 giờ**
- Khi server restart, session sẽ mất
- **Khuyến nghị**: Nếu cần lưu lâu dài, nên dùng database (MongoDB, PostgreSQL) hoặc cloud storage (AWS S3, Cloudinary)

### Về Network

- **Local development**: Sử dụng IP mạng (192.168.x.x) - chỉ hoạt động cùng WiFi
- **Production (Vercel)**: Sử dụng HTTPS URL - hoạt động mọi nơi, mọi mạng

### Giới hạn Vercel Free Tier

- ✅ Bandwidth: 100GB/tháng
- ✅ Serverless Function: 100GB-Hrs
- ✅ Build time: 6000 phút/tháng
- ⚠️ Serverless Function timeout: 10 giây (có thể không đủ cho ảnh lớn)

## Troubleshooting

### iOS không mở được link

- ✅ **Đã fix**: Deploy lên Vercel sẽ có HTTPS tự động
- iOS yêu cầu HTTPS, không chấp nhận HTTP

### Session không tìm thấy

- Kiểm tra xem server có bị restart không
- Session chỉ tồn tại 2 giờ
- Thử chụp ảnh mới và tạo QR code mới

### Ảnh quá lớn

- Mỗi ảnh base64 khoảng 1-2MB
- Nếu chụp nhiều ảnh, có thể vượt giới hạn
- **Giải pháp**: Nén ảnh trước khi lưu hoặc dùng cloud storage

## Deploy lên các nền tảng khác

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Railway

1. Vào [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Chọn repository
4. Railway tự động deploy

### Render

1. Vào [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Build Command: `npm run build`
5. Start Command: `npm start`

## Nâng cấp Production

Để sử dụng lâu dài, nên:

1. **Database**: Lưu session vào MongoDB/PostgreSQL
2. **Cloud Storage**: Upload ảnh lên AWS S3/Cloudinary
3. **CDN**: Phân phối ảnh nhanh hơn
4. **Analytics**: Theo dõi số lượng người dùng
5. **Monitoring**: Cảnh báo khi có lỗi

## Liên hệ

Nếu cần hỗ trợ deploy hoặc nâng cấp, hãy liên hệ!
