# CLI 命令

`weapp-dev` 的命令行入口为 `weapp-dev`。

## weapp-dev dev

启动开发模式，别名 `serve`。

```bash
weapp-dev dev
# 等价于
weapp-dev serve
```

执行一次全量构建后启动 Vite Dev Server，监听 `srcRoot` 下的文件变更并增量编译，直到手动终止。

## weapp-dev build

生产构建，输出到 `outDir`。

```bash
weapp-dev build
```

### 按任务类型构建

`build` 支持传入一个或多个任务类型，只执行指定任务：

```bash
weapp-dev build              # 构建全部
weapp-dev build ts           # 只编译 TS
weapp-dev build ts wxss      # 只编译 TS 和 WXSS
```

可选的任务类型：

| 类型   | 说明                                                        |
| ------ | ----------------------------------------------------------- |
| `npm`  | 使用 miniprogram-ci 构建 npm 依赖                           |
| `wxss` | 通过 Vite 编译样式为 `.wxss`                                |
| `wxml` | 转译 WXML（Tailwind 类名转义、Vant 组件注册、CDN 路径替换） |
| `copy` | 复制 JSON / JS / WXS 及 `weapp.copy` 配置的静态资源         |
| `ts`   | 使用 tsdown 编译 TypeScript                                 |

::: warning 单独构建的注意事项
各任务之间存在隐含依赖（例如 WXML 增量编译依赖 WXSS 阶段生成的全局类名缓存）。日常请优先使用全量 `build` 或 `dev`，按类型构建主要用于调试。
:::

## 通用行为

- 运行命令时如果根目录没有 `project.config.json`，会交互式询问是否继续；
- 构建结束后会校验 `project.config.json` 的 `miniprogramRoot` 与 `outDir` 是否匹配，不匹配时输出警告。
