# weapp-dev

## 0.0.10

### Patch Changes

- [`745dc11`](https://github.com/ReySun/weapp-dev/commit/745dc115f7f27bbe336632790e3c8779e248bfd8) Thanks [@ReySun](https://github.com/ReySun)! - feat: 实现组件自动注册功能，支持本地组件和三方库解析

  1. 新增组件注册表系统，支持自动扫描本地组件目录
  2. 内置 Vant、TDesign 组件库解析器，支持自定义配置
  3. 重构 WXML 组件检测逻辑，替换旧的 van-components 为 detectedComponents
  4. 添加测试用例覆盖组件解析全场景
  5. 配置 Vitest 测试环境与覆盖率统计
  6. 完善 TypeScript 配置与项目构建脚本

## 0.0.9

### Patch Changes

- [`2d4e924`](https://github.com/ReySun/weapp-dev/commit/2d4e924e9f9f5657972c607d48e44de7ec7d5b67) Thanks [@ReySun](https://github.com/ReySun)! - feat: 组件/页面的 wxss 转换支持 px2rpx rem2rpx 等属性

## 0.0.8

### Patch Changes

- [`7aa1b17`](https://github.com/ReySun/weapp-dev/commit/7aa1b175ba32d2fa938660e0e770c3edb80dd207) Thanks [@ReySun](https://github.com/ReySun)! - refactor(weapp-dev): add type safety for weapp tw context and pass config

  1. 新增 weapp-tw 类型定义文件，创建 WeappTwContext 类型
  2. 将各处的 any 类型上下文替换为强类型的 WeappTwContext
  3. 为 wxml 和 wxss 转换方法传入完整的配置参数

- [`7aa1b17`](https://github.com/ReySun/weapp-dev/commit/7aa1b175ba32d2fa938660e0e770c3edb80dd207) Thanks [@ReySun](https://github.com/ReySun)! - fix: 优化 srcRoot 处理逻辑，移除不必要的项目配置检查
  fix: 添加文件存在性检查，避免复制不存在或内容一致的文件导致开发者工具刷新的问题
  fix: 在 tsconfig.json 中添加 ignoreDeprecations 配置以处理弃用警告
  fix: 对 WeappCssProcessorList 进行排序以优化处理逻辑，避免 css 被优先选择作为默认 css 处理器的问题
  fix: 忽略 vite.config.ts 文件的监听

## 0.0.7

### Patch Changes

- [`c946b54`](https://github.com/ReySun/weapp-dev/commit/c946b54121219b6948d2701e64e5718f449f1a29) Thanks [@ReySun](https://github.com/ReySun)! - 增强 dev watch 模式下的 vite 和 tsdown 编译表现
