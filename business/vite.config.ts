import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // glass.css is vendored one level up; a standalone apipay-public checkout has no workspace root to allow it.
  server: {fs: {allow: ['..']}},
});
