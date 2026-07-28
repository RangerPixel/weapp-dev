# JSON 文件处理

小程序中每个页面/组件都有同名 `.json` 配置文件，`app.json` 声明全局页面与分包。`weapp-dev` 对 JSON 的处理不是简单的「全部复制」，而是按类型区分对待。

## 处理规则总览

| JSON 类型 | 全量构建（阶段 4 资源复制） | WXML 转译阶段 | 开发模式增量 |
| --- | --- | --- | --- |
| srcRoot 根目录的 JSON（`app.json`、`sitemap.json` 等） | 直接复制到 dist 根目录 | — | 变更时重新复制/重写 |
| 页面/组件同名 JSON | 不直接复制 | 由 WXML 阶段处理（组件注册或复制） | 变更时重扫同名 WXML，必要时重写 |

## 全量构建：根级 JSON 直接复制

「资源复制」阶段的内部复制规则是：

```
src/**/*.{wxs,js,wxss}   → dist/**   （保持目录结构）
src/*.json               → dist/     （仅 srcRoot 根目录一层）
```

也就是说，**只有 srcRoot 根目录一层的 JSON 会被直接复制**——典型就是 `app.json`、`sitemap.json`、`project.config.json`（如放在 src 内）等。页面/组件目录下的同名 JSON 不在此列（避免与 WXML 阶段的处理重复）。

::: warning 目录结构保持
`{wxs,js,wxss}` 的复制保持目录结构（`flatten: false`），但根级 JSON 只匹配 `src/*.json` 一层，不会递归匹配子目录。
:::

## 页面/组件 JSON：WXML 阶段处理

页面/组件的同名 JSON 由 WXML 转译阶段（阶段 3）负责，逻辑如下：

1. 读取 WXML 文件，检测其中使用的 `van-*` 组件；
2. 解析同名 JSON，若存在未注册的 Vant 组件，自动补充到 `usingComponents` 并写入 dist；
3. 若没有需要新增的组件，则将 JSON **原样复制**到 dist。

换句话说，页面/组件 JSON 大多数情况下就是复制，但当 WXML 用了未注册的 Vant 组件时会被**增强后写入**。详见 [WXML 与组件](/guide/wxml#vant-组件自动注册)。

## 开发模式的增量处理

JSON 文件变更时触发的是 `transformWxmlFile({ isJsonChanged: true })`，流程：

- 找到同名 WXML，重新扫描其中的 `van-*` 组件；
- 与当前 JSON 的 `usingComponents` 比对，缺什么补什么，写入 dist；
- 如果不需要新增组件，执行普通复制（内容一致时跳过）。

::: tip 一个实际效果
如果你手动从页面 JSON 的 `usingComponents` 里删掉了一个组件，但 WXML 里还在使用它，保存 JSON 后 `weapp-dev` 会自动把这个组件注册**补回来**。
:::

## 与 `weapp.copy` 的关系

[`weapp.copy`](/config/weapp#copy) 是用户自定义的额外复制规则（语法同 tsdown）。**不要**在 `copy` 里配置 JSON 文件——js/wxs/json 已由上述内部逻辑处理，重复配置会导致不可预期的覆盖行为。

## 为什么这样设计

页面/组件 JSON 不直接进「资源复制」，是因为它可能需要在 WXML 阶段被改写（Vant 组件注册）。如果两个阶段都处理同一文件，既浪费 IO 又可能互相覆盖。因此：根级 JSON 走复制通道，页面/组件 JSON 走 WXML 通道，各管一段。
