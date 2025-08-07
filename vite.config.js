// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // agar server dapat diakses dari luar container
    port: 5173, // default port dev Vite (tidak akan digunakan saat production build, tapi tetap bagus disiapkan)
  },
  preview: {
    port: 4173, // ini yang digunakan saat kamu `npm run build` dan serve dengan "serve -s dist"
  },
});
