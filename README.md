# Cropix

Lightweight Windows desktop image cropping. Open or drop an image, crop interactively, export PNG or JPEG — all local.

## Stack

Tauri 2 · React · TypeScript · Vite · Tailwind CSS · shadcn/ui · react-image-crop

## Develop

```bash
npm install
npm run tauri dev
```

## Build (Windows NSIS)

```bash
npm run tauri build
```

Installer: `src-tauri/target/release/bundle/nsis/Cropix_0.1.0_x64-setup.exe`  
Executable: `src-tauri/target/release/cropix.exe`

## Requirements

- Node.js 18+
- Rust (stable)
- WebView2 (included on modern Windows 10/11)
