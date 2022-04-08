## @yxfe/maya-core

支持配置化的方式开发页面

* `@yxfe/maya-core` 提供了 `<maya-page />` 组件，它接收配置并渲染配置的页面

* `maya-page`会根据配置的 `version` 动态加载对应版本的 `maya-renderer`

* `maya-renderer` 会真正的去渲染配置的页面


### 用法：
```html
<maya-page :local-config="config"></maya-page>
<script>
  export default {
    data() {
      return {
        config: {
          title: 'page',
          components: [{
            type: 'pro-table',
            props: {}
          }]
        }
      }
    }
  }
</script>
```
