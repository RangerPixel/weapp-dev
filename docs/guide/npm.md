# npm 依赖

`weapp-dev` 使用微信官方的 [miniprogram-ci](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html) 自动构建 npm 依赖，替代在微信开发者工具里手动点「工具 → 构建 npm」。

## 启用条件

npm 构建任务在以下条件**全部满足**时执行，否则自动跳过：

1. `weapp.npm.enable` 为 `true`（默认）；
2. 项目根目录 `package.json` 的 `dependencies` 非空。

也就是说，只要正常 `pnpm add dayjs` 这类运行时依赖，构建时就会自动产出 `dist/miniprogram_npm/`。

::: warning 依赖要放在 dependencies
只有 `dependencies` 中的包会被构建。构建工具、类型包等请放在 `devDependencies`。
:::

## 构建缓存

默认开启（`npm.cache: true`）。缓存键由 `outDir`、`package.json` 的修改时间和 weapp-dev 版本组成：

- **缓存命中** — 直接恢复上次的构建结果，跳过 `miniprogram-ci` 调用（这是构建流程中最慢的一步，缓存能显著加速）；
- **缓存未命中** — 重新构建并更新缓存。

安装/升级/删除依赖会改变 `package.json` 的 mtime，缓存自动失效。如遇异常情况想强制重建：

```ts
export default defineConfig({
  weapp: {
    npm: { cache: false },
  },
});
```

## 子包依赖分配

某些依赖只在分包中使用时，可以把它**只打进子包**，主包中不再保留——这是控制主包体积的关键手段：

```ts
export default defineConfig({
  weapp: {
    npm: {
      subPackages: {
        sub1: { dependencies: ["mp-html"] },
        sub2: { dependencies: ["dayjs"] },
      },
    },
  },
});
```

行为：

1. 所有依赖先正常构建到主包 `dist/miniprogram_npm/`；
2. 配置中声明的依赖被**移动**到对应子包目录 `dist/<子包名>/miniprogram_npm/`，主包中的副本被删除。

::: warning 注意事项
- 子包名必须与 `app.json` 中 `subPackages[].root` 一致；
- 被分配到子包的依赖**不能**再被主包页面引用，否则运行时报模块找不到；
- 一个依赖只能分配给一个子包。
:::

配合 [TS 自动分包拆包](/guide/typescript#自动分包拆包)，JS 代码与 npm 依赖都能做到按需入包。

## 相关配置

完整字段见 [weapp 配置 - npm](/config/weapp#npm)。
