/**
 * 组件自动注册 resolver 配置
 */
export interface WeappDevComponentResolver {
  /**
   * 组件标签前缀匹配（如 'van-'、't-'、'nut-'）
   *
   * 省略时为本地目录扫描模式：扫描 from 目录下的第一级子目录，
   * 目录名即组件标签名，要求目录下存在 index.js/index.ts 和 index.json（且 component: true）
   *
   * @example 'van-'
   */
  match?: string;

  /**
   * 组件来源：
   * - npm 包名：'@vant/weapp'、'tdesign-miniprogram'
   * - 本地目录：'src/components'、'src/vant-weapp'
   */
  from: string;

  /**
   * 路径模板，{name} 会被替换为去掉 match 前缀后的组件名
   *
   * 仅 match 存在时生效（本地目录扫描模式固定为 '{name}/index'）
   *
   * @default '{name}/index'
   * @example '{name}/{name}'  // tdesign-miniprogram 的目录结构
   */
  template?: string;

  /**
   * 个别组件名与路径不一致的覆盖
   *
   * key 为完整标签名，value 为相对于 from 的路径
   *
   * @example { 't-button-group': 'button/group' }
   */
  overrides?: Record<string, string>;

  /**
   * 是否禁用
   * @default true
   */
  enable?: boolean;
}

/**
 * 函数式 resolver（用于处理复杂场景）
 */
export type WeappDevComponentResolverFn = (tag: string) => string | undefined;

/**
 * components 配置项
 */
export type WeappDevComponentsConfigItem = WeappDevComponentResolver | WeappDevComponentResolverFn;

/**
 * components 配置
 *
 * - 'auto'：默认值，等效于 [LocalComponentsResolver(), VantResolver(), TDesignResolver()]
 * - 数组：自定义 resolver 列表
 */
export type WeappDevComponentsConfig = "auto" | WeappDevComponentsConfigItem[];

/**
 * 本地组件目录扫描 resolver
 *
 * 扫描指定目录下的第一级子目录，目录名即组件标签名。
 * 要求子目录下存在 index.js/index.ts 和 index.json（且 component: true），
 * 或存在同名文件（如 my-button/my-button.js + my-button.json）。
 *
 * @param dirs 组件目录列表（相对 srcRoot，不需要 'src/' 前缀）
 * @example LocalComponentsResolver(['components', 'biz-components'])
 */
export function LocalComponentsResolver(
  dirs: string[] = ["components"],
): WeappDevComponentResolver[] {
  return dirs.map((dir) => ({ from: dir }));
}

/**
 * Vant 组件库 resolver
 *
 * 默认配置：
 * - match: 'van-'
 * - from: '@vant/weapp'
 * - template: '{name}/index'
 *
 * @param options 覆盖默认配置（如 from 改为本地路径、添加 overrides 等）
 * @example VantResolver({ from: 'src/vant-weapp' })  // 手动复制 vant-weapp 源码改造
 */
export function VantResolver(
  options?: Partial<WeappDevComponentResolver>,
): WeappDevComponentResolver {
  return {
    match: "van-",
    from: "@vant/weapp",
    template: "{name}/index",
    ...options,
  };
}

/**
 * TDesign 组件库 resolver
 *
 * 默认配置：
 * - match: 't-'
 * - from: 'tdesign-miniprogram'
 * - template: '{name}/{name}'  // tdesign 的目录结构是 button/button.js 而非 button/index.js
 *
 * @param options 覆盖默认配置
 */
export function TDesignResolver(
  options?: Partial<WeappDevComponentResolver>,
): WeappDevComponentResolver {
  return {
    match: "t-",
    from: "tdesign-miniprogram",
    template: "{name}/{name}",
    ...options,
  };
}
