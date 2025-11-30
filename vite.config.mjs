import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Use absolute paths for proper deployment
  publicDir: 'public',
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
        manualChunks(id) {
          // Vendor chunks - split by package for better caching
          if (id.includes('node_modules')) {
            // CRITICAL: Keep ALL React ecosystem together to prevent Children property error
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor'; // Everything React-related in ONE bundle
            }
            if (id.includes('@react-three')) {
              return 'react-vendor'; // 3D libs need same React instance
            }

            // 3D rendering (large) - separate from React
            if (id.includes('three') && !id.includes('@react-three')) {
              return 'three-vendor';
            }

            // Payment providers
            if (id.includes('@stripe')) {
              return 'stripe-vendor';
            }

            // Data visualization
            if (id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'chart-vendor';
            }

            // AI APIs
            if (id.includes('openai')) {
              return 'openai-vendor';
            }
            if (id.includes('@anthropic')) {
              return 'anthropic-vendor';
            }

            // Database & Auth (large)
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }

            // Markdown & utilities
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) {
              return 'markdown-vendor';
            }

            // Media processing
            if (id.includes('jszip') || id.includes('qrcode')) {
              return 'media-vendor';
            }

            // CGI/Effects presets
            if (id.includes('cgiPresets')) {
              return 'cgiPresets';
            }

            // Everything else
            return 'vendor';
          }

          // Code-split by feature for lazy loading
          if (id.includes('/components/')) {
            // Split large component groups
            if (id.includes('Dashboard') || id.includes('Admin')) {
              return 'admin-components';
            }
            if (id.includes('VR') || id.includes('3D')) {
              return '3d-components';
            }
            if (id.includes('Payment') || id.includes('Stripe')) {
              return 'payment-components';
            }
            return 'components';
          }

          if (id.includes('/effects/')) {
            return 'effects';
          }

          if (id.includes('/utils/')) {
            return 'utils';
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
    include: ['react', 'react-dom', 'three', '@stripe/stripe-js'],
    exclude: []
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  }
});