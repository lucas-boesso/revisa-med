import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const repositoryName=process.env.GITHUB_REPOSITORY?.split('/')[1]??'';

export default defineConfig({
  base:repositoryName?`/${repositoryName}/`:'/',
  plugins:[react()],
  resolve:{alias:{'@':path.resolve(import.meta.dirname)}},
  build:{outDir:'dist-pages',emptyOutDir:true},
});
