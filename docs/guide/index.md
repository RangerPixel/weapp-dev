# 介绍

`weapp-dev` 是一个面向**原生微信小程序**的构建工具链。它让原生小程序项目在不迁移到第三方框架的前提下，获得现代化的开发体验：TypeScript、Tailwind CSS、Less/Sass 预处理器、npm 依赖管理、静态资源 CDN、增量热更新。

::: warning Beta 阶段
本工具目前处于 **Beta 阶段**，API 和功能可能发生变化，生产环境使用请谨慎评估。
:::

## 解决什么问题

原生小程序开发有几个长期痛点：

- 官方只提供基础的 TS 模板，没有真正意义上的打包与按需拆分；
- 样式只能用 WXSS，想用 Less/Sass/Tailwind 需要自己搭编译链；
- npm 依赖需要手动在开发者工具里点「构建 npm」，且无法按分包分配；
- 静态资源（图片等）全部打进包内，主包 2M 限制捉襟见肘；
- 修改文件后编译慢，没有真正的增量热更新。

`weapp-dev` 用一条命令解决以上全部问题。

## 核心能力

| 能力            | 实现                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| TypeScript 编译 | [tsdown](https://github.com/rolldown/tsdown)（rolldown 驱动），开发模式 watch 增量编译                                  |
| 自动分包拆包    | 自定义插件 `vitePluginAutoWeappSplitChunk`，按小程序分包结构拆分公共代码                                                |
| 样式编译        | [Vite](https://vite.dev/) 样式管道 + [weapp-tailwindcss](https://github.com/sonofmagic/weapp-tailwindcss)，输出 `.wxss` |
| WXML 转译       | weapp-tailwindcss/core 转义类名；自动注册 Vant 组件到页面 JSON                                                          |
| npm 构建        | [miniprogram-ci](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)，支持构建缓存与子包依赖分配         |
| 静态资源 CDN    | 自动改写 WXML / WXSS / JS 中的资源绝对路径为 CDN 地址                                                                   |
| 文件复制        | 兼容 tsdown `copy` 配置，开发模式支持新增文件增量复制                                                                   |

## 技术栈

- **Vite** — 配置加载、WXSS 编译、开发服务器与文件监听
- **tsdown / rolldown** — TypeScript 打包
- **weapp-tailwindcss**（锁定 v4 版本线）— Tailwind CSS v3 小程序适配（出于小程序兼容性考虑，不会升级到 Tailwind CSS v4）
- **miniprogram-ci** — 微信官方 npm 构建

## 要求

- Node.js **>= 24**
- 项目根目录存在 `project.config.json`（微信开发者工具创建的项目自带）
- 微信开发者工具开启「增强编译」或「ES6 转 ES5」（用于兼容默认的 ESM 输出）

## 平台支持

目前**仅支持微信小程序**（`weapp`）。支付宝（`alipay`）、抖音（`tt`）小程序在待支持计划中。

## 下一步

- [快速开始](/guide/getting-started) — 5 分钟接入现有项目
- [构建流程](/guide/build-pipeline) — 了解 5 个构建阶段如何协作
