# 配置概览

`weapp-dev` 的配置文件就是项目根目录的 **`vite.config.ts`**（Vite 会自动识别 `.ts` / `.js` / `.mts` 等扩展名），通过 `weapp-dev/config` 导出的 `defineConfig` 获得完整类型提示：

```ts
import { defineConfig } from "weapp-dev/config";

export default defineConfig({
  // 受支持的 Vite 字段（受限集，见 Vite 配置扩展）
  define: {
    __VERSION__: JSON.stringify("1.0.0"),
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  // weapp-dev 专属配置
  weapp: {
    srcRoot: "src",
    outDir: "dist",
  },
});
```

配置分为两部分：

- **`weapp` 字段** — `weapp-dev` 的专属配置，见 [weapp 配置](/config/weapp)；
- **根层级的 Vite 字段** — 目前仅兼容一个**受限子集**（`env` / `envFile` / `envPrefix` / `define` / `server` / `resolve.alias`），见 [Vite 配置扩展](/config/vite)。

## 配置加载方式

配置通过 Vite 的 `loadConfigFromFile` 加载，因此支持：

- 导出对象或返回对象的函数（包括异步函数）；
- 与 Vite 相同的配置文件解析规则。

::: danger 不要随意使用其他 Vite 字段
`weapp-dev` 只消费上表列出的 Vite 字段。**其他 Vite 标准配置字段（如 `build`、`publicDir`、`optimizeDeps` 等）均不生效**，随意使用可能引发不可预期的行为。
:::

## 完整配置示例

```ts
import { defineConfig } from "weapp-dev/config";

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify("1.0.0"),
  },
  envPrefix: ["APP_", "VITE_"],

  weapp: {
    srcRoot: "src",
    outDir: "dist",
    emptyOutDir: true,
    logLevel: "info",
    platform: "weapp",
    format: "esm",

    copy: [{ from: "src/assets", to: "dist/assets" }],

    weappTwConfig: {
      customAttributes: {
        "*": [/[a-z]+Class|[^-\s]+-class|className/],
      },
    },

    npm: {
      enable: true,
      cache: true,
      subPackages: {
        sub1: { dependencies: ["mp-html"] },
      },
    },

    cdn: {
      dirs: ["assets", "static"],
      url: "https://cdn.example.com",
      dev: { enabled: false },
    },
  },
});
```

各字段的详细说明请继续阅读：

- [weapp 配置](/config/weapp)
- [Vite 配置扩展](/config/vite)
