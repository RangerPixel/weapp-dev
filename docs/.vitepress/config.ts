import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "weapp-dev",
  description:
    "小程序原生开发增强工具 —— Vite + tsdown 驱动的 TypeScript / Tailwind CSS 小程序构建工具链",
  lang: "zh-CN",
  cleanUrls: true,
  base: "/weapp-dev/",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "指南", link: "/guide/getting-started" },
      { text: "配置", link: "/config/" },
      { text: "CLI", link: "/cli" },
    ],

    sidebar: [
      {
        text: "指南",
        items: [
          { text: "介绍", link: "/guide/" },
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "CLI 命令", link: "/cli" },
        ],
      },
      {
        text: "配置",
        items: [
          { text: "配置概览", link: "/config/" },
          { text: "weapp 配置", link: "/config/weapp" },
          { text: "Vite 配置扩展", link: "/config/vite" },
        ],
      },
      {
        text: "功能指南",
        items: [
          { text: "TypeScript 与分包", link: "/guide/typescript" },
          { text: "样式（WXSS）", link: "/guide/styling" },
          { text: "Tailwind CSS", link: "/guide/tailwindcss" },
          { text: "WXML 转译", link: "/guide/wxml" },
          { text: "组件自动注册", link: "/guide/components" },
          { text: "JSON 文件处理", link: "/guide/json-handling" },
          { text: "npm 依赖", link: "/guide/npm" },
          { text: "静态资源与 CDN", link: "/guide/assets-cdn" },
        ],
      },
      {
        text: "深入",
        items: [
          { text: "构建流程", link: "/guide/build-pipeline" },
          { text: "常见问题", link: "/guide/faq" },
        ],
      },
    ],

    outline: {
      level: [2, 3],
      label: "本页目录",
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    lastUpdated: {
      text: "最后更新于",
    },

    socialLinks: [{ icon: "github", link: "https://github.com/ReySun/weapp-dev" }],

    footer: {
      message: "基于 MIT 许可发布",
      copyright: "Copyright © 2025-present ReySun",
    },

    search: {
      provider: "local",
    },
  },
});
