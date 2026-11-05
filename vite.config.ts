import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import legacy from '@vitejs/plugin-legacy';

// ----------------------------------------------------------------------

const PORT = 3039;

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['Chrome >= 64', 'Firefox >= 60', 'Safari >= 12', 'iOS >= 12', 'Edge >= 79'],
      modernTargets: ['Chrome >= 64', 'Firefox >= 60', 'Safari >= 12', 'iOS >= 12', 'Edge >= 79'],
      modernPolyfills: true,
    }),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: { port: PORT, host: true },
  preview: { port: PORT, host: true },
});
