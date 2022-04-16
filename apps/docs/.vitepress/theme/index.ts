import DefaultTheme from 'vitepress/theme'

import type { Theme } from 'vitepress'

import './custom.css'
import Example from './stage'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component(Example.name, Example)
  }
}

export default theme
