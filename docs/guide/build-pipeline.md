# 构建流程

`weapp-dev` 的构建按固定顺序执行 **5 个阶段**，以 Listr 任务列表的形式展示进度与耗时：

```
1. NPM 构建 → 2. WXSS 编译 → 3. WXML 转译 → 4. 资源复制 → 5. TS 编译
```

## 各阶段说明

### 1. NPM 构建

使用 `miniprogram-ci` 将 `package.json` 的 `dependencies` 构建为 `dist/miniprogram_npm/`。支持构建缓存与子包依赖分配。详见 [npm 依赖](/guide/npm)。

无条件执行时自动跳过（无 dependencies 或 `npm.enable: false`）。

### 2. WXSS 编译

通过 Vite + `weapp-tailwindcss/vite` 编译 `srcRoot` 下所有样式文件（`.css` / `.less` / `.scss` 等），以 `preserveModules` 保持目录结构输出 `.wxss`。同时从全局样式产物中提取已生成的类名建立缓存，供 WXML 增量阶段使用。详见 [样式（WXSS）](/guide/styling)。

### 3. WXML 转译

- weapp-tailwindcss 转义 Tailwind 类名；
- 检测 `van-*` 组件并自动注册到页面 JSON；
- 替换 CDN 资源路径。

详见 [WXML 与组件](/guide/wxml)。

### 4. 资源复制

复制 JSON / JS / WXS 等静态文件，以及 `weapp.copy` 配置的资源。开发模式支持新增文件增量复制。JSON 的具体处理规则见 [JSON 文件处理](/guide/json-handling)。

### 5. TS 编译

使用 tsdown 编译 TypeScript：自动识别入口、按分包结构拆分代码、清理空导出、改写 pnpm 路径。详见 [TypeScript 与分包](/guide/typescript)。

## 开发与生产的差异

| | `weapp-dev dev` | `weapp-dev build` |
| --- | --- | --- |
| WXSS | Vite Dev Server 逐文件编译 | Vite 全量构建 + 压缩 |
| TS | watch 增量编译 | 全量构建 + 压缩 + bundle 报告 |
| CDN 前缀 | 本地 / 局域网地址（`dev.enabled` 时） | `cdn.url` |
| 文件监听 | 启动后持续监听 | 无 |

## 开发模式的增量更新

开发模式完成首次全量构建后，Vite watcher 按文件类型分发增量任务：

| 变更 | 处理 |
| --- | --- |
| `.wxml` 修改/新增 | 重新转译该文件（未变更则跳过） |
| `.wxss` / `.less` 等修改 | 只重新编译该样式文件 |
| `.ts` 修改 | tsdown watch 增量重编译 |
| 页面 `.json` 修改 | 重扫同名 WXML，更新组件注册 |
| `weapp.copy` 匹配的文件新增 | 增量复制到 dist |
| 任意文件删除 | 同步删除 dist 中对应产物 |

事件按「文件 + 事件类型」做 200ms 防抖，连续保存不会触发重复编译。

## 构建前检查

- 根目录缺少 `project.config.json` 时交互式确认是否继续；
- 构建完成后校验 `project.config.json` 的 `miniprogramRoot` 与 `outDir` 是否匹配，不匹配时输出警告提示修改。
