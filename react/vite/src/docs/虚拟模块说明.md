# 虚拟模块说明

## 什么是虚拟模块

虚拟模块是 Vite 的一个重要特性，它允许插件创建"虚拟文件"，这些文件实际上并不存在于文件系统中，
但可以像普通模块一样被导入和使用。

在 vite-plugin-svg-icons 插件中，有两个虚拟模块：
1. `virtual:svg-icons-register` - 用于注册 SVG 图标
2. `virtual:svg-icons-names` - 导出所有可用图标名称的列表

## 虚拟模块的作用

### virtual:svg-icons-register
这个模块包含将 SVG Symbol 注入到 DOM 中的代码。当导入这个模块时，它会在浏览器中执行一段 JavaScript 代码，
这段代码会创建一个隐藏的 SVG 元素，并将所有图标插入其中。

### virtual:svg-icons-names
这个模块导出一个包含所有可用图标名称的数组，方便在代码中使用和验证图标名称。

## 使用示例

```javascript
// 在项目入口文件中导入（如 main.tsx）
import 'virtual:svg-icons-register'

// 在组件中可以导入图标名称列表进行验证
import svgIconNames from 'virtual:svg-icons-names'

console.log('Available icons:', svgIconNames)
```

## 为什么主要在开发模式下使用

实际上，虚拟模块在开发和构建模式下都会使用，但机制略有不同：

1. **开发模式**：
   - 通过 `configureServer` 中间件动态提供虚拟模块内容
   - 支持热更新，当 SVG 文件发生变化时可以实时更新

2. **构建模式**：
   - 在构建时生成实际的代码并替换虚拟模块导入
   - 这样最终的构建产物中不包含虚拟模块，而是实际的 JavaScript 代码

这种设计的优势是：
1. 开发时提供了便利的模块化导入方式
2. 构建时转换为实际代码，避免运行时依赖虚拟模块系统
3. 保持了开发和生产环境的一致性