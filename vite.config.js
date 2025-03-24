import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    },
    server: {
        port: 3000,
        open: true
    }
}); 