import {
  defineConfig, type UserConfig, type ConfigEnv, searchForWorkspaceRoot
} from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import { createVuePlugin as vue2 } from 'vite-plugin-vue2';
import vs from 'rollup-plugin-visualizer';
import { docPlugin } from 'vite-plugin-docs';
import injectCss from './plugins/vite-plugin-inject-css';
import buildUmd from './plugins/vite-plugin-umd';

const root = searchForWorkspaceRoot(__dirname);
const componentsDir = resolve(__dirname, 'components');

const getConfig = (env: ConfigEnv): UserConfig => {
  if (env.command === 'serve') {
    return {
      plugins: [
        vue2({
          jsx: true,
        }),
        docPlugin(),
      ],
    };
  }
  if (process.argv.includes('docs')) {
    return {
      base: './',
      plugins: [
        vue2({
          jsx: true,
        }),
        docPlugin(),
      ],

      build: {
        emptyOutDir: true,
        outDir: resolve(root, 'apps/docs/public/scene'),
      },
    };
  }
  return {
    plugins: [
      vue2({
        jsx: true,
      }),
      docPlugin(),
      vs((options) => {
        return {
          filename:
            typeof options.entryFileNames === 'string' ? `stats/${options.entryFileNames}.html` : 'stats/index.html',
        };
      }),
      injectCss(),
      buildUmd({
        config: getConfig.bind(null, env),
        entries: readdirSync(componentsDir).map((f) => resolve(componentsDir, f)),
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'index.ts'),
        name: 'HydraUI',
        fileName: (format) => `ui.${format}.js`,
      },
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: ['vue'], // TODO: filter all dependencies and peer deps
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  };
};

export default defineConfig(getConfig);
