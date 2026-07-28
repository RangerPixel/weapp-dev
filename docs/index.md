---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "weapp-dev"
  text: "小程序原生开发增强工具"
  tagline: Vite + tsdown（rolldown）驱动，让原生小程序用上 TypeScript 与 Tailwind CSS 的现代开发体验
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 配置参考
      link: /config/

features:
  - icon: ⚡️
    title: 极速 TypeScript 编译
    details: 基于 tsdown（rolldown 驱动）的 TS 打包，开发模式 watch 增量编译，自动识别页面 / 组件 / 分包入口并智能拆分代码。
  - icon: 🎨
    title: Tailwind CSS 开箱即用
    details: 内置 weapp-tailwindcss，WXML 中的 Tailwind 类名自动转义、WXSS 自动生成，类名变更自动增量更新全局样式。
  - icon: 🔥
    title: Vite 驱动的样式管道
    details: WXSS 编译基于 Vite，Less / Sass / Stylus 等预处理器安装即用，开发时由 Vite Dev Server 提供毫秒级样式热更新。
  - icon: 📦
    title: npm 依赖与子包分配
    details: 基于 miniprogram-ci 自动构建 npm 依赖，支持将指定依赖只打进子包、从主包移除，有效控制主包体积。
  - icon: ☁️
    title: 静态资源 CDN 外置
    details: 一键将包内静态资源外置到 CDN，自动改写 WXML / WXSS / JS 中的资源路径，显著减少主包体积。
  - icon: 🧩
    title: WXML 组件自动注册
    details: 自动检测 WXML 中使用的 Vant 组件并注册到页面 JSON，省去手动维护 usingComponents 的繁琐工作。
---
