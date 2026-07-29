# weapp 配置

`vite.config.ts` 中 `weapp` 字段的全部配置项。所有字段均为可选，下表标注了默认值。

## srcRoot

- **类型：** `string`
- **默认：** `'src'`

应用入口目录，即 `app.json` 所在目录。

当 `srcRoot` 保持默认值 `'src'` 但项目根目录下没有 `src` 文件夹、却存在 `miniprogram` 文件夹时（微信开发者工具默认 TS 模板结构），会**自动切换**为 `'miniprogram'`。

## outDir

- **类型：** `string`
- **默认：** `'dist'`

构建输出目录。构建完成后会校验 `project.config.json` 中的 `miniprogramRoot` / `srcMiniprogramRoot` 是否指向该目录，不匹配时输出警告。

## emptyOutDir

- **类型：** `boolean`
- **默认：** `true`

每次构建前是否清空输出目录。

## logLevel

- **类型：** `'info' | 'warn' | 'error' | 'silent'`
- **默认：** `'info'`

日志级别（沿用 Vite 的 `LogLevel`）。

## platform

- **类型：** `'weapp'`
- **默认：** `'weapp'`

目标平台，决定输出的文件扩展名（`.wxml` / `.wxss` 等）。

::: warning 仅支持微信小程序
目前**仅支持 `weapp`（微信小程序）**，请勿配置其他值。

其他平台在待支持计划中：

- `alipay`（支付宝小程序，`.axml` / `.acss`）
- `tt`（抖音小程序，`.ttml` / `.ttss`）
  :::

## format

- **类型：** `'esm' | 'cjs'`
- **默认：** `'esm'`

TS 输出格式。推荐保持默认 `esm` 以获得更好的 tree-shaking，并在微信开发者工具中开启「增强编译」或「ES6 转 ES5」来保证运行兼容。

## copy

- **类型：** `CopyOptions | CopyOptionsFn`
- **默认：** `undefined`

静态文件复制配置，语法与 [tsdown 的 copy 配置](https://tsdown.dev/options/config-file)完全一致：

```ts
export default defineConfig({
  weapp: {
    copy: [
      "src/assets", // 目录简写
      "src/env.d.ts", // 单文件
      { from: "src/assets", to: "dist/assets" },
      { from: "src/styles/**/*.css", to: "dist", flatten: true },
    ],
  },
});
```

与 tsdown 不同的是：开发模式下会监听文件系统，**新增的匹配文件也会增量复制**。

::: warning
`js` / `wxs` / `json` 文件已由内部逻辑处理（自动复制 + 组件自动注册），配置 `copy` 时**不要**包含这类文件，避免重复处理。
:::

## weappTwConfig

- **类型：** `WeappDevTwConfig`（[weapp-tailwindcss](https://www.npmjs.com/package/weapp-tailwindcss) 配置 + `enable` 字段）
- **默认：**

```ts
{
  customAttributes: {
    "*": [/[a-z]+Class|[^-\s]+-class|className/],
  },
  logLevel: "silent",
}
```

weapp-tailwindcss 的完整配置，详见 [官方文档](https://tw.icebreaker.top/docs/api/options/important)。

Tailwind 的启用条件是自动检测的（满足任一）：

1. 项目根目录存在 `tailwind.config.{js,ts,mjs,cjs}`；
2. `package.json` 的 `dependencies` / `devDependencies` 中包含 `tailwindcss`。

未检测到 Tailwind 时此配置不生效，WXML 类名转义与 WXSS Tailwind 生成均会跳过。也可显式设置 `weappTwConfig.enable: false` 强制关闭。

常用字段示例：

```ts
export default defineConfig({
  weapp: {
    weappTwConfig: {
      rem2rpx: true, // rem 自动转 rpx
      customAttributes: {
        "*": [/[a-z]+Class|[^-\s]+-class|className/],
      },
      cssEntries: [
        // @import "weapp-tailwindcss" 所在入口样式的绝对路径
        "/absolute/path/to/src/app.less",
      ],
    },
  },
});
```

完整接入步骤见 [Tailwind CSS 指南](/guide/tailwindcss)。

## npm

- **类型：** `WeappDevNpmConfig`

npm 依赖构建配置，详见 [npm 依赖指南](/guide/npm)。

```ts
interface WeappDevNpmConfig {
  /**
   * 是否启用 npm 构建
   * @default true
   */
  enable?: boolean;
  /**
   * 是否缓存 npm 构建结果
   * @default true
   */
  cache?: boolean;
  /**
   * 主包依赖
   * @deprecated 无需配置，package.json 的 dependencies 会自动加入主包
   */
  mainPackage?: { dependencies: string[] };
  /**
   * 子包依赖：这些依赖只打进对应子包，并从主包移除
   * @example { sub1: { dependencies: ['mp-html'] } }
   */
  subPackages?: Record<string, { dependencies: string[] }>;
}
```

配置示例：

```ts
export default defineConfig({
  weapp: {
    npm: {
      enable: true, // 是否启用 npm 构建，默认 true
      cache: true, // 是否缓存构建结果，默认 true
      subPackages: {
        // 子包依赖分配：这些依赖只打进对应子包，并从主包移除
        sub1: { dependencies: ["mp-html"] },
        sub2: { dependencies: ["dayjs"] },
      },
    },
  },
});
```

| 字段          | 类型                                         | 默认   | 说明                                                                      |
| ------------- | -------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| `enable`      | `boolean`                                    | `true` | 是否启用 npm 构建。关闭后即使有 dependencies 也跳过                       |
| `cache`       | `boolean`                                    | `true` | 是否缓存 `miniprogram-ci` 的构建结果，`package.json` 未变更时直接恢复缓存 |
| `subPackages` | `Record<string, { dependencies: string[] }>` | -      | 子包名 → 该子包专属依赖列表                                               |

::: info
只要根目录 `package.json` 的 `dependencies` 非空，npm 构建就会执行；没有依赖时任务自动跳过。`npm.mainPackage` 字段已废弃，无需配置。
:::

## cdn

- **类型：** `WeappDevCdnConfig`

静态资源 CDN 外置配置，详见 [静态资源与 CDN 指南](/guide/assets-cdn)。

```ts
interface WeappDevCdnConfig {
  /**
   * 需要外置的静态资源目录（相对 srcRoot，无需 `/` 前缀）
   * @example ['assets', 'static']
   */
  dirs: string[];
  /**
   * 生产环境 CDN 地址前缀
   * @example 'https://cdn.example.com'
   */
  url: string;
  /**
   * 开发环境配置
   */
  dev?: {
    /**
     * 是否启用开发环境路径替换
     * @default false
     */
    enabled?: boolean;
    /**
     * 自定义开发前缀，默认使用 Vite Dev Server 地址（优先局域网 IP，便于真机预览）
     * @example 'http://192.168.1.100:3000'
     */
    prefix?: string;
  };
}
```

配置示例：

```ts
export default defineConfig({
  weapp: {
    cdn: {
      // 需要外置的静态资源目录（相对 srcRoot，无需 / 前缀）
      dirs: ["assets", "static"],
      // 生产环境 CDN 地址前缀
      url: "https://cdn.example.com",
      dev: {
        // 开发环境是否启用路径替换，默认 false
        enabled: false,
        // 自定义开发前缀，默认使用 Vite Dev Server 的局域网地址
        prefix: "http://192.168.1.100:3000",
      },
    },
  },
});
```

| 字段          | 类型       | 说明                                                                               |
| ------------- | ---------- | ---------------------------------------------------------------------------------- |
| `dirs`        | `string[]` | 需要外置的资源目录（相对 `srcRoot`），命中这些目录的资源路径会被改写               |
| `url`         | `string`   | 生产环境 CDN 前缀，`build` 时所有命中路径改写为该前缀                              |
| `dev.enabled` | `boolean`  | 开发环境是否启用路径替换，默认 `false`（开发时不替换，资源仍走本地 dist）          |
| `dev.prefix`  | `string`   | 自定义开发前缀；不传则自动使用 Vite Dev Server 地址（优先局域网 IP，便于真机预览） |

::: warning 与 copy 配置的关系
启用 CDN 后，框架会自动处理资源复制逻辑（被替换的资源不再复制到 dist）。`weapp.copy` 中应避免手动配置复制 CDN 目录下的文件。
:::

## components

- **类型：** `'auto' | WeappDevComponentsConfigItem[]`
- **默认：** `'auto'`

组件自动注册配置，详见 [组件自动注册指南](/guide/components)。

```ts
interface WeappDevComponentResolver {
  /**
   * 组件标签前缀（如 'van-'）。省略时为本地目录扫描模式
   */
  match?: string;
  /**
   * npm 包名或本地目录路径
   */
  from: string;
  /**
   * 路径模板，{name} 会被替换为去掉前缀的组件名
   * @default '{name}/index'
   */
  template?: string;
  /**
   * 个别组件路径覆盖
   */
  overrides?: Record<string, string>;
  /**
   * 是否禁用
   * @default true
   */
  enable?: boolean;
}
```

默认配置（`'auto'`）等效于：

```ts
import { LocalComponentsResolver, VantResolver, TDesignResolver } from "weapp-dev/config";

components: [
  LocalComponentsResolver(), // 扫描 src/components
  VantResolver(), // 识别 <van-*>
  TDesignResolver(), // 识别 <t-*>
];
```

配置示例：

```ts
import { defineConfig, VantResolver, LocalComponentsResolver } from "weapp-dev/config";

export default defineConfig({
  weapp: {
    components: [
      // 扫描多个本地组件目录（相对 srcRoot）
      LocalComponentsResolver(["components", "biz-components"]),

      // 手动复制 vant-weapp 源码改造（相对 srcRoot）
      VantResolver({ from: "vant-weapp" }),

      // 添加 NutUI
      {
        match: "nut-",
        from: "@nutui/nutui-miniprogram",
        template: "{name}/index",
      },
    ],
  },
});
```

完整使用场景见 [组件自动注册指南](/guide/components#自定义组件库-resolver)。

## tsdown <Badge type="warning" text="experimental" />

- **类型：** `{ unbundle?: boolean }`

::: danger 不推荐
`unbundle` 已废弃。实测项目较大时，unbundle 产生的大量 JS 文件会导致微信开发者工具出现异常，请勿开启。
:::
