/// <reference types="vite/client" />

import DefaultTheme from 'vitepress/theme'

import type { Theme } from 'vitepress'

import './custom.css'
import Example from './stage.vue'
import Start from './start.vue'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // register global components
    app.component('Example', Example)
    app.component('Start', Start)
    if (!import.meta.env.SSR) {
      window.addEventListener('message', e => {
        if (e.data && e.data.height && e.data.href) {
          const iframe = document.querySelector<HTMLIFrameElement>(`iframe[src="${e.data.href}"]`)
          if (iframe) {
            iframe.style.height = `${parseInt(e.data.height, 10) + 2}px`
          }
        }
      })
    }
  }
}

export default theme
