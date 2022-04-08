/* eslint-disable consistent-return */
import { type Plugin, searchForWorkspaceRoot, normalizePath } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import { parser } from '@vuese/parser';
import { Render } from '@vuese/markdown-render';

const docPort = process.env.DOC_PORT ? +process.env.DOC_PORT : 3033;
const initMD = `<Start :port="${docPort}" title="本文件由组件 doc 块和注释自动生成，勿直接修改。" />`;
const rootDir = searchForWorkspaceRoot(__dirname);

function exampleContainer(md: any, container: any) {
  // eslint-disable-next-line global-require
  md.use(container, 'example', {
    validate(params: string) {
      return params.trim().match(/^example\s+(.*)$/);
    },
    // eslint-disable-next-line consistent-return
    render(tokens: any[], idx: number) {
      const { info }: { info?: string } = tokens[idx];
      if (!info) {
        return '';
      }
      if (info.trim().startsWith('example ')) {
        const [, title, src] = info
          .trim()
          .split(' ')
          .map((v) => v.trim());
        return `\n<Example :port="${docPort}" title="${title}" src="${src}" />\n`;
      }
    },
  });
}

function docPlugin(): Plugin {
  const DocPath = 'apps/docs';
  const UIPath = 'packages/ui';
  const updateDoc = (compFile: string, docStr: string) => {
    const source = fs.readFileSync(compFile, 'utf-8');
    let docContent = '';
    try {
      const { content, componentName } = new Render(parser(source)).renderMarkdown() || {
        content: '\nAPI文档解析失败',
        componentName: 'N/A',
      };
      docContent = `# ${componentName}\n\n${docStr}\n\n${content.replace(/^#.+?\s/, '')}`;
    } catch (err: any) {
      console.error(err);
      docContent = `${docStr}\n\nAPI文档解析失败: \`${err?.message}\``;
    }
    const mdFile = compFile.replace(UIPath, DocPath).replace('.vue', '.md');
    const propsTs = path.resolve(path.dirname(compFile), 'props.ts');
    const finalMDContent = [initMD, docContent];
    if (fs.existsSync(propsTs)) {
      const docsDir = path.resolve(rootDir, DocPath);
      finalMDContent.push('<br>');
      finalMDContent.push(`::: details Props类型\n<<< ${path.relative(docsDir, propsTs)}\n:::`);
    }
    fs.outputFileSync(mdFile, finalMDContent.join('\n\n'));
  };

  return {
    name: 'generate-md-file',
    enforce: 'pre',
    config() {
      return {
        server: {
          port: docPort,
        },
      };
    },
    load(id) {
      if (/\/components\/[^/]+\/doc\/.+?\.vue$/.test(id)) {
        const code = fs.readFileSync(id, 'utf8');
        return `${code}\n<code>/* source code */</code>`;
      }
    },
    transform(code, id) {
      if (/vue&type=code/.test(id)) {
        const [file] = id.split('?');
        return `
        export default sfc => {
          if (import.meta.env.DEV) {
            sfc.options.file = ${JSON.stringify(normalizePath(file))}
            window.dispatchEvent(
              new CustomEvent('__code_update__', {
                detail: { file: sfc.options.file },
              })
            )
          } else {
            sfc.options.code = ${JSON.stringify(fs.readFileSync(file, 'utf8'))}
          }
        }`;
      }
      if (/vue&type=doc/.test(id)) {
        updateDoc(id.split('?')[0], code.trim());
        return 'export default {}';
      }
    },
  };
}

function initMDPlugin(): Plugin {
  return {
    name: 'init-components-markdown',
    apply: 'serve',
    resolveId(id) {
      if (/^\/components\/.+?\/.+?\.md$/.test(id)) {
        const mdFile = path.resolve(rootDir, 'apps/docs', `.${id}`);
        if (!fs.existsSync(mdFile)) {
          fs.outputFileSync(mdFile, initMD);
          return mdFile;
        }
      }
    },
  };
}

export { docPlugin, initMDPlugin, exampleContainer };
