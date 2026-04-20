# 📸 Photobooth Professional

Ứng dụng photobooth chuyên nghiệp với tính năng chụp ảnh, chỉnh sửa filter/background, và tải ảnh về điện thoại qua QR code.

## ✨ Tính năng

- 📷 **Chụp ảnh chuyên nghiệp** - Hỗ trợ 2 chế độ: Góc ngang và Overhead
- 🎨 **8 Filter đẹp** - Nguyên bản, Tươi sáng, Cổ điển, Đen trắng, Ấm áp, Lạnh lùng, Mơ màng, Sống động
- 🌈 **13 Background** - Từ không nền đến các gradient màu sắc đa dạng
- 📱 **QR Code** - Quét để tải ảnh về điện thoại (iOS & Android)
- 🖨️ **In ảnh** - Hỗ trợ máy in DNP DS-RX1 (tùy chọn)
- 💾 **Tải ảnh** - Tải từng ảnh hoặc tất cả cùng lúc
- 🎯 **Responsive** - Hoạt động tốt trên mọi thiết bị

## 🚀 Quick Start

### Development

```bash
# Cài đặt dependencies
npm install
# hoặc
pnpm install

# Chạy dev server
npm run dev

# Mở http://localhost:3000
```

### Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

## 📱 Deploy lên Production

### ⚠️ QUAN TRỌNG: iOS Safari yêu cầu HTTPS

Để QR code hoạt động trên iOS, BẮT BUỘC phải deploy lên server có HTTPS.

### Deploy lên Vercel (Khuyến nghị - 5 phút)

1. Push code lên GitHub
2. Vào [vercel.com/new](https://vercel.com/new)
3. Import repository
4. Click "Deploy"
5. ✅ Xong! Nhận URL HTTPS

**Xem hướng dẫn chi tiết:** [DEPLOY_NOW.md](./DEPLOY_NOW.md)

## 🎯 Cách sử dụng

1. **Chọn chế độ chụp** - Góc ngang hoặc Overhead
2. **Chọn gói giá** - 2-12 cut
3. **Thanh toán** - (Mô phỏng)
4. **Chụp ảnh** - Theo số lượng đã chọn
5. **Chọn ảnh** - Chọn ảnh muốn in/lưu
6. **Chỉnh sửa** - Áp dụng filter và background
7. **Tải ảnh** - Quét QR code hoặc in ảnh

## 📂 Cấu trúc Project

```
photobooth-ui/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── session/       # Session management
│   │   ├── photos/        # Photo handling
│   │   └── network-info/  # Network utilities
│   ├── download/[id]/     # Download page (QR code destination)
│   └── page.tsx           # Main photobooth UI
├── components/            # React components
│   ├── photo-capture.tsx  # Camera component
│   ├── printer-controls.tsx # Printer UI
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities
│   ├── hardware.ts        # Hardware integration
│   ├── network.ts         # Network helpers
│   └── utils.ts           # General utilities
└── public/                # Static assets
```

## 🔧 Cấu hình

### Camera

- Tự động detect camera có sẵn
- Hỗ trợ Canon R50 (qua USB-C)
- Fallback về webcam nếu không có Canon R50

### Printer (Tùy chọn)

- DNP DS-RX1 support
- Kết nối qua USB
- Giấy 4x6 inch

### Session Storage

- Lưu trong memory (RAM)
- Tồn tại 2 giờ
- Tự động cleanup

## 📚 Tài liệu

- [DEPLOY_NOW.md](./DEPLOY_NOW.md) - Hướng dẫn deploy chi tiết
- [CAMERA_TROUBLESHOOTING.md](./CAMERA_TROUBLESHOOTING.md) - Khắc phục lỗi camera
- [HARDWARE_SETUP.md](./HARDWARE_SETUP.md) - Cài đặt hardware

## 🛠️ Tech Stack

- **Framework:** Next.js 15.2.4
- **UI:** React 19, Tailwind CSS, shadcn/ui
- **Camera:** MediaDevices API
- **QR Code:** qrcode library
- **Deployment:** Vercel (recommended)

## 🐛 Troubleshooting

### Camera không hoạt động

- Kiểm tra quyền camera trong browser
- Đảm bảo sử dụng HTTPS hoặc localhost
- Xem [CAMERA_TROUBLESHOOTING.md](./CAMERA_TROUBLESHOOTING.md)

### iOS không quét được QR code

- ⚠️ iOS yêu cầu HTTPS
- Deploy lên Vercel để có HTTPS
- Hoặc tắt "HTTPS-Only Mode" trong Safari (tạm thời)

### Session không tìm thấy

- Session tồn tại 2 giờ
- Server restart sẽ mất session
- Chụp ảnh mới và tạo QR code mới

## 📊 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 53+ | ✅ Full |
| Firefox | 36+ | ✅ Full |
| Safari | 11+ | ✅ Full (cần HTTPS) |
| Edge | 79+ | ✅ Full |
| iOS Safari | 11+ | ✅ Full (cần HTTPS) |
| Android Chrome | 53+ | ✅ Full |

## 🔐 Security

- Camera chỉ hoạt động trên HTTPS hoặc localhost
- Session data lưu trong memory, không persistent
- Ảnh tự động xóa sau 2 giờ
- Không lưu thông tin cá nhân

## 📈 Roadmap

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Cloud storage (AWS S3/Cloudinary)
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 💬 Support

Nếu gặp vấn đề:
1. Kiểm tra [CAMERA_TROUBLESHOOTING.md](./CAMERA_TROUBLESHOOTING.md)
2. Kiểm tra [DEPLOY_NOW.md](./DEPLOY_NOW.md)
3. Mở issue trên GitHub
4. Liên hệ support

---

Made with ❤️ for professional photobooth experiences
