# Vite 配置扩展

`vite.config.ts` 根层级目前**仅兼容以下 Vite 配置字段**，其余字段一律不生效，请勿使用。

## env

- **类型：** `Record<string, any>`

编译时环境变量，可通过 `import.meta.env` 或 `process.env` 访问。

```ts
export default defineConfig({
  env: {
    DEBUG: true,
  },
});
```

## envFile

- **类型：** `string`

指定 `.env` 文件路径，如 `.env.production`。默认加载项目根目录的 `.env`。

## envPrefix

- **类型：** `string | string[]`
- **默认：** `['VITE_', 'TSDOWN_']`

以此前缀开头的环境变量会暴露到小程序源码中（通过 `import.meta.env` 访问）。

```ts
export default defineConfig({
  envPrefix: ["APP_", "VITE_"],
});
```

## define

- **类型：** `Record<string, any>`

全局常量替换，构建期静态替换（透传给 tsdown）。

```ts
export default defineConfig({
  define: {
    __VERSION__: JSON.stringify("1.0.0"),
  },
});
```

之后可在源码中直接使用 `__VERSION__`，并建议在 `typings` 中声明：

```ts
declare const __VERSION__: string;
```

## server

- **类型：** `Vite ServerOptions`

开发服务器配置。常用的是 `port`；`host` 默认强制为 `true`（允许局域网访问，方便手机真机预览），可显式设置为 `false` 关闭。

```ts
export default defineConfig({
  server: {
    port: 3000,
    open: false, // 小程序开发不需要打开浏览器
  },
});
```

## resolve.alias

- **类型：** `Record<string, string>`（推荐）或 Vite alias 数组

路径别名，作用于 **TS 编译**（tsdown）。配置项来自 Vite 的 `UserConfig`，weapp-dev 会读取并透传给 tsdown。

**推荐使用对象形式**，与 tsdown 的 alias 配置保持一致：

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizePath } from "vite";
import { defineConfig } from "weapp-dev/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": normalizePath(fileURLToPath(new URL("./src", import.meta.url))),
    },
  },
});
```

::: warning 数组形式的限制
使用数组形式时，weapp-dev 内部会将其**自动转换为对象形式**后传给 tsdown：`find` 为字符串的条目会转换为 `{ [find]: replacement }`；`find` 为**正则表达式**的条目不受 tsdown 支持，会被跳过并输出警告。为保证行为一致，请优先使用对象形式。
:::

## css.preprocessorOptions

虽然不在显式兼容列表中，但由于 WXSS 编译直接复用 Vite 的样式管道，`css.preprocessorOptions`（如 Less 的 `additionalData`）实际可用：

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

::: tip 推荐：主题与常用函数优先用 Tailwind 表达
项目使用 Tailwind CSS 时，**主题配置（颜色、间距、字体等设计令牌）和常用样式片段推荐写在 `tailwind.config.js` 的 `theme` 中**，而不是分散到 Less/Sass 变量和 mixin 里：

```js
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      theme: {
        500: "#e2281a",
        DEFAULT: "#e2281a",
      },
    },
    extend: {},
  },
};
```

之后在 WXML 中直接用 `bg-theme-500`、`text-theme` 等类名，既享受 weapp-tailwindcss 的按需生成与类名缓存带来的增量编译速度，也避免预处理器变量与 Tailwind 主题两处维护的不一致。

`css.preprocessorOptions` 仍可用于 Tailwind 无法覆盖的场景。
:::
