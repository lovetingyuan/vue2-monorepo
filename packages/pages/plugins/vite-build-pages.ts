import type { Plugin } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';
import assert from 'assert';

export default (): Plugin | null => {
  const rootDir = fileURLToPath(new URL('../', import.meta.url));
  const entryFile = 'pages.mjs';
  return {
    name: 'build-pages-plugin',
    apply: 'build',
    enforce: 'post',
    config() {
      return {
        build: {
          lib: {
            entry: path.resolve(rootDir, 'src/pages/index.ts'),
            formats: ['es'],
            fileName: () => entryFile,
          },
          cssCodeSplit: true,
        },
      };
    },
    renderChunk(code, chunk) {
      const { fileName, isDynamicEntry } = chunk;
      const { viteMetadata } = chunk as any;
      // vite wont inject css when build format is es
      if (fileName.endsWith('.js') && isDynamicEntry && viteMetadata) {
        return [...viteMetadata.importedCss].map((css) => `import "./${css}";`).join('\n') + code;
      }
    },
    async generateBundle(options, bundle) {
      const entry = bundle[entryFile];
      // eslint-disable-next-line no-param-reassign
      delete bundle[entryFile];
      assert(entry.type === 'chunk', 'assert error');
      const { default: pages } = await import(`data:text/javascript,${entry.code}`);
      Object.keys(pages).forEach((f) => {
        // ./index.js
        const pageChunk = pages[f].toString().match(/import\("(.+?)"\)/)?.[1];
        assert(typeof pageChunk === 'string');
        const file = f.replace('/index.vue', '.js'); // ./foo/bar.js
        const relativePath = path.relative(file, pageChunk); // ../../index.js
        this.emitFile({
          fileName: path.join('pages', file),
          type: 'asset',
          source: `export { default } from "${relativePath}"`,
        });
        this.emitFile({
          fileName: path.join('pages', file.replace('.js', '.d.ts')),
          type: 'asset',
          source: `export { default } from '${path.dirname(relativePath)}/page'`,
        });
      });
    },
  };
};
