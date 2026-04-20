# Hướng dẫn Push lên GitHub

## Vấn đề hiện tại

Git đang dùng tài khoản `Hoang2409-2` nhưng repository thuộc về `yennhidinh2412`.

## Giải pháp 1: GitHub Desktop (Khuyến nghị - Dễ nhất)

### Bước 1: Tải GitHub Desktop
- Vào: https://desktop.github.com/
- Tải và cài đặt

### Bước 2: Đăng nhập
1. Mở GitHub Desktop
2. File → Options → Accounts
3. Sign in to GitHub.com
4. Đăng nhập với tài khoản: **yennhidinh2412**

### Bước 3: Add Repository
1. File → Add Local Repository
2. Choose: `/Users/dinhthiyennhi/Downloads/photobooth-ui`
3. Click "Add Repository"

### Bước 4: Publish
1. Click "Publish repository"
2. Chọn repository: **photobooth-ui**
3. Bỏ tick "Keep this code private" (hoặc giữ private)
4. Click "Publish repository"
5. ✅ Xong!

## Giải pháp 2: Personal Access Token (Terminal)

### Bước 1: Tạo Personal Access Token

1. Vào: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Note: "Photobooth Deploy"
4. Expiration: 90 days (hoặc No expiration)
5. Chọn scopes:
   - ✅ repo (full control)
6. Click "Generate token"
7. **Copy token** (chỉ hiện 1 lần!)

### Bước 2: Push với Token

```bash
# Format: https://TOKEN@github.com/username/repo.git
git remote set-url origin https://YOUR_TOKEN@github.com/yennhidinh2412/photobooth-ui.git

# Push
git push -u origin main
```

**Thay YOUR_TOKEN bằng token vừa copy**

## Giải pháp 3: SSH Key (Advanced)

### Bước 1: Tạo SSH Key

```bash
# Tạo SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Nhấn Enter 3 lần (không cần passphrase)

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

### Bước 2: Add SSH Key vào GitHub

1. Vào: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "MacBook Air"
4. Paste public key vừa copy
5. Click "Add SSH key"

### Bước 3: Push với SSH

```bash
# Đổi remote sang SSH
git remote set-url origin git@github.com:yennhidinh2412/photobooth-ui.git

# Push
git push -u origin main
```

## Sau khi Push thành công

1. Vào: https://github.com/yennhidinh2412/photobooth-ui
2. Kiểm tra code đã lên chưa
3. Tiếp tục deploy lên Vercel!

## Troubleshooting

### Lỗi: "Permission denied"
- Đảm bảo đăng nhập đúng tài khoản
- Kiểm tra token còn hạn không
- Thử GitHub Desktop

### Lỗi: "Repository not found"
- Kiểm tra URL repository đúng chưa
- Đảm bảo repository đã được tạo trên GitHub

### Lỗi: "Authentication failed"
- Token hết hạn → Tạo token mới
- Hoặc dùng GitHub Desktop

## Khuyến nghị

**Dùng GitHub Desktop** - Đơn giản nhất, không cần token hay SSH key!
