https://juejin.cn/post/7473045467452555299#heading-0

### 核心原理：SVG Sprite

**是什么？**
SVG Sprite 是一种将多个 SVG 图标整合到一个 SVG 文件（即 Sprite Sheet）中的技术。这个整合后的 SVG 文件定义了一个“符号库”，每个图标都被定义为一个 `<symbol>` 元素，并拥有唯一的 `id`。

**基本原理：**

1.  **合并：** 将多个独立的 `.svg` 文件合并成一个大的 SVG 文件。
2.  **符号化：** 每个图标被包裹在 `<symbol id="icon-name">...</symbol>` 标签中。`<symbol>` 元素本身不会被显示，它只是一个模板。
3.  **使用：** 在 HTML 的任何地方，通过 `<use>` 元素来引用并实例化这些符号。
    ```html
    <svg>
      <use xlink:href="#icon-name"></use>
      <!-- 现代SVG规范也支持直接使用 href -->
      <use href="#icon-name"></use>
    </svg>
    ```

**优势：**

- **减少 HTTP 请求：** 所有图标都在一个文件中，只需一次请求，性能优异。
- **可缓存性：** 单独的 SVG 文件可以被浏览器缓存，后续页面加载更快。
- **灵活性：** 可以通过 CSS 轻松控制图标的颜色、大小等样式（对于内联的 `use` 引用）。
- **可访问性：** 可以更好地添加 `aria-label` 等属性。

### 配套构建工具/插件

在现代化构建工具（如 Webpack, Vite）中，我们不再手动合并 SVG Sprite，而是通过插件在编译时自动完成。

#### svg-sprite-loader

- **角色：** **Webpack** 生态中的 SVG Sprite **自动化生成**插件。
- **作用：** 它拦截 Webpack 对 SVG 文件的导入（`import './icon.svg'`），自动将这些 SVG 合并成一个 Sprite Sheet，并将其注入到最终的 HTML 页面中。然后，它让你导入的不是文件内容，而是一个象征性的 `symbolId`。
- **工作流程：**
  1.  你写：`import Icon from './icon.svg’;`
  2.  编译时，`svg-sprite-loader` 处理这个导入，将 `icon.svg` 处理成 Sprite 中的一个 `<symbol>`。
  3.  它让你可以通过 `Icon` 这个变量拿到这个符号的 `id`（例如 `‘#icon-svg’`）。
  4.  你在组件中：`<svg><use xlinkHref={Icon} /></svg>`
  5.  构建完成后，插件会自动将包含所有 `<symbol>` 的 SVG Sprite 注入到 `index.html` 的底部。

#### vite-plugin-svg-icons

- **角色：** **Vite** 生态中的 SVG Sprite **自动化生成**插件，是 `svg-sprite-loader` 的 Vite 版本。
- **作用：** 与 `svg-sprite-loader` 类似，但用于 Vite。它会在开发阶段预生成 Sprite，并在生产构建时将其内联到 HTML 中或打包成独立文件。
- **使用：**

  ```javascript
  // vite.config.js
  import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

  export default defineConfig({
    plugins: [
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/icons')], // 指定图标目录
        symbolId: 'icon-[dir]-[name]' // 定义 symbolId 格式
      })
    ]
  })
  ```

  ```javascript
  // 在你的组件中，通过虚拟模块引入
  import 'virtual:svg-icons-register'; // 负责注入 Sprite DOM
  import SvgIcon from './SvgIcon.vue’; // 一个你自己封装的通用图标组件

  // 在模板中：<SvgIcon name="icon-dir-name” />
  ```

### `vite-plugin-svg-icons` / `svg-sprite-loader` 是如何工作的？

你的理解完全正确：**它们会在编译阶段把你 `import` 的 SVG 文件都转换成 `<symbol>`，并在运行时将这个包含所有 symbol 的大 SVG 标签注入到 HTML 的 DOM 中。**

**工作原理分步解析：**

1.  **编译时（Build Time）：**

    - 你通过 `import './icon.svg'` 或指定目录告诉插件：“这些是我要用的图标”。
    - 插件（无论是 Vite 还是 Webpack 的）会读取这些 SVG 文件。
    - 使用 **SVGO** 对每个 SVG 进行优化压缩。
    - 将每个优化后的 SVG 代码包裹在一个 `<symbol id="unique-id">...</symbol>` 标签中。
    - 把所有 `<symbol>` 合并成一个大的 `<svg>` 元素，这个元素默认是隐藏的（`style="display: none;"`）。

2.  **运行时（Runtime）：**
    - 构建工具会生成一段 JavaScript 代码，这段代码的唯一作用就是在浏览器中运行，并将上一步生成的大 SVG 标签（即 Sprite Map）**动态插入**到你的 HTML 文档的末尾（通常是 `<body>` 的最后）。
    - 你的业务代码中，会通过 `<use xlink:href="#unique-id">` 来引用对应的 symbol。
    - 浏览器看到 `<use>` 标签，会去整个 DOM 树里寻找 `id="unique-id"` 的 `<symbol>`，找到后就把它的内容“克隆”并渲染到 `<use>` 的位置。

##### Demo 效果演示

假设我们有两个 SVG 文件：
`src/icons/user.svg`
`src/icons/email.svg`

**1. 项目配置（以 `vite-plugin-svg-icons` 为例）**

```javascript
// vite.config.js
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default {
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'src/icons')], // 指定图标目录
      symbolId: 'icon-[name]' // 定义 symbol 的 id 格式，[name] 是文件名
    })
  ]
}
```

**2. 在组件中使用**

```vue
<!-- MyComponent.vue -->
<template>
  <div>
    <svg><use href="#icon-user"></use></svg>
    <svg><use href="#icon-email"></use></svg>
  </div>
</template>

<script setup>
  // 必须引入这个！它的作用就是执行那段“注入SVG Sprite到DOM”的代码
  import 'virtual:svg-icons-register'
</script>
```

**3. 在浏览器中查看最终生成的 HTML**
当你的项目运行起来后，打开浏览器检查元素，你会看到在 `<body>` 的最底部，插件自动生成了这样的结构：

```html
<!DOCTYPE html>
<html>
  <head
    >...</head
  >
  <body>
    <div id="app">...</div>
    <!-- 你的Vue/React应用挂载在这里 -->

    <!-- 这是插件自动注入的SVG Sprite DOM -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      style="display: none;"
    >
      <symbol id="icon-user" viewBox="0 0 1024 1024">
        <!-- 优化后的user.svg的路径(path)数据在这里 -->
      </symbol>
      <symbol id="icon-email" viewBox="0 0 1024 1024">
        <!-- 优化后的email.svg的路径数据在这里 -->
      </symbol>
    </svg>
  </body>
</html>
```

**4. 实际渲染出的 DOM**
在你的组件位置，浏览器会渲染出如下内容：

```html
<div>
  <svg><use href="#icon-user" xlink:href="#icon-user">...</use></svg>
  <svg><use href="#icon-email" xlink:href="#icon-email">...</use></svg>
</div>
```

浏览器会自动将 `<symbol>` 里的内容“实例化”到 `<use>` 的位置，最终你就看到了图标。

#### 核心问题解答：为什么不用简单的 `<img>`？

**简短回答：** 为了获得 **SVG 的全部强大能力**，而 `<img>` 标签会阉割这些能力。

**详细对比：**

| 特性         | `<img src="icon.svg">`                                                  | **SVG Sprite (`<use>`) / 内联 SVG**                                                             |
| :----------- | :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **颜色控制** | ❌ 无法通过 CSS 改变颜色。你必须准备不同颜色的多份图片文件。            | ✅ **完全可控**。可以通过 CSS 的 `color` 或 `fill` 属性轻松改变颜色，实现悬停效果、主题切换等。 |
| **交互性**   | ❌ 无法为图标内部添加交互（如点击、悬停动画）。                         | ✅ **完全支持**。可以给 SVG 内部的路径（`<path>`）添加鼠标事件、CSS 动画。                      |
| **可访问性** | 一般，依赖 `alt` 文本。                                                 | ✅ **更优秀**。可以给每个 `symbol` 或内联 SVG 添加详细的 `<title>`, `<desc>` 和 `aria-*` 属性。 |
| **请求数量** | **每个图标一个 HTTP 请求**，即使有 HTTP/2，大量图标仍可能成为性能瓶颈。 | ✅ **一个请求**（Sprite 方案）。所有图标都在一个文件里，极大减少请求数。内联方案则无额外请求。  |
| **缓存**     | 可以缓存，但每个图标文件独立缓存。                                      | ✅ **缓存效率极高**（Sprite 方案）。一个 Sprite 文件缓存，全站受益。                            |
| **SEO**      | 一般，搜索引擎对图片内容的理解有限。                                    | ✅ **更友好**。内联的 SVG 代码是文本，可以被搜索引擎读取和理解。                                |

**结论 1：** 当你需要**动态颜色、交互效果、最佳性能（减少请求）** 时，`<img>` 方案就无法满足需求了。SVG Sprite 或内联 SVG 是更高级、更专业的解决方案。

**结论 2：** 对于简单的、无需变色的 logo 类图片，`<img>` 依然是很好的选择；但对于 UI 交互系统中的图标，SVG Sprite 或内联组件方案是毫无疑问的更优解。
