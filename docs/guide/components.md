# 组件自动注册

在 WXML 中直接使用组件，无需手动在页面 JSON 中维护 `usingComponents`：

```html
<!-- src/pages/index/index.wxml -->
<van-button type="primary">按钮</van-button>
<t-button theme="primary">按钮</t-button>
<my-card title="标题" />
```

构建时会自动检测未注册的组件，写入 dist 中对应的页面 JSON：

```json
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "t-button": "tdesign-miniprogram/button/button",
    "my-card": "/components/my-card/index"
  }
}
```

已注册的组件不会重复添加；没有新增组件时页面 JSON 按原样复制。

## 内置组件库

`weapp-dev` 内置了对以下组件库的自动注册支持（**默认配置** `weapp.components: 'auto'`，无需手动配置即可生效）：

| 组件库         | 标签前缀 | npm 包名              | 注册路径模板    | 文档                                             |
| -------------- | -------- | --------------------- | --------------- | ------------------------------------------------ |
| **Vant Weapp** | `van-`   | `@vant/weapp`         | `{name}/index`  | [文档](https://vant-ui.github.io/vant-weapp/)    |
| **TDesign**    | `t-`     | `tdesign-miniprogram` | `{name}/{name}` | [文档](https://tdesign.tencent.com/miniprogram/) |

**示例**：

```html
<!-- Vant 组件 -->
<van-button>按钮</van-button>
<!-- 注册为 @vant/weapp/button/index -->

<van-icon name="success" />
<!-- 注册为 @vant/weapp/icon/index -->

<!-- TDesign 组件 -->
<t-button>按钮</t-button>
<!-- 注册为 tdesign-miniprogram/button/button -->

<t-cell title="单元格" />
<!-- 注册为 tdesign-miniprogram/cell/cell -->
```

::: tip 前提
使用 Vant / TDesign 时需要先安装对应的 npm 包并完成 [npm 构建](/guide/npm)，注册路径才能在 dist 中解析。
:::

## 自动注册流程

组件自动注册的完整流程如下：

```
1. 扫描 WXML 文件
   ↓
2. 提取所有非原生组件标签（<van-button>、<t-cell>、<my-card> 等）
   ↓
3. 按优先级匹配组件路径
   ↓
   3.1 页面 JSON 已存在的 usingComponents（用户手动注册，优先级最高）
   ↓
   3.2 本地组件扫描（src/components 目录）
   ↓
   3.3 用户自定义 resolvers（按数组顺序）
   ↓
   3.4 内置 resolvers（Vant → TDesign）
   ↓
4. 写入页面 JSON 的 usingComponents
```

**关键点**：

- **用户手动注册永远优先**：如果页面 JSON 中已经注册了某个组件，不会被覆盖；
- **本地组件优先于第三方库**：如果 `src/components` 下有 `van-button/`，会覆盖 Vant 的注册；
- **resolver 按数组顺序匹配**：第一个返回非空路径的 resolver 生效。

## 不会被自动注册的组件

以下组件**不会被自动注册**，因为它们是微信小程序的**原生组件**（内置组件），无需在 `usingComponents` 中声明：

<details>
<summary>点击查看完整列表（92 个原生组件）</summary>

**视图容器**：
`view`、`scroll-view`、`swiper`、`swiper-item`、`cover-view`、`cover-image`、`movable-area`、`movable-view`、`match-media`、`page-container`、`root-portal`、`share-element`、`sticky-header`、`sticky-section`、`grid-view`、`list-view`、`nested-scroll-body`、`nested-scroll-header`、`snapshot`、`span`

**基础内容**：
`icon`、`text`、`rich-text`、`progress`、`selection`

**表单组件**：
`button`、`checkbox`、`checkbox-group`、`editor`、`editor-portal`、`form`、`input`、`keyboard-accessory`、`label`、`picker`、`picker-view`、`picker-view-column`、`radio`、`radio-group`、`slider`、`switch`、`textarea`

**手势识别**：
`double-tap-gesture-handler`、`force-press-gesture-handler`、`horizontal-drag-gesture-handler`、`long-press-gesture-handler`、`pan-gesture-handler`、`scale-gesture-handler`、`tap-gesture-handler`、`vertical-drag-gesture-handler`

**导航**：
`navigator`、`functional-page-navigator`、`navigation-bar`

**媒体组件**：
`audio`、`camera`、`channel-live`、`channel-video`、`image`、`live-player`、`live-pusher`、`video`、`voip-room`

**地图**：
`map`

**画布**：
`canvas`

**开放能力**：
`ad`、`ad-custom`、`official-account`、`official-account-publish`、`open-data`、`open-data-item`、`open-data-list`、`store-coupon`、`store-gift`、`store-home`、`store-product`、`web-view`

**页面配置**：
`page-meta`、`navigation-bar`

**其他**：
`wxs`、`template`、`block`、`import`、`include`、`slot`、`native-component`、`aria-component`、`draggable-sheet`、`grid-builder`、`list-builder`、`open-container`

</details>

**示例**：

```html
<!-- ❌ 不会被自动注册（原生组件） -->
<navigation-bar title="标题" />
<scroll-view scroll-y>内容</scroll-view>
<button type="primary">按钮</button>

<!-- ✅ 会被自动注册（第三方组件） -->
<van-button type="primary">按钮</van-button>
<t-button theme="primary">按钮</t-button>
<my-card title="标题" />
```

如果你发现某个组件没有被自动注册，先检查它是否在这个列表中。如果是原生组件，直接使用即可，无需注册。

## 本地组件自动注册

在 `src/components` 下创建组件目录，支持两种文件组织方式：

### 方式 1：index 入口文件

```
src/components/
  └── my-button/
      ├── index.ts       # 或 index.js
      ├── index.json     # 必须有 { "component": true }
      ├── index.wxml
      └── index.wxss
```

在 WXML 中使用 `<my-button>`，自动注册为 `/components/my-button/index`。

### 方式 2：与目录同名的入口文件

```
src/components/
  └── my-button/
      ├── my-button.ts      # 文件名与目录名一致
      ├── my-button.json    # { "component": true }
      ├── my-button.wxml
      └── my-button.wxss
```

在 WXML 中使用 `<my-button>`，自动注册为 `/components/my-button/my-button`。

**校验规则**：

- 只扫描 `src/components` 的**第一级子目录**；
- **目录名即组件标签名**（如 `my-button/` → `<my-button>`）；
- 必须存在以下文件之一：
  - `index.js`（或 `index.ts`）+ `index.json`
  - `{dirname}.js`（或 `{dirname}.ts`）+ `{dirname}.json`
- 对应的 `.json` 文件必须包含 `"component": true`；
- 如果两种方式同时存在，**优先使用 index 入口文件**。

不满足条件的目录会被跳过。

## 自定义组件库 resolver

通过 `weapp.components` 配置自定义组件库：

```ts
// vite.config.ts
import {
  defineConfig,
  VantResolver,
  TDesignResolver,
  LocalComponentsResolver,
} from "weapp-dev/config";

export default defineConfig({
  weapp: {
    components: [
      // 扫描多个本地组件目录（相对 srcRoot）
      LocalComponentsResolver(["components", "biz-components"]),

      // Vant（默认配置）
      VantResolver(),

      // TDesign（默认配置）
      TDesignResolver(),

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

## 常见场景

### 场景 1：手动复制 vant-weapp 源码改造

```ts
import { VantResolver } from "weapp-dev/config";

components: [
  VantResolver({ from: "vant-weapp" }), // from 改为本地路径（相对 srcRoot）
];
```

注册路径会从 `@vant/weapp/button/index` 变为 `/vant-weapp/button/index`。

### 场景 2：只使用 TDesign，不使用 Vant

```ts
import { TDesignResolver, LocalComponentsResolver } from "weapp-dev/config";

components: [LocalComponentsResolver(), TDesignResolver()];
```

### 场景 3：组件名与目录名不一致

某些库的组件标签名和目录名不一致，使用 `overrides` 覆盖：

```ts
{
  match: "my-",
  from: "src/my-components",
  template: "{name}/index",
  overrides: {
    "my-user-card": "user/card",      // 标签 my-user-card，实际在 user/ 目录下
    "my-btn": "button/index",          // 标签 my-btn，实际叫 button
  },
}
```

### 场景 4：函数式 Resolver（处理复杂逻辑）

对于无法通过前缀匹配的场景，可以使用函数式 resolver：

```ts
components: [
  // 自定义逻辑：根据标签名动态生成路径
  (tag: string) => {
    if (tag.startsWith("custom-")) {
      return `/custom/${tag}/index`;
    }
    if (tag === "special-widget") {
      return "/lib/widgets/special/index";
    }
    return undefined; // 返回 undefined 继续匹配下一个 resolver
  },
  VantResolver(),
];
```

### 场景 5：混合使用多种组件库

```ts
import { LocalComponentsResolver, VantResolver, TDesignResolver } from "weapp-dev/config";

components: [
  // 1. 本地组件（优先级最高）
  ...LocalComponentsResolver(["components", "biz-components"]),

  // 2. Vant
  VantResolver(),

  // 3. TDesign
  TDesignResolver(),

  // 4. NutUI
  {
    match: "nut-",
    from: "@nutui/nutui-miniprogram",
    template: "{name}/index",
  },

  // 5. 自定义函数式 resolver
  (tag: string) => {
    if (tag.startsWith("legacy-")) {
      return `/legacy/${tag.replace("legacy-", "")}/index`;
    }
    return undefined;
  },
];
```

## Resolver 配置项

| 字段        | 类型                     | 说明                                                                 |
| ----------- | ------------------------ | -------------------------------------------------------------------- |
| `match`     | `string`                 | 组件标签前缀（如 `'van-'`）。省略时为本地目录扫描模式                |
| `from`      | `string`                 | npm 包名或本地目录路径（相对 srcRoot）                               |
| `template`  | `string`                 | 路径模板，`{name}` 会被替换为去掉前缀的组件名。默认 `'{name}/index'` |
| `overrides` | `Record<string, string>` | 个别组件路径覆盖（key 为完整标签名，value 为相对 from 的路径）       |
| `enable`    | `boolean`                | 是否禁用，默认 `true`                                                |

## 路径判断规则

`from` 字段可以是 **npm 包名** 或 **本地目录路径**，系统会自动判断：

1. **明确的本地路径**：以 `./`、`../`、`/` 开头的路径，会被识别为本地目录；
2. **存在于 srcRoot 下的路径**：如果 `from` 在 `srcRoot` 下真实存在，会被识别为本地目录；
3. **否则视为 npm 包名**。

**示例**：

| `from` 值                   | 判断结果 | 生成的路径示例                      |
| --------------------------- | -------- | ----------------------------------- |
| `@vant/weapp`               | npm 包名 | `@vant/weapp/button/index`          |
| `tdesign-miniprogram`       | npm 包名 | `tdesign-miniprogram/button/button` |
| `vant-weapp`（存在于 src/） | 本地目录 | `/vant-weapp/button/index`          |
| `./my-lib`                  | 本地目录 | `/my-lib/button/index`              |
| `/absolute/path`            | 本地目录 | `/absolute/path/button/index`       |

## 匹配优先级

组件标签按以下优先级匹配：

1. **页面 JSON 已存在的 `usingComponents`** — 用户手动注册永远优先；
2. **本地组件扫描**（`src/components`）— 本地组件优先于第三方库；
3. **用户 resolvers**（按数组顺序）；
4. **内置 resolvers**（Vant → TDesign）。
