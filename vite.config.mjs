import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  resolve: {
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react/jsx-runtime': path.resolve('./node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve('./node_modules/react/jsx-dev-runtime')
    },
    dedupe: ['react', 'react-dom']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser', // Better minification than esbuild
    sourcemap: false,
    target: 'es2015',
    chunkSizeWarningLimit: 800, // Warn if chunks exceed 800KB
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // NO manualChunks - prevents React duplication
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console calls
        passes: 2 // More aggressive compression
      },
      mangle: {
        safari10: true // Safari 10 compatibility
      }
    }
  },
  server: {
    port: 3002,
    strictPort: false,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  preview: {
    port: 3002,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@stripe/stripe-js'],
    force: false
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});