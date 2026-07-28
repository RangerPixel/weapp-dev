# 样式（WXSS）

WXSS 编译基于 **Vite 的样式管道**，开发模式由 Vite Dev Server 提供样式热更新，产物扩展名自动从 `.css` 改为 `.wxss`。

## 支持的文件类型

Vite 按扩展名自动识别预处理器。其中 **`.scss` / `.sass` 与 `.postcss` 开箱即用**（所需依赖由 weapp-dev 的依赖链提供，无需手动安装）；**Less 需要自行安装 `less` 依赖**：

| 文件扩展名          | 需安装的依赖       |
| ------------------- | ------------------ |
| `.css`              | 内置，无需安装     |
| `.scss` / `.sass`   | 开箱即用，无需安装 |
| `.postcss`          | 开箱即用，无需安装 |
| `.less`             | `less`             |
| `.styl` / `.stylus` | `stylus`           |

::: tip 推荐
新项目推荐直接使用 **`.scss`**（或 `.postcss`），开箱即用、无需额外安装依赖。使用 `.less` 时才需要：

::: code-group

```bash [pnpm]
pnpm add -D less
```

```bash [npm]
npm install -D less
```

:::

:::

之后在 `src` 下直接编写 `app.scss`、`pages/index/index.scss` 等文件，构建后输出为同名 `.wxss`。

## 目录结构保持

WXSS 编译开启了 `preserveModules`，输出目录结构与源文件一一对应：

```
src/app.less                  →  dist/app.wxss
src/pages/index/index.less    →  dist/pages/index/index.wxss
```

因此小程序端按常规方式引用即可（`app.json` 无需声明全局样式路径，页面 JSON 的 `style` 引用也与原生一致）。

## 全局样式入口

`app.{css,less,scss,...}`（srcRoot 下任意受支持扩展名）会被识别为全局样式入口。使用 Tailwind 时它也是 Tailwind 指令的入口文件：

```less
// src/app.less
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 预处理器选项

通过 `css.preprocessorOptions` 传递（复用 Vite 样式管道，详见 [Vite 配置扩展](/config/vite#css-preprocessoroptions)）：

```ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "src/styles/mixins/index.less";`,
      },
    },
  },
});
```

## PostCSS

项目根目录的 `postcss.config.cjs`（或 `.js` 等）会被 Vite 自动加载。Tailwind CSS v3 即通过 PostCSS 接入：

```js
// postcss.config.cjs
module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## 开发模式的行为

- 启动时所有样式经 Vite Dev Server 编译并写入 dist；
- 修改样式文件后只重新编译该文件，毫秒级完成；
- 删除样式文件时自动删除 dist 中对应的 `.wxss`。

## 生产模式的行为

生产构建使用 Vite `build` 全量编译，产物压缩。

配置了 [CDN](/guide/assets-cdn) 时，WXSS 中 `url(/assets/...)` 形式的绝对路径会被自动改写为 CDN 地址。
