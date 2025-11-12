import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser', // Better minification than esbuild
    sourcemap: false,
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'stripe-vendor': ['@stripe/stripe-js'],
          'utils': ['axios', 'qrcode', 'react-markdown']
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3002,
    strictPort: false,
    host: true
  },
  preview: {
    port: 3002,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@stripe/stripe-js']
  }
});