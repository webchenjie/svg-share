# HTML 注入机制说明

## 开发模式 vs 构建模式的注入方式

### 开发模式下的注入

在开发模式下，HTML 注入是**动态运行时注入**：

1. 浏览器请求页面时，Vite Dev Server 启动
2. 当代码执行到 `import 'virtual:svg-icons-register'` 时
3. 虚拟模块返回的 JavaScript 代码在浏览器中执行
4. 该代码动态创建一个 SVG 元素并插入到 DOM 中

```javascript
// 这段代码在浏览器中运行
if (typeof window !== 'undefined') {
  function loadSvg() {
    var body = document.body;
    var svgDom = document.getElementById('__svg__icons__dom__');
    if(!svgDom) {
      svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgDom.style.position = 'absolute';
      svgDom.style.width = '0';
      svgDom.style.height = '0';
      svgDom.id = '__svg__icons__dom__';
      svgDom.setAttribute('xmlns','http://www.w3.org/2000/svg');
      svgDom.setAttribute('xmlns:link','http://www.w3.org/1999/xlink');
    }
    // 动态设置 innerHTML
    svgDom.innerHTML = "<symbol>...</symbol><symbol>...</symbol>";
    body.insertBefore(svgDom, body.lastChild);
  }
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSvg);
  } else {
    loadSvg()
  }
}
```

### 构建模式下的注入

在构建模式下，注入发生在**构建时**：

1. Vite 构建过程中，插件处理所有资源
2. SVG 图标被处理并转换为 Symbol
3. 最终生成的 HTML 文件中直接包含 SVG 元素

```html
<!-- 构建后的 index.html 可能是这样 -->
<!DOCTYPE html>
<html>
<head>...</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
  
  <!-- 构建时注入的 SVG Symbols -->
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
       style="position: absolute; width: 0; height: 0;" id="__svg__icons__dom__">
    <symbol id="icon-home">...</symbol>
    <symbol id="icon-user">...</symbol>
    <!-- 所有图标 symbols -->
  </svg>
</body>
</html>
```

## 代码中的判断逻辑

在 `load` 函数中有这样的判断：

```javascript
async load(id, ssr) {
  // 在开发模式下（非构建且非SSR）直接返回null，不处理
  if (!isBuild && !ssr)
    return null;
    
  // 只在构建时或者SSR时才处理虚拟模块
  // ...
}
```

但这不意味着开发模式下不注入 HTML，而是通过 `configureServer` 中间件来处理：

```javascript
configureServer: ({ middlewares }) => {
  // 开发服务器中间件处理虚拟模块请求
  // 当浏览器请求虚拟模块时，动态生成内容返回
}
```

## 总结

两种模式都会实现 SVG 图标注入，但方式不同：

- **开发模式**：运行时动态注入，支持热更新
- **构建模式**：构建时静态注入，最终产物包含实际的 SVG 代码

这样既保证了开发时的便利性（热更新），又保证了生产环境的性能（静态内容）。