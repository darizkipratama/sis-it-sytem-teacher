import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const frontendDir = fileURLToPath(new URL('.', import.meta.url));
const appDir = path.resolve(frontendDir, 'src');

export default defineConfig(() => {
  return {
    root: appDir,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': appDir,
      },
    },
    build: {
      outDir: path.resolve(frontendDir, '../dist'),
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
