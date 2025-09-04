# SVG Symbol 示例说明

## 原始 SVG 文件

假设我们有一个简单的 SVG 图标文件 `home.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
</svg>
```

## 转换为 SVG Symbol 后的样子

通过 SVGCompiler 转换后，会变成类似这样的 Symbol:

```xml
<symbol id="icon-home" viewBox="0 0 24 24">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
</symbol>
```

## 使用方式

然后在 HTML 中，我们会将所有 Symbol 包装在一个隐藏的 SVG 元素中：

```html
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     style="position: absolute; width: 0; height: 0;" id="__svg__icons__dom__">
  <symbol id="icon-home" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </symbol>
  <symbol id="icon-user" viewBox="0 0 24 24">
    <!-- 用户图标的路径 -->
  </symbol>
  <!-- 更多图标... -->
</svg>
```

## 在组件中使用

之后就可以在任何地方通过 `<use>` 标签引用这些图标：

```html
<!-- 使用 home 图标 -->
<svg>
  <use xlink:href="#icon-home" />
</svg>

<!-- 使用 user 图标 -->
<svg>
  <use xlink:href="#icon-user" />
</svg>
```

这种方式的优势是:
1. 所有图标都在一个地方管理
2. 图标可以被重复使用而不会增加额外的HTTP请求
3. 可以通过CSS统一控制图标的颜色（通过 `stroke="currentColor"`）