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
    chunkSizeWarningLimit: 1500, // Increased to reduce warnings
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            if (id.includes('@stripe')) {
              return 'stripe-vendor';
            }
            if (id.includes('chart.js')) {
              return 'chart-vendor';
            }
            if (id.includes('openai') || id.includes('@anthropic')) {
              return 'ai-vendor';
            }
            if (id.includes('supabase')) {
              return 'supabase-vendor';
            }
            // Other large libraries
            return 'vendor';
          }

          // Code-split by feature
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/effects/')) {
            return 'effects';
          }
        },
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