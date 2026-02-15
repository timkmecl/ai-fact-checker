import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: ['localhost', '127.0.0.1', '192.168.0.100']
      },
      plugins: [react()],
      define: {
        'process.env.API_URL': JSON.stringify(env.API_URL || 'http://localhost:4101/api')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
