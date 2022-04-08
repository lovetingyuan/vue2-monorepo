## config-page

支持配置化的方式开发页面

- `config-page` 提供了 `<config-page />` 组件，它接收配置并渲染配置的页面

- `page`会根据配置的 `version` 动态加载对应版本的 `renderer`

- `renderer` 会真正的去渲染配置的页面

### 用法：

```html
<page :local-config="config"></page>
<script>
  export default {
    data() {
      return {
        config: {
          title: 'page',
          components: [
            {
              type: 'pro-table',
              props: {},
            },
          ],
        },
      };
    },
  };
</script>
```
