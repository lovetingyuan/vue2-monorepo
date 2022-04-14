import Vue, { type Component } from 'vue'

type Pages = Record<string, (() => Promise<{ default: Component }>) | null>;

const pages = import.meta.glob('/src/pages/**/index.vue') as Pages

Object.keys(pages).forEach((k) => {
  const path = k.replace('/src/pages', '').replace('/index.vue', '.html')
  pages[path] = pages[k]
  delete pages[k]
})

const NotFoundPage: Component = {
  name: 'NotFoundPage',
  render(h) {
    const urls = Object.keys(pages)
    return h('div', {
      domProps: {
        innerHTML: `
          <h4>${window.location.pathname === '/' ? '' : '页面地址错误，'}可用的路由如下：</h4>
          <ol>
            ${urls.length
    ? urls
      .map((path) => {
        return `<li> <p><a href="${path}">${path}</a></p> </li>`
      })
      .join('')
    : '<p>暂无，需要在/src/pages下新建index.vue页面</p>'
}
          </ol>
        `,
      },
    })
  },
}

let loadingHtml = '<h3 style="text-indent: 2em;">加载中，请稍候...</h3>'
try {
  // 一旦根实例被创建，根节点就变成了一个comment节点然后等待渲染
  const root = document.getElementById('app')
  if (root && root.childElementCount) {
    loadingHtml = root.innerHTML
  }
} catch (e) {
  /** */
}

const LoadingPage: Component = Vue.extend({
  name: 'LoadingPage',
  render(h) {
    return h('div', {
      domProps: {
        innerHTML: loadingHtml,
      },
    })
  },
})

const ErrorPage: Component = {
  name: 'ErrorPage',
  render(h) {
    return h(
      'h4',
      {
        style: 'text-indent: 2em',
      },
      ['抱歉，系统发生错误.']
    )
  },
}

console.log(
  '%cBuild by vite   ',
  'color: #646cff; background: no-repeat right/12px url("https://vitejs.dev/logo.svg");'
)

// https://vuejs.org/v2/guide/components-dynamic-async.html
function Page() {
  const PageComponent = (pages[window.location.pathname]?.() || Promise.resolve(NotFoundPage)).then((val) => {
    if ('dispatchEvent' in document && window.CustomEvent) {
      document.dispatchEvent(
        new CustomEvent('PageLoaded', {
          detail: {
            page: val,
            pages,
          },
        })
      )
    }
    return val
  })
  return {
    component: PageComponent,
    loading: LoadingPage,
    error: ErrorPage,
  }
}

Page.toString = function toString() {
  return `pages${window.location.pathname.replace('.html', '/index.vue')}`
}

export default Page
