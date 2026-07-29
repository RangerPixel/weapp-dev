---
"weapp-dev": patch
---

feat: 实现组件自动注册功能，支持本地组件和三方库解析

1. 新增组件注册表系统，支持自动扫描本地组件目录
2. 内置 Vant、TDesign 组件库解析器，支持自定义配置
3. 重构 WXML 组件检测逻辑，替换旧的 van-components 为 detectedComponents
4. 添加测试用例覆盖组件解析全场景
5. 配置 Vitest 测试环境与覆盖率统计
6. 完善 TypeScript 配置与项目构建脚本
