---
"weapp-dev": patch
---

fix: 优化 srcRoot 处理逻辑，移除不必要的项目配置检查
fix: 添加文件存在性检查，避免复制不存在或内容一致的文件导致开发者工具刷新的问题
fix: 在 tsconfig.json 中添加 ignoreDeprecations 配置以处理弃用警告
fix: 对 WeappCssProcessorList 进行排序以优化处理逻辑，避免css被优先选择作为默认css处理器的问题
fix: 忽略vite.config.ts文件的监听
