# 快速开始

## 环境要求

- Node.js **>= 24**
- 一个用微信开发者工具创建的小程序项目（根目录有 `project.config.json`）

## 安装

::: code-group

```bash [pnpm]
pnpm add -D weapp-dev
```

```bash [npm]
npm install -D weapp-dev
```

:::

## 项目结构

`weapp-dev` 对项目结构的要求很简单：`project.config.json` 与源码目录同级，源码目录（默认 `src`）内有 `app.json`。

```
project/
├── project.config.json     # 必须存在，与 src 同级
├── src/                    # 源码目录（可通过 srcRoot 修改）
│   ├── app.ts
│   ├── app.json
│   ├── app.scss            # 全局样式，推荐 scss（开箱即用，见 样式 章节）
│   └── pages/
│       └── index/
│           ├── index.ts
│           ├── index.json
│           ├── index.wxml
│           └── index.scss
├── package.json            # dependencies 中的依赖会被自动构建 npm
├── vite.config.ts          # weapp-dev 配置文件
└── dist/                   # 构建输出目录
```

::: tip 样式文件推荐 scss
`.scss` / `.sass` / `.postcss` **开箱即用**，无需安装额外依赖；`.less` 需要自行安装 `less`。详见 [样式（WXSS）](/guide/styling#支持的文件类型)。
:::

::: tip 使用 miniprogram 目录？
如果源码目录叫 `miniprogram` 而不是 `src`，且你没有显式配置 `srcRoot`，`weapp-dev` 会**自动识别**并切换，无需额外配置。
:::

::: warning project.config.json 的 miniprogramRoot
构建完成后 `weapp-dev` 会检查 `project.config.json` 中的 `miniprogramRoot` / `srcMiniprogramRoot` 是否与 `outDir` 一致。如果不匹配会打印警告，建议将其配置为 `"dist/"`，否则微信开发者工具无法识别构建产物。
:::

## 创建配置文件

在项目根目录创建 `vite.config.ts`：

```ts
import { defineConfig } from "weapp-dev/config";

export default defineConfig({
  weapp: {
    srcRoot: "src", // app.json 所在目录，默认 'src'
    outDir: "dist", // 输出目录，默认 'dist'
  },
});
```

`defineConfig` 只是为配置提供类型提示，配置对象本身在 Vite 的 `UserConfig` 上扩展了 `weapp` 字段。

## 配置 scripts

```json
{
  "scripts": {
    "dev": "weapp-dev dev",
    "build": "weapp-dev build"
  }
}
```

## 启动开发

```bash
pnpm dev
```

开发模式会：

1. 执行一次全量构建（npm → WXSS → WXML → 复制 → TS）；
2. 启动 Vite Dev Server 监听文件变更；
3. 后续修改只增量编译受影响的文件（详见[构建流程](/guide/build-pipeline#开发模式的增量更新)）。

然后在微信开发者工具中把项目目录（`miniprogramRoot` 指向 `dist/`）打开即可预览。

## 生产构建

```bash
pnpm build
```

输出到 `dist/`，样式与 TS 均会被压缩，CDN 路径使用 `cdn.url` 前缀。

## 接下来

- 配置 Tailwind CSS → [Tailwind CSS 指南](/guide/tailwindcss)
- 使用 Less/Sass → [样式（WXSS）](/guide/styling)
- 拆分主包体积 → [npm 依赖](/guide/npm) 与 [静态资源 CDN](/guide/assets-cdn)
- 完整配置说明 → [weapp 配置](/config/weapp)

## 示例项目

仓库内置了完整示例，可以直接参考：

- [`examples/basic-ts-tw`](https://github.com/ReySun/weapp-dev/tree/main/examples/basic-ts-tw) — TypeScript + Less + Tailwind CSS + Vant Weapp
- [`examples/asset-replace`](https://github.com/ReySun/weapp-dev/tree/main/examples/asset-replace) — 静态资源 CDN 外置示例
