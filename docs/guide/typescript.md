# TypeScript 与分包

TS 编译基于 [tsdown](https://github.com/rolldown/tsdown)（rolldown 驱动），是 `weapp-dev` 构建流程的最后一个阶段。

## 入口自动识别

不需要手动声明入口。`weapp-dev` 按以下规则自动收集入口 TS 文件（`*` 为 `srcRoot` 下）：

1. **页面 / 组件** — 同名 `.wxml` 存在的 `.ts` 文件；
2. **分包入口** — `app.json` 中 `subPackages[].entry` 声明的文件；
3. **srcRoot 直接子文件** — 如 `app.ts`、`env.ts` 等。

`.d.ts` 文件始终被排除。未被识别为入口、但被入口引用的模块会作为普通模块打包。

## 自动分包拆包

内置插件 `vitePluginAutoWeappSplitChunk` 会分析模块依赖图，按照小程序的分包结构自动拆分公共代码：

- 只被某个分包引用的模块打进该分包；
- 主包与分包共享的模块保留在主包，避免重复代码增加子包体积。

配合 [npm 子包依赖分配](/guide/npm#子包依赖分配)，可以把主包体积压到最小。

## 输出行为

| 行为            | 开发模式                                                    | 生产构建 |
| --------------- | ----------------------------------------------------------- | -------- |
| 压缩            | 否                                                          | 是       |
| bundle 分析报告 | 否                                                          | 是       |
| watch 增量编译  | 是                                                          | 否       |
| 输出格式        | `esm`（可通过 [`format`](/config/weapp#format) 改为 `cjs`） | 同左     |

输出扩展名固定为 `.js`（ts 模板中的 `.ts` → dist 中的 `.js`）。

::: tip ESM 兼容性
默认输出 ESM。在微信开发者工具中开启「增强编译」（或「ES6 转 ES5」）即可正常运行，同时获得更好的 tree-shaking。
:::

## 内置处理插件

TS 编译阶段还内置了三个处理插件，均无需配置：

- **`vitePluginAutoWeappSplitChunk`** — 上文所述的自动分包拆分；同时收集 `srcRoot` 之外、项目内被引用的 TS 文件（如 monorepo 中其他 package 的源码），注册到开发模式的文件监听中，外部文件变更同样触发重编译。
- **`vitePluginDeleteEmptyExport`** — 移除产物中多余的空导出语句 `export {}`。tsdown 在给没有显式导出的小程序入口文件（如 `app.ts`、页面/组件脚本）生成 ESM 产物时，会自动追加一条空的 `export {}` 语句（用于把文件标记为 ES 模块）。这条语句在小程序运行时可能引发报错，因此该插件会在入口 chunk 中将其删除。
- **`vitePluginRewritePnpmImport`** — 改写 pnpm 虚拟目录风格的导入路径，保证产物在小程序环境可解析。

如果配置了 [CDN](/guide/assets-cdn)，TS 产物中字符串字面量形式的资源绝对路径也会被一并改写。

## 开发模式的增量编译

开发模式下 TS 以 watch 方式运行：任一入口依赖链上的文件变更都会触发 rolldown 的增量重编译（通常毫秒级），并在完成后输出耗时。

文件删除时也会自动清理 dist 中对应的 `.js` 产物并重编译。

## 常见问题

**Q：为什么我的工具函数没有输出到 dist？**
它不是入口。只有页面/组件/分包入口/srcRoot 直接子文件会作为入口输出独立文件，其余模块被打包进入口产物中（bundle 模式）。这是预期行为。

**Q：monorepo 里引用其他 package 的 TS 源码能热更新吗？**
能。首次构建后这些外部 TS 文件会被注册到 Vite watcher，变更后自动触发重编译。
