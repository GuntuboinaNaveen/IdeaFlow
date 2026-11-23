import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { tasksJsonPlugin } from "./build-tools/tasksJsonPlugin.js";
import { ideasJsonPlugin } from "./build-tools/ideasJsonPlugin.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tasksJsonPlugin(), ideasJsonPlugin()],
  server: {
    host: true, // Listen on all local IP addresses
    // host: 'custom-hostname.local', // Or specify a custom hostname
    port: 5713, // Optional: change the port as well
    allowedHosts: true,
    // hmr: {
    //   clientPort: 443,
    // },
  }
})
