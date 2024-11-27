import { defineConfig } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  images: ['public/vhs-logo.png'],
  preset: {
    name: 'minimal-2023',
    transparent: {
      sizes: [64, 192, 512, 1024],
      favicons: [[48, 'favicon.ico']],
      padding: 0,
    },
    maskable: {
      sizes: [512, 1024],
      resizeOptions: {
        background: '#9333EA'
      },
      padding: 0,
    },
    apple: {
      sizes: [180],
      resizeOptions: {
        background: '#000000'
      },
      padding: 0,
    },
  }
});