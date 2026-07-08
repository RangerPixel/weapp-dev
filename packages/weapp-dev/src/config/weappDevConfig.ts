import type { LogLevel } from "vite";
import type { createContext } from "weapp-tailwindcss/core";

import type { CopyOptions, CopyOptionsFn } from "@/compiler/copy/copy";
import type { WeappPlatform } from "@/weapp/platform";

/**
 * 静态资源 CDN 配置
 *
 * 将小程序包内静态资源外置到 CDN，减少包体积。
 *
 * 注意：启用该配置后，weapp.copy 中应尽量避免手动配置复制该目录下的文件，
 * 框架会自动处理资源复制逻辑（仅在未启用 CDN 替换时复制到 dist）。
 *
 * 若启用了 dev.enabled，开发时使用 Vite 本地服务提供资源，优先使用ip4，其次是localhost。
 * 手机真机预览时，需开启电脑代理并让手机连接代理才能访问cdn的静态资源地址
 * 否则应禁用 dev.enabled 并配置 url，让开发环境也走线上/测试环境 CDN 地址。
 */
export interface WeappDevCdnConfig {
  /**
   * 需要外置的静态资源目录，不需要写 `/` 前缀
   * @example ['assets', 'static']
   */
  dirs: string[];
  /**
   * 生产环境 CDN 地址前缀
   * @example 'https://cdn.example.com'
   */
  url: string;
  /**
   * 开发环境配置
   */
  dev?: {
    /**
     * 是否启用开发环境路径替换
     * @default false
     */
    enabled?: boolean;
    /**
     * 自定义开发前缀，默认使用 viteDevServer 地址
     * @example 'http://localhost:3000'
     */
    prefix?: string;
  };
}

type WeappTwConfig = Parameters<typeof createContext>[0];
export type WeappDevTwConfig = WeappTwConfig & {
  enable?: boolean;
};

/**
 * WeappDev 开发配置
 */
export interface WeappDevConfig {
  /**
   * 应用入口目录（`app.json` 所在目录）。
   * ts 模板在 `miniprogram` 目录；
   * @default 'src'
   */
  srcRoot?: string;

  /**
   * 输出目录
   * @default 'dist'
   */
  outDir?: string;

  /**
   * 是否清输出目录
   * @default true
   */
  emptyOutDir?: boolean;

  /**
   * 日志级别
   * @default 'info'
   */
  logLevel?: LogLevel;

  /**
   * The working directory of the config file.
   * - Defaults to `process.cwd()` for root config.
   * - Defaults to the package directory for workspace config.
   */
  cwd?: string;

  /**
   * 平台
   * @default 'weapp'
   *
   * "alipay" | "tt" 暂未测试过，暂时别用。
   */
  platform?: WeappPlatform;

  /**
   * 输出格式
   *
   * 推荐使用esm，打包之后选择微信开发者工具的“es6转es5”
   *
   * @default 'esm'
   *
   */
  format?: "esm" | "cjs";

  /**
   * Copy files to another directory.
   *
   * 复制文件配置，配置与tsdown的copy配置一致，与tsdown不同的是，开发环境会监听文件新增之后如果满足条件则增量复制
   *
   * 注意：js/wxs/json内部已处理，配置copy复制文件时应当忽略该类文件
   *
   * https://tsdown.dev/options/config-file
   * @example
   * ```ts
   * [
   *   'src/assets',
   *   'src/env.d.ts',
   *   'src/styles/**\/*.css',
   *   { from: 'src/assets', to: 'dist/assets' },
   *   { from: 'src/styles/**\/*.css', to: 'dist', flatten: true },
   * ]
   * ```
   */
  copy?: CopyOptions | CopyOptionsFn;

  /**
   * weapp-tailwindcss配置。如果你使用tw的话，可以自定义它
   *
   * https://www.npmjs.com/package/weapp-tailwindcss
   *
   * https://tw.icebreaker.top/docs/api/options/important
   */
  weappTwConfig?: WeappDevTwConfig;

  npm?: WeappDevNpmConfig;

  /**
   * 静态资源 CDN 配置
   */
  cdn?: WeappDevCdnConfig;

  /**
   * @experimental
   */
  tsdown?: {
    /**
     * @deprecated
     * 打包ts文件是否unbundle，直接沿用tsdown的unbundle配置
     *
     * 实测，项目比较大会导致微信开发者工具异常bug（猜猜是unbundle时js文件过多引起）
     */
    unbundle?: boolean;
  };
}

interface WeappDevNpmDependencies {
  dependencies: string[];
}

interface WeappDevNpmConfig {
  /**
   * 是否启用 npm 构建
   * @default true
   */
  enable?: boolean;
  /**
   * 是否缓存 npm 构建结果
   * @default true
   */
  cache?: boolean;
  /**
   * 主包依赖
   *
   * 一般不需要设置这个，package.json 中 dependencies的依赖会自动被添加到主包的依赖中。
   *
   * 设置了也没用，只要package.json 中 dependencies 有依赖便会打包。
   *
   * @deprecated
   */
  mainPackage?: WeappDevNpmDependencies;
  /**
   * 子包依赖
   *
   * 依赖仅在子包中使用时，可以这么设置。注意，设置子包的依赖后，主包中将不会存在该依赖。
   *
   * @example
   * ```ts
   * {
   *   sub1: {
   *     dependencies: ['mp-html'],
   *   },
   *   sub2: {
   *     dependencies: ['dayjs'],
   *   },
   * }
   * ```
   */
  subPackages?: Record<string, WeappDevNpmDependencies>;
}

/**
 * 解析后的 WeappDev 配置（所有带默认值的字段变为必填）
 */
export interface ResolvedWeappDevConfig extends WeappDevConfig {
  srcRoot: string;
  outDir: string;
  emptyOutDir: boolean;
  logLevel: LogLevel;
  cwd: string;
  platform: WeappPlatform;
  format: "esm" | "cjs";
  weappTwConfig: NonNullable<WeappDevConfig["weappTwConfig"]>;
  npm: NonNullable<WeappDevConfig["npm"]>;
}

export const DefaultWeappDevConfig: ResolvedWeappDevConfig = {
  srcRoot: "src",
  outDir: "dist",
  logLevel: "info",
  platform: "weapp",
  format: "esm",
  cwd: process.cwd(),
  emptyOutDir: true,
  weappTwConfig: {
    customAttributes: {
      "*": [/[a-z]+Class|[^-\s]+-class|className/],
    },
    logLevel: "silent",
  },
  npm: {
    enable: true,
    cache: true,
  },
};
