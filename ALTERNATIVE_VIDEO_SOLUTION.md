# Alternative Video Solution

## Vấn đề hiện tại
MediaRecorder có thể không hoạt động tốt trên một số browser/OS, đặc biệt là macOS Safari.

## Giải pháp thay thế

### Option 1: Dùng Canvas + WebM Writer
Capture frames từ video stream bằng canvas, sau đó encode thành WebM.

### Option 2: Chỉ hỗ trợ GIF
Nếu video không hoạt động, có thể tạm thời chỉ hỗ trợ GIF (đã hoạt động tốt).

### Option 3: Dùng thư viện RecordRTC
Thư viện này handle cross-browser compatibility tốt hơn.

## Test trên trang riêng
Hãy test trên http://localhost:3000/gif-video-test để xem video có hoạt động không.

Nếu hoạt động ở đây thì vấn đề là integration, nếu không thì vấn đề là browser support.
