import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import type {
  WeappDevComponentsConfig,
  WeappDevComponentsConfigItem,
} from "@/config/componentResolver";
import { LocalComponentsResolver, VantResolver, TDesignResolver } from "@/config/componentResolver";
import { WeappDevContext } from "@/config/mergedConfig";

/**
 * 组件注册表
 *
 * 负责：
 * 1. 扫描本地组件目录
 * 2. 管理 resolver 列表
 * 3. 解析组件标签到注册路径
 */
export class ComponentRegistry {
  /** 本地组件映射：标签名 -> 绝对路径（/ 开头，相对 srcRoot） */
  private localComponents = new Map<string, string>();

  /** resolver 列表（用户配置 + 内置） */
  private resolvers: WeappDevComponentsConfigItem[] = [];

  constructor(config: WeappDevComponentsConfig = "auto") {
    if (config === "auto") {
      // 默认配置：本地目录 + Vant + TDesign
      this.resolvers = [...LocalComponentsResolver(), VantResolver(), TDesignResolver()];
    } else {
      this.resolvers = config;
    }

    // 扫描本地组件目录
    this.scanLocalComponents();
  }

  /**
   * 清洗相对路径前缀（./ 和 ../），使注册路径不包含 . 或 .. 段
   */
  private static cleanRelativePrefix(path: string): string {
    return path.replace(/^(\.\.?\/)+/, "");
  }

  /**
   * 扫描本地组件目录
   *
   * 只扫描第一级子目录，目录名即组件标签名。
   * 支持两种文件组织模式：
   * 1. index 模式（优先）：index.js/index.ts + index.json（且 component: true）
   * 2. 同名模式：my-button.js/my-button.ts + my-button.json（且 component: true）
   */
  private scanLocalComponents() {
    const { srcRoot } = WeappDevContext.config;

    for (const resolver of this.resolvers) {
      // 跳过函数式 resolver 和禁用项
      if (typeof resolver === "function" || resolver.enable === false) {
        continue;
      }

      // 只处理本地目录扫描模式（无 match）
      if (resolver.match) {
        continue;
      }

      const dir = resolver.from;
      const absDir = join(srcRoot, dir);

      if (!existsSync(absDir) || !statSync(absDir).isDirectory()) {
        continue;
      }

      const entries = readdirSync(absDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const tagName = entry.name;
        const componentDir = join(absDir, tagName);

        // 校验并获取组件入口文件名（index 或目录同名）
        const entryName = this.getComponentEntryName(componentDir, tagName);
        if (!entryName) {
          continue;
        }

        // 注册路径：/components/my-button/index 或 /components/my-button/my-button
        const registerPath = `/${ComponentRegistry.cleanRelativePrefix(dir)}/${tagName}/${entryName}`;
        this.localComponents.set(tagName, registerPath);
      }
    }
  }

  /**
   * 获取组件入口文件名
   *
   * 支持两种模式：
   * 1. index 模式：index.js/index.ts + index.json（优先）
   * 2. 同名模式：my-button.js/my-button.ts + my-button.json
   *
   * 要求对应的 .json 文件中 component: true
   *
   * @param dir 组件目录绝对路径
   * @param dirName 目录名
   * @returns 入口文件名（'index' 或目录名），无效时返回 null
   */
  private getComponentEntryName(dir: string, dirName: string): string | null {
    // 模式 1：index.*（优先）
    if (this.isValidComponentEntry(dir, "index")) {
      return "index";
    }

    // 模式 2：目录同名（如 my-button/my-button.js）
    if (this.isValidComponentEntry(dir, dirName)) {
      return dirName;
    }

    return null;
  }

  /**
   * 校验组件入口文件是否有效
   *
   * 要求：
   * 1. 存在 {name}.js 或 {name}.ts
   * 2. 存在 {name}.json 且 component: true
   */
  private isValidComponentEntry(dir: string, name: string): boolean {
    const jsFile = join(dir, `${name}.js`);
    const tsFile = join(dir, `${name}.ts`);
    const jsonFile = join(dir, `${name}.json`);

    // 检查 .js 或 .ts
    if (!existsSync(jsFile) && !existsSync(tsFile)) {
      return false;
    }

    // 检查 .json 且 component: true
    if (!existsSync(jsonFile)) {
      return false;
    }

    try {
      const json = JSON.parse(readFileSync(jsonFile, "utf-8"));
      return json.component === true;
    } catch {
      return false;
    }
  }

  /**
   * 解析组件标签到注册路径
   *
   * 优先级：
   * 1. 本地组件（localComponents）
   * 2. 用户 resolvers 和内置 resolvers（按数组顺序）
   *
   * @param tag 组件标签名（kebab-case）
   * @returns 注册路径，未匹配时返回 undefined
   */
  resolve(tag: string): string | undefined {
    // 1. 本地组件优先
    if (this.localComponents.has(tag)) {
      return this.localComponents.get(tag);
    }

    // 2. 按顺序走 resolvers
    for (const resolver of this.resolvers) {
      // 函数式 resolver
      if (typeof resolver === "function") {
        const result = resolver(tag);
        if (result) {
          return result;
        }
        continue;
      }

      // 跳过禁用项
      if (resolver.enable === false) {
        continue;
      }

      // 跳过本地目录扫描模式（已在第 1 步处理）
      if (!resolver.match) {
        continue;
      }

      // 前缀匹配
      if (!tag.startsWith(resolver.match)) {
        continue;
      }

      // 优先查 overrides
      if (resolver.overrides?.[tag]) {
        return this.joinPath(resolver.from, resolver.overrides[tag]);
      }

      // 按模板生成路径
      const name = tag.slice(resolver.match.length);
      const template = resolver.template ?? "{name}/index";
      const subPath = template.replaceAll("{name}", name);
      return this.joinPath(resolver.from, subPath);
    }

    return undefined;
  }

  /**
   * 拼接路径
   *
   * - npm 包名：直接拼接（'@vant/weapp' + 'button/index' → '@vant/weapp/button/index'）
   * - 本地目录：转绝对路径（'vant-weapp' + 'button/index' → '/vant-weapp/button/index'）
   *
   * 判断规则：如果 base 在 srcRoot 下存在（或是相对路径 ./ ../ /），则视为本地目录
   */
  private joinPath(base: string, sub: string): string {
    const { srcRoot } = WeappDevContext.config;

    // 明确的本地路径（./ ../ /）
    if (base.startsWith(".") || base.startsWith("/")) {
      const cleanBase = base.replace(/^\/+/, "").replace(/^(\.\.?\/)+/, "");
      return `/${cleanBase}/${sub}`;
    }

    // 检查 base 是否存在于 srcRoot 下（本地目录）
    const absPath = join(srcRoot, base);
    if (existsSync(absPath)) {
      return `/${base}/${sub}`;
    }

    // 否则视为 npm 包名
    return `${base}/${sub}`;
  }

  /**
   * 获取所有已识别的组件标签（用于调试/日志）
   */
  getRegisteredTags(): string[] {
    return [...this.localComponents.keys()];
  }
}

/** 全局单例 */
let registry: ComponentRegistry | null = null;

/**
 * 获取全局组件注册表实例
 */
export function getComponentRegistry(): ComponentRegistry {
  if (!registry) {
    const { components } = WeappDevContext.config;
    registry = new ComponentRegistry(components);
  }
  return registry;
}

/**
 * 重置全局实例（用于测试或配置变更后重建）
 */
export function resetComponentRegistry() {
  registry = null;
}
