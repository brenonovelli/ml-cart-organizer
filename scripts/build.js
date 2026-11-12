import { build } from 'vite';
import { resolve } from 'path';

const rootDir = resolve(import.meta.dirname, '..');

async function runBuild() {
  console.log('Building popup & background...');
  await build({
    configFile: false,
    root: rootDir,
    publicDir: resolve(rootDir, 'public'),
    build: {
      outDir: resolve(rootDir, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          background: resolve(rootDir, 'src/background/index.ts'),
          popup: resolve(rootDir, 'popup.html')
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    }
  });

  console.log('Building content script (IIFE - self-contained)...');
  await build({
    configFile: false,
    root: rootDir,
    publicDir: false,
    build: {
      outDir: resolve(rootDir, 'dist'),
      emptyOutDir: false,
      lib: {
        entry: resolve(rootDir, 'src/content/index.ts'),
        name: 'MLCartOrganizer',
        formats: ['iife'],
        fileName: () => 'content.js'
      }
    }
  });

  console.log('Build completed successfully!');
}

runBuild().catch((err) => {
  console.error(err);
  process.exit(1);
});
