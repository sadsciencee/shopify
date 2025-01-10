import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
    },
    plugins: [
        dts({
            include: ['src'],
            entryRoot: 'src',
            outDir: 'dist',
        })
    ],
    build: {
        lib: {
            entry: {
                'node/index': resolve(__dirname, 'src/node/index.ts'),
                'cloudflare/index': resolve(__dirname, 'src/cloudflare/index.ts'),
                'react/index': resolve(__dirname, 'src/react/index.tsx'),
            },
            formats: ['es'],
        },
        rollupOptions: {
            external: [
                'react',
                'react/jsx-runtime',
                'react-dom',
                '@shopify/app-bridge-react',
                '@shopify/polaris',
                '@remix-run/react',
                '@remix-run/node',
                '@remix-run/cloudflare'
            ],
            output: {
                preserveModules: true,
                entryFileNames: '[name].js',
                exports: 'named',
            },
        },
    },
});
