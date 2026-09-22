import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['palaciodebellezaicono.png', 'palaciodebellezalogo.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'Palacio de Belleza',
          short_name: 'Palacio de Belleza',
          description: 'Sistema de Punto de Venta para Palacio de Belleza - Muebles y artículos de belleza',
          theme_color: '#E6007E',
          background_color: '#F4F5F7',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/palaciodebellezaicono.png',
              sizes: '192x192 512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
