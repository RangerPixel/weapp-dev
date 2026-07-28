# 常见问题

## 微信开发者工具中预览白屏 / 模块报错

按顺序排查：

1. **`project.config.json` 的 `miniprogramRoot` 是否指向 `dist/`** — 构建结束时 `weapp-dev` 会打印相关警告，按提示修改；
2. **是否开启了「增强编译」或「ES6 转 ES5」** — 默认输出 ESM，必须开启其一；
3. **npm 依赖是否放错了位置** — 运行时依赖必须在 `dependencies` 而非 `devDependencies`。

## 修改了文件但 dist 没有更新

- 确认是在 `weapp-dev dev` 运行期间修改的；
- 确认修改的文件位于 `srcRoot` 内（watcher 只监听源码目录，srcRoot 之外的非 TS 文件变更会被忽略）；
- 偶发的缓存问题可以重启 `weapp-dev dev`（默认每次启动都会清空输出目录后重建，见 [`emptyOutDir`](/config/weapp#emptyoutdir)）。

## Tailwind 类名没有生效

1. **确认 `tailwindcss` 是 v3 而非 v4** — `weapp-dev` 内置 weapp-tailwindcss 锁定 v4 版本线，只支持 `tailwindcss@^3`。装了 v4 会导致样式无法生成（见 [版本说明](/guide/tailwindcss#版本说明-仅支持-tailwind-css-v3)）；
2. 确认 Tailwind 已启用（存在 `tailwind.config.*` 或 `tailwindcss` 依赖）；
3. 确认全局样式（`app.less` / `app.wxss`）中包含 `@tailwind base/components/utilities` 指令；
4. 确认 `tailwind.config.js` 的 `content` 覆盖了你的 WXML 文件（如 `./src/**/*.{wxml,wxss,less}`）；
5. 第三方组件的 class 属性（如 `custom-class`）需要匹配 `customAttributes` 配置，默认值见 [Tailwind CSS](/guide/tailwindcss#自定义-class-属性)；
6. **如果是 Less 中的 `@apply` 任意值失效**（如 `@apply w-[200px]` 没生成样式）——Less 会把 `-`/`[]` 拆分解析成 `w- [200px]`，必须写成 `@apply ~"w-[200px]"`。Sass 无此问题。详见 [Less 中使用 @apply 任意值需要 `~""` 转义](/guide/tailwindcss#less-中使用-apply-任意值需要-转义)。

## npm 构建很慢

首次构建慢是正常的（`miniprogram-ci` 需要分析依赖）。确认 `npm.cache` 未关闭——缓存命中后后续构建会直接恢复产物。依赖变更（安装/升级）会使缓存失效，属于预期行为。

## 主包体积超限

组合使用以下手段：

1. [npm 子包依赖分配](/guide/npm#子包依赖分配) — 分包专属依赖移出主包；
2. [静态资源 CDN](/guide/assets-cdn) — 图片等资源外置；
3. 保持 `format: "esm"` 获得更好的 tree-shaking；
4. 检查 `weapp.copy` 是否复制了不必要的大文件进主包。

## 手机真机预览时 CDN 资源加载失败

`cdn.dev.enabled: true` 时资源走电脑上的 Vite Dev Server：

- 手机必须与电脑在**同一局域网**；
- 必要时开启电脑代理并让手机连接；
- 或者关闭 `dev.enabled`，把 `cdn.url` 指向测试环境 CDN，开发环境也走线上地址。

## 使用了不支持的 Vite 配置字段

`weapp-dev` 只消费受限的 Vite 字段子集（见 [Vite 配置扩展](/config/vite)）。其他字段（如 `build`、`optimizeDeps`、`publicDir`）不生效，写了可能引发异常行为，请移除。

## 分包中的依赖被主包引用导致报错

配置了 `npm.subPackages` 的依赖会从主包移除，主包页面再引用会在运行时找不到模块。请保证被分配的依赖**仅**在该分包内使用。
