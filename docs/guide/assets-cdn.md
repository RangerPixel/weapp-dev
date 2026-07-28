# 静态资源与 CDN

小程序主包有 2M 限制，图片等静态资源是体积大头。`weapp-dev` 支持将指定目录的静态资源**外置到 CDN**，并自动改写代码中的资源路径。

## 基本配置

```ts
export default defineConfig({
  weapp: {
    cdn: {
      dirs: ["assets", "static"], // 相对 srcRoot 的资源目录
      url: "https://cdn.example.com", // 生产环境 CDN 前缀
    },
  },
});
```

## 路径改写规则

构建时，`dirs` 命中的**绝对路径**在以下文件类型中会被自动改写：

| 文件类型 | 匹配形式 |
| --- | --- |
| WXML | `src="/assets/..."` 属性、`style="...url(/assets/...)..."` 内联样式 |
| WXSS | `url(/assets/...)`、`url('/assets/...')`、`url("/assets/...")` |
| JS | 字符串字面量中的 `"/assets/..."` |

```html
<!-- 改写前 -->
<image src="/assets/logo.png" />

<!-- 改写后（生产） -->
<image src="https://cdn.example.com/assets/logo.png" />
```

只有以 `/` 开头的绝对路径会被处理，相对路径原样保留。推荐在代码中统一使用绝对路径引用静态资源。

## 开发环境

开发环境默认**不替换**路径（`dev.enabled: false`），资源直接从本地 dist 读取，开箱即用。

启用开发替换后，资源由 Vite Dev Server 提供：

```ts
export default defineConfig({
  weapp: {
    cdn: {
      dirs: ["assets"],
      url: "https://cdn.example.com",
      dev: {
        enabled: true,
        // 可选：自定义前缀。默认自动使用 Vite Dev Server 地址
        // （优先局域网 IP，fallback localhost）
        // prefix: "http://192.168.1.100:3000",
      },
    },
  },
});
```

- 前缀优先级：`dev.prefix` > Vite Dev Server 局域网地址 > `http://localhost:<port>`；
- Dev Server 默认 `host: true`，允许局域网访问。

::: warning 真机预览
`dev.enabled: true` 时手机真机预览需要与电脑处于同一局域网（必要时开启代理）才能访问资源。如果嫌麻烦，建议关闭 `dev.enabled` 并让 `url` 指向测试环境 CDN，开发环境同样走线上地址。
:::

## 与 copy 的关系

启用 CDN 后框架自动处理资源复制逻辑——被外置的资源不再复制进 dist。因此：

- 不要在 `weapp.copy` 中手动配置 CDN 目录下的文件，避免重复复制占包；
- 未被 CDN 覆盖的其他静态资源（如 tabbar 图标）仍可通过 [`weapp.copy`](/config/weapp#copy) 正常复制。

::: tip
tabbar 图标等微信要求必须存在于包内的资源，请放在 `cdn.dirs` 之外的目录，或用 `copy` 显式复制。
:::

## 完整示例

参考 [examples/asset-replace](https://github.com/ReySun/weapp-dev/tree/main/examples/asset-replace)。
