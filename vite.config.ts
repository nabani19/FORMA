import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  build: {
    // SECURITY: Never emit source maps to production — they expose full source code
    sourcemap: false,
    // Performance: raise warning threshold; actual chunking is handled by manualChunks
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting to reduce the 1.06 MB monolithic bundle.
         * Recharts (~350 KB) and lucide-react are split into vendor chunks
         * that are cached independently across deployments.
         */
        manualChunks: {
          'vendor-recharts': ['recharts'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
  },
});
