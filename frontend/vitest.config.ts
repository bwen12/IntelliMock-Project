/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        // config/build
        "**/vite.config.ts",
        "**/vitest.config.ts",
        "**/tailwind.config.js",
        "**/postcss.config.js",
        "**/eslint.config.js",

        // types/boilerplate
        "**/*.d.ts",
        "**/vite-env.d.ts",
        "**/main.ts",
        "**/index.ts",
        "**/__mocks__/**",
        "**/__tests__/**",
        "**/types/**",
        "**/stores/globalUserStore.ts",

        // assets
        "**/dist/**",
        "**/*.css",
        "**/*.svg",
        "**/*.png",
        "**/*.jpg",

        "src/main.tsx",
        "src/App.tsx",
         "postcss.config.mjs" 
      ],
    },
    deps: {
      inline: [/@testing-library\/jest-dom/],
    },
  },
}) 