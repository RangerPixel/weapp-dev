# weapp-dev

> 小程序原生开发增强工具

基于 Vite + tsdown（rolldown）的小程序构建工具链，让原生微信小程序项目获得现代化开发体验：TypeScript、Tailwind CSS、Less/Sass、npm 依赖、静态资源 CDN、增量热更新。

## 功能特性

- **TypeScript 支持**：基于 `tsdown`（rolldown 驱动）快速编译，开发模式 watch 增量编译
- **Vite 集成**：基于 Vite 的 WXSS 编译管道与开发服务器
- **Tailwind CSS**：内置 `weapp-tailwindcss`（v3 版本线），WXML 类名自动转义
- **预处理器**：支持 Less/Scss 等 CSS 预处理器
- **npm 依赖**：基于 `miniprogram-ci` 自动构建 npm 包
- **分包支持**：自动识别小程序分包结构进行代码拆分
- **静态资源 CDN**：包内静态资源外置到 CDN，减少主包体积
- **热更新**：快速的增量编译与热更新体验

## 安装

```bash
pnpm add -D weapp-dev
# 或
npm install -D weapp-dev
```

## 快速开始

在项目根目录创建 `vite.config.ts`：

```ts
import { defineConfig } from "weapp-dev/config";

export default defineConfig({
  weapp: {
    srcRoot: "src", // app.json 所在目录
    outDir: "dist", // 输出目录
  },
});
```

配置 `package.json` scripts 后即可开始开发：

```json
{
  "scripts": {
    "dev": "weapp-dev dev",
    "build": "weapp-dev build"
  }
}
```

## 文档

详细文档请访问：**[weapp-dev 文档站](https://reysun.github.io/weapp-dev/)**

## 注意事项

> ⚠️ **本工具处于 Beta 阶段**，API 和功能可能会发生变化，请谨慎在生产环境中使用。

## 许可证

MIT
