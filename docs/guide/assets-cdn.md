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

**使用流程**：

1. 将 `dirs` 中配置的目录（如 `src/assets`、`src/static`）上传到 CDN / OSS；
2. `url` 填写 CDN 的资源根路径（如 `https://cdn.example.com` 或 `https://cdn.example.com/my-project`）；
3. 构建时，代码中引用这些目录的绝对路径会被自动改写为 CDN 地址。

**示例**：

假设你的项目结构如下：

```
src/
  ├── assets/
  │   ├── logo.png
  │   └── banner.jpg
  └── static/
      └── icons/
          └── home.png
```

1. 将 `src/assets` 和 `src/static` 上传到 CDN，得到：
   - `https://cdn.example.com/my-project/assets/logo.png`
   - `https://cdn.example.com/my-project/assets/banner.jpg`
   - `https://cdn.example.com/my-project/static/icons/home.png`

   ::: tip 多项目共用 CDN
   如果多个项目共用一个 CDN，建议在 `url` 中加上项目名称作为路径前缀（如 `https://cdn.example.com/my-project`），避免资源路径冲突。
   :::

2. 配置 `cdn.dirs: ["assets", "static"]` 和 `cdn.url: "https://cdn.example.com/my-project"`；

3. 构建后，代码中的引用会被自动改写：

```html
<!-- 改写前 -->
<image src="/assets/logo.png" />
<image src="/static/icons/home.png" />

<!-- 改写后 -->
<image src="https://cdn.example.com/my-project/assets/logo.png" />
<image src="https://cdn.example.com/my-project/static/icons/home.png" />
```

## 路径改写规则

构建时，`dirs` 命中的**绝对路径**在以下文件类型中会被自动改写：

| 文件类型 | 匹配形式                                                            |
| -------- | ------------------------------------------------------------------- |
| WXML     | `src="/assets/..."` 属性、`style="...url(/assets/...)..."` 内联样式 |
| WXSS     | `url(/assets/...)`、`url('/assets/...')`、`url("/assets/...")`      |
| JS       | 字符串字面量中的 `"/assets/..."`                                    |

```html
<!-- 改写前 -->
<image src="/assets/logo.png" />

<!-- 改写后（生产） -->
<image src="https://cdn.example.com/assets/logo.png" />
```

::: warning 只匹配绝对路径
只有以 `/` 开头、且命中 `dirs` 前缀的**绝对路径**会被处理，相对路径（如 `./assets/logo.png`、`../assets/logo.png`）原样保留——若相对路径指向的文件未被复制进 dist，运行时会 404。推荐在代码中统一使用绝对路径引用静态资源。
:::

::: tip tabbar 等包内必需资源
小程序包内必须存在的资源（tabbar 图标、订阅消息图片等微信平台强制要求的文件）**不要**放进 `cdn.dirs`，否则启用替换后资源外置会导致这些功能异常。详见下文[「与 copy 的关系」](#与-copy-的关系)。
:::

## 开发环境

开发环境默认**不替换**路径（`dev.enabled: false`），资源由框架自动复制进 dist（见下文「与 copy 的关系」），从本地读取，开箱即用。

启用开发替换后，路径被改写为本地服务地址，资源由 Vite Dev Server 提供：

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

- 前缀优先级：`dev.prefix` > Vite Dev Server 局域网地址 > `http://localhost:<port>`（port 取 `server.port`，默认 5173）；
- Dev Server 默认 `host: true`，允许局域网访问；
- 资源查找顺序：`src/<dir>` → 项目根目录下的 `<dir>`（public 风格），都不存在则交给 Vite 中间件继续处理，可配合任意静态资源插件使用。

::: warning 真机预览
`dev.enabled: true` 时手机真机预览需要与电脑处于同一局域网（必要时开启代理）才能访问资源。如果嫌麻烦，建议关闭 `dev.enabled` 并让 `url` 指向测试环境 CDN，开发环境同样走线上地址。
:::

## 与 copy 的关系

启用 CDN 后框架自动处理资源复制逻辑，遵循一条原则：**路径被替换 ⟺ 资源外置 ⟺ 不再复制进 dist**。

判定规则：**只要 `dev.enabled` 或 `url` 任一生效，`cdn.dirs` 下的资源就不会被复制**；两者都未生效时，框架才兜底把 `cdn.dirs` 复制到 dist（此时路径不做任何替换，资源从本地加载）。

| 场景                       | 路径替换为   | 复制 `cdn.dirs` 到 dist |
| -------------------------- | ------------ | ----------------------- |
| `build`，配置了 `url`      | `url`        | ❌（需自行上传 CDN）    |
| `dev`，`dev.enabled: true` | 本地服务地址 | ❌（Vite 本地 serve）   |
| `dev`，两者均未生效        | 不替换       | ✅（兜底复制）          |

因此：

- 不要在 `weapp.copy` 中手动配置 CDN 目录下的文件——启用替换时会造成资源重复进包，白白占用体积；
- 未被 CDN 覆盖的其他静态资源（如 tabbar 图标）仍可通过 [`weapp.copy`](/config/weapp#copy) 正常复制。

::: tip
tabbar 图标等微信要求必须存在于包内的资源，请放在 `cdn.dirs` 之外的目录，或用 `copy` 显式复制。
:::

## 上传 CDN 的目录结构

上传时需要保持与 `dirs` 一致的目录层级。例如 `dirs: ["assets"]` + `url: "https://cdn.example.com/my-project"`，则 `src/assets/logo.png` 应上传为：

```
https://cdn.example.com/my-project/assets/logo.png
└────────── url ──────────┘└─ dir ─┘└ 文件 ┘
```

即 **改写后的路径 = `url` + `/` + `dir` + 原始相对路径**。如果 CDN 上把 `assets` 目录的内容平铺到了根路径，改写后的地址会 404。

## 完整示例

参考 [examples/asset-replace](https://github.com/ReySun/weapp-dev/tree/main/examples/asset-replace)。
