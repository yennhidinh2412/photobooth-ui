/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Enable static export for Electron builds
  output: process.env.BUILD_ELECTRON ? 'export' : undefined,
  trailingSlash: process.env.BUILD_ELECTRON ? true : false,
  
  // Photobooth specific configurations
  env: {
    PHOTOBOOTH_MODE: process.env.PHOTOBOOTH_MODE || 'development',
    ENABLE_HARDWARE: process.env.ENABLE_HARDWARE || 'true',
  },
  
  // Webpack configuration for Electron compatibility
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Fix global is not defined error
      config.plugins.push(
        new webpack.DefinePlugin({
          global: 'globalThis',
        })
      )
      
      // Handle node modules in client-side builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
      }
    }
    
    return config
  },
}

export default nextConfig
