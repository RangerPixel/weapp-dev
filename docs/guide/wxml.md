# WXML 与组件

WXML 转译阶段负责三件事：Tailwind 类名转义、CDN 资源路径替换、**Vant 组件自动注册**。

## Vant 组件自动注册

在 WXML 中直接使用 `<van-*>` 组件，无需手动在页面 JSON 中维护 `usingComponents`：

```html
<!-- src/pages/index/index.wxml -->
<van-button type="primary">按钮</van-button>
<van-icon name="success" />
```

构建时会自动检测未注册的 `van-*` 组件，写入 dist 中对应的页面 JSON：

```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "van-icon": "@vant/weapp/icon/index"
  }
}
```

已注册的组件不会重复添加；没有新增组件时页面 JSON 按原样复制。

::: tip 前提
项目需要安装 `@vant/weapp` 并完成 [npm 构建](/guide/npm)，这样 `@vant/weapp/*` 路径才能在 dist 中解析。
:::

::: info 目前仅支持 Vant
其他组件库的自动注册尚未实现，请按原生方式在页面/组件 JSON 中手动配置 `usingComponents`。
:::

## 开发模式的行为

- **修改 `.wxml`** — 重新转译该文件。文件未变更（与缓存一致）时直接跳过。
- **修改页面 `.json`** — 重新扫描同名 WXML 中的组件使用情况，必要时重写 dist 中的 JSON（例如你手动删除了某个组件注册，只要 WXML 里还在用，就会重新补回）。
- **新增 Tailwind 类** — 见 [Tailwind CSS 增量更新](/guide/tailwindcss#开发模式的增量更新)。

## CDN 路径替换

配置 [CDN](/guide/assets-cdn) 后，WXML 中以下两种形式的资源绝对路径会被改写：

```html
<!-- src 属性 -->
<image src="/assets/logo.png" />

<!-- 内联 style -->
<view style="background-image: url(/static/bg.png)" />
```

改写结果（生产环境）：

```html
<image src="https://cdn.example.com/assets/logo.png" />
<view style="background-image: url(https://cdn.example.com/static/bg.png)" />
```

相对路径（如 `./logo.png`、`../assets/a.png`）不受影响。
