---
"weapp-dev": patch
---

refactor(weapp-dev): add type safety for weapp tw context and pass config

1. 新增weapp-tw类型定义文件，创建WeappTwContext类型
2. 将各处的any类型上下文替换为强类型的WeappTwContext
3. 为wxml和wxss转换方法传入完整的配置参数
