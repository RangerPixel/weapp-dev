# Tailwind CSS

`weapp-dev` 内置 [weapp-tailwindcss](https://github.com/sonofmagic/weapp-tailwindcss)，负责两件事：

1. **WXML 类名转义** — Tailwind 中的特殊字符类名（如 `w-[100rpx]`、`bg-black/50`）在小程序中需要转义，构建时自动处理；
2. **WXSS 生成** — 按需生成 Tailwind 工具类样式到 `.wxss`。

## 启用条件

Tailwind 是**自动检测**的，满足任一条件即启用：

- 项目根目录存在 `tailwind.config.{js,ts,mjs,cjs}`；
- `package.json` 中包含 `tailwindcss` 依赖。

未启用时 WXML 转义与 Tailwind 样式生成全部跳过。显式关闭：`weappTwConfig.enable: false`。

## 版本说明：仅支持 Tailwind CSS v3

::: warning 重要
`weapp-dev` 内置的 **weapp-tailwindcss 锁定在 v4 版本线**，它只支持 **Tailwind CSS v3**，**不支持 Tailwind CSS v4**。请固定使用 `tailwindcss@^3`，不要升级到 v4。
:::

这是 `weapp-dev` 的主动选择：**出于小程序运行环境的兼容性考虑**（小程序的 WXSS 渲染能力受限，Tailwind CSS v4 基于现代 CSS 特性的生成结果无法在小程序中可靠运行），`weapp-dev` 将长期停留在 weapp-tailwindcss v4 + Tailwind CSS v3 的组合，**不会升级到 Tailwind CSS v4**。因此你的项目必须搭配 Tailwind CSS v3 使用，即：

| 组件                                              | 版本 |
| ------------------------------------------------- | ---- |
| weapp-tailwindcss（weapp-dev 内置，无需手动安装） | `^4` |
| tailwindcss（你的项目依赖）                       | `^3` |

如果安装了 `tailwindcss@4`，PostCSS 插件形态（`tailwindcss: {}`）已变更，会导致样式无法生成。

## 接入步骤

以 Tailwind CSS v3 为例：

### 1. 安装依赖

```bash
pnpm add -D tailwindcss@^3 postcss autoprefixer
```

### 2. 创建 tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{wxml,wxss,less}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 3. 创建 postcss.config.cjs

```js
module.exports = {
  plugins: {
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 4. 在全局样式中引入 Tailwind 指令

```less
// src/app.less
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5.（可选）配置 weappTwConfig

```ts
export default defineConfig({
  weapp: {
    weappTwConfig: {
      rem2rpx: true,
      customAttributes: {
        "*": [/[a-z]+Class|[^-\s]+-class|className/],
      },
      cssEntries: ["/absolute/path/to/src/app.less"],
    },
  },
});
```

完成。在 WXML 中直接使用：

```html
<view class="flex items-center justify-between px-[32rpx] bg-theme-500/80">
  <text class="text-white text-sm">Hello Tailwind</text>
</view>
```

## 自定义 class 属性

默认配置已支持常见第三方组件库的 class 属性命名（`custom-class`、`hoverClass`、`className` 等）：

```ts
customAttributes: {
  "*": [/[a-z]+Class|[^-\s]+-class|className/],
}
```

即任何标签上匹配 `[a-z]+Class`、`xxx-class`、`className` 的属性值都会被当作 Tailwind 类名处理。例如 Vant 组件：

```html
<van-button custom-class="rounded-full shadow-lg">按钮</van-button>
```

如组件库使用了其他属性名，按 [weapp-tailwindcss customAttributes 文档](https://tw.icebreaker.top/docs/api/options/important) 扩展即可。

## 独立分包配置

使用独立分包（`app.json` 中 `subPackages[].independent: true`）时，Tailwind 样式需要按**多上下文**方式配置，请参阅 weapp-tailwindcss 官方文档：

👉 [tailwindcss 多上下文与独立分包（v4 文档）](https://v4.tw.icebreaker.top/docs/quick-start/independent-pkg)

## Less 中使用 `@apply` 任意值需要 `~""` 转义

在 Less 文件里用 `@apply` 书写 Tailwind **任意值语法**（如 `w-[200px]`、`mx-[301rpx]`）时，必须加 `~""` 转义：

::: code-group

```less [Less ✅]
.container {
  @apply ~"mx-[301rpx] my-[20px]";
}
```

```scss [Sass ✅]
.container {
  @apply mx-[301rpx] my-[20px]; // 无需转义
}
```

:::

**原因**：这是 Less 编译器自身的解析行为，与 Vite / weapp-dev 无关。Less 会把 `w-[200px]` 中的 `-` 当作**减号运算符**、把 `[200px]` 当作**选择器/列表语法**分别解析，编译后变成 `w- [200px]`（中间多了空格），Tailwind 在 PostCSS 阶段拿到的就是错误的类名，无法匹配生成样式。

`~"..."` 是 Less 的[字符串转义语法](https://lesscss.org/features/#escaping)：引号内的内容原样输出、不参与 Less 的运算和解析，Tailwind 因此能收到完整的 `w-[200px]`。

Sass（dart-sass）则不会把 `-` 和 `[]` 拆分解析，标识符原样保留，所以不需要转义。

::: warning 静默失败，务必注意
错误写法不会报错——Less 编译正常通过，只是 `@apply` 静默失效、样式不生成。如果 Less 项目里某个 `@apply` 的任意值样式没生效，先检查是否漏了 `~""`。
:::

受影响的只有 `@apply` 场景。WXML 中直接写 `class="w-[200px]"` 不经过 Less，两种预处理器都无需任何转义。

## 开发模式的增量更新

修改 WXML 后，`weapp-dev` 会比对类名变化：

- 如果新增了 `app.wxss` 中不存在的 Tailwind 类，会**自动重新编译全局样式**（无需重启），日志中会输出新增的类名；
- 已存在的类直接复用缓存，只转写 WXML。

因此新增 Tailwind 类也是毫秒级生效。

## 参考

- [weapp-tailwindcss 文档](https://tw.icebreaker.top/)（注意：`weapp-dev` 锁定 v4 版本线，应参考 [v4 文档](https://v4.tw.icebreaker.top/)）
- 完整示例：[examples/basic-ts-tw](https://github.com/ReySun/weapp-dev/tree/main/examples/basic-ts-tw)
