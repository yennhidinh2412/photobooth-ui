# 📷 Photobooth Professional - Hardware Setup Guide

## 🎯 **Hardware Components**

### ✅ **Required Hardware**
1. **Canon EOS R50** - Professional camera with UVC/UAC support
2. **ViewSonic TD2423** - 24-inch touchscreen display (1920x1080)
3. **DNP DS-RX1** - Thermal photo printer
4. **Windows/Mac Computer** - Running the Electron kiosk app

### 🔌 **Connections**
```
[Computer] ──USB-C──► [Canon R50]
     │
     ├──HDMI/DP──► [ViewSonic TD2423]
     │
     └──USB/Ethernet──► [DNP DS-RX1]
```

## 🚀 **Software Installation**

### 1. **Development Setup**
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Start Electron development
pnpm electron:dev
```

### 2. **Production Build**
```bash
# Build for production kiosk
BUILD_ELECTRON=true pnpm build:kiosk

# This creates:
# - dist/Photobooth Professional Setup.exe (Windows)
# - dist/Photobooth Professional.dmg (macOS)
# - dist/Photobooth Professional.AppImage (Linux)
```

## 🔧 **Hardware Configuration**

### 📷 **Canon R50 Setup**

#### **Connection**
- Connect via USB-C cable
- Enable UVC/UAC mode in camera settings
- Set to video mode for continuous operation

#### **Auto-Detection**
```javascript
// App automatically detects Canon R50
const camera = await hardwareManager.getCameraController()
const device = await camera.detectCamera()

if (device.name.includes('Canon')) {
  console.log('✅ Canon R50 detected')
  // Uses optimal 2400x1600 resolution
}
```

#### **Power Management**
- Use USB-C PD adapter for continuous power
- Disable auto-power-off in camera settings
- Enable "PC Connection" mode

### 🖥️ **ViewSonic TD2423 Setup**

#### **Display Configuration**
- Connect via HDMI/DisplayPort
- Set to 1920x1080 @ 60Hz
- Enable touch input via USB
- Calibrate touch if needed

#### **Kiosk Optimization**
```javascript
// App optimizes for 24" display
- Larger touch targets (min 44px)
- Enhanced button sizes for standing use
- Auto-fullscreen in production
- Cursor auto-hide after 5 seconds
```

#### **Touch Calibration**
1. Windows: Settings → System → Display → Touch Calibration
2. macOS: System Preferences → Displays → Touch Calibration
3. Linux: `xinput_calibrator` tool

### 🖨️ **DNP DS-RX1 Setup**

#### **Connection Options**
- **USB**: Direct connection for simplicity
- **Ethernet**: Network printing for multiple kiosks
- **WiFi**: Wireless setup (if supported)

#### **Driver Installation**
1. Download DNP drivers from official website
2. Install printer drivers for your OS
3. Test print a sample photo

#### **Paper & Supplies**
- Use DNP 4x6" photo paper
- Install ribbon cartridge
- Check paper and ribbon levels

## ⚙️ **App Configuration**

### **Hardware Detection**
The app automatically detects and configures hardware:

```typescript
// Hardware Manager initializes all devices
const hardwareManager = new HardwareManager()
await hardwareManager.initialize()

// Status display on welcome screen
const status = hardwareManager.getHardwareStatus()
// Shows: Camera, Printer, Display status
```

### **Camera Modes**

#### **Horizontal Mode**
- Uses front camera or Canon R50 user mode
- 1920x1080 resolution
- Mirrors image for selfie effect

#### **Overhead Mode**
- Prioritizes Canon R50 environment mode
- 2400x1600 resolution (3:2 aspect)
- No mirroring (camera mounted above)
- Enhanced contrast for overhead lighting

### **Print Integration**

#### **Direct Printing**
```typescript
// Print directly to DNP DS-RX1
const printJobs = await hardwareManager.printPhotos(photos, {
  paperSize: '4x6',
  quality: 'high',
  copies: 1,
  lamination: true
})
```

#### **QR Code Fallback**
- If printer not detected, shows QR code
- Customers scan to download photos
- Works on same WiFi network

## 🏗️ **Physical Installation**

### **Kiosk Layout**
```
     ┌─────────────────┐
     │  Canon R50      │ (Overhead mount)
     │      ↓          │
┌────┼─────────────────┼────┐
│    │ ViewSonic TD2423│    │
│    │   (24" Touch)   │    │
│    └─────────────────┘    │
│                           │
│  ┌─────────────────┐      │
│  │   DNP DS-RX1    │      │
│  │   (Printer)     │      │
│  └─────────────────┘      │
└───────────────────────────┘
```

### **Mounting**

#### **Camera Mounting**
- **Overhead**: Mount 6-8 feet above
- **Horizontal**: Eye-level on tripod/mount
- Ensure stable mounting for sharp photos
- Consider lighting setup

#### **Display Mounting**
- Mount at comfortable standing height
- Tilt slightly upward for ergonomics
- Secure cable management
- Easy access for maintenance

#### **Printer Placement**
- Accessible for paper/ribbon refills
- Near power outlet
- Protected from dust
- Customer pickup area nearby

## 🔒 **Kiosk Mode Features**

### **Security**
- Fullscreen operation (no window controls)
- Disabled keyboard shortcuts
- Prevented external navigation
- Auto-restart on crash

### **User Experience**
- Touch-optimized interface
- Auto-hide cursor
- Large touch targets
- Visual feedback for all interactions

### **Reliability**
- Single instance prevention
- Automatic error recovery
- Hardware status monitoring
- Graceful error handling

## 🐛 **Troubleshooting**

### **Camera Issues**
```bash
# Check camera detection
# Look for logs in console:
📷 Available cameras (2):
  - Canon EOS R50 (deviceId: abc123)
  - Built-in Camera (deviceId: def456)
```

**Solutions:**
- Reconnect USB cable
- Restart camera
- Check camera permissions
- Try different USB port

### **Touch Issues**
**Solutions:**
- Recalibrate touch screen
- Check USB connection
- Update touch drivers
- Test with different USB port

### **Printer Issues**
**Solutions:**
- Check paper and ribbon
- Restart printer
- Update printer drivers
- Verify network connection (if using Ethernet)

### **General Issues**
```bash
# Enable debug logging
PHOTOBOOTH_MODE=debug pnpm dev

# Check hardware status
# Look for initialization logs:
🔧 Initializing photobooth hardware...
✅ Canon R50 detected
⚠️ Printer not found (using QR mode)
✅ Display ready
```

## 📋 **Maintenance Checklist**

### **Daily**
- [ ] Check paper and ribbon levels
- [ ] Clean camera lens
- [ ] Test all hardware functionality
- [ ] Review error logs

### **Weekly**
- [ ] Clean touchscreen
- [ ] Check cable connections
- [ ] Update printer supplies
- [ ] Backup session data

### **Monthly**
- [ ] Update software
- [ ] Deep clean all hardware
- [ ] Check hardware mounting
- [ ] Review performance metrics

## 🎉 **Success Indicators**

When everything is working correctly, you should see:

1. **Welcome Screen**: All hardware shows green checkmarks
2. **Camera**: Detects Canon R50 with high resolution
3. **Touch**: Responsive interface optimized for 24"
4. **Printing**: Direct DNP printing or QR fallback
5. **Kiosk**: Runs in fullscreen without interruption

---

**Ready to launch your professional photobooth! 🚀**

