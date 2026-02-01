
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Explicitly import process to resolve type error for cwd() in the build environment
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Prioritize the environment variable from the build system (Vercel/GitHub Actions)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: './index.html',
      },
    },
    server: {
      port: 3000,
    }
  };
});
