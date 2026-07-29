# WXML 转译

WXML 转译阶段负责三件事：Tailwind 类名转义、CDN 资源路径替换、组件自动注册。

## Tailwind 类名转义

WXML 中的 Tailwind 类名会自动转义为小程序兼容的格式：

```html
<!-- 源码 -->
<view class="w-[100px] h-[50px] bg-[#123456]"></view>

<!-- 转译后 -->
<view class="w-_100px_ h-_50px_ bg-_h_123456_"></view>
```

详见 [Tailwind CSS 指南](/guide/tailwindcss)。

## 组件自动注册

在 WXML 中直接使用组件，无需手动在页面 JSON 中维护 `usingComponents`：

```html
<van-button type="primary">按钮</van-button> <my-card title="标题" />
```

构建时会自动检测未注册的组件，写入 dist 中对应的页面 JSON。

详见 [组件自动注册指南](/guide/components)。

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
