import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'fix-mime-type',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith('.js') || req.url?.endsWith('.jsx')) {
            res.setHeader('Content-Type', 'text/javascript');
          }
          next();
        });
      }
    }
  ],
})
