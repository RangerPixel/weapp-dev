import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { ComponentRegistry } from "@/compiler/wxml/componentRegistry";
import { LocalComponentsResolver, VantResolver, TDesignResolver } from "@/config/componentResolver";
import type { WeappDevComponentsConfig } from "@/config/componentResolver";
import { WeappDevContext } from "@/config/mergedConfig";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试根目录
const TEST_ROOT = join(__dirname, "../.test-tmp");
const COMPONENTS_DIR = join(TEST_ROOT, "components");

// ========== 测试辅助函数 ==========

/**
 * 创建一个本地组件
 */
function createComponent(name: string, mode: "index" | "same-name" = "index", valid = true) {
  const dir = join(COMPONENTS_DIR, name);
  mkdirSync(dir, { recursive: true });

  const entryName = mode === "index" ? "index" : name;

  // 创建 .js 文件
  writeFileSync(join(dir, `${entryName}.js`), `Component({})`);

  // 创建 .json 文件
  const jsonContent = valid
    ? JSON.stringify({ component: true })
    : JSON.stringify({ component: false });
  writeFileSync(join(dir, `${entryName}.json`), jsonContent);

  // 创建 .wxml 和 .wxss
  writeFileSync(join(dir, `${entryName}.wxml`), `<view>${name}</view>`);
  writeFileSync(join(dir, `${entryName}.wxss`), `/* ${name} */`);
}

/**
 * 创建一个无效的组件目录
 */
function createInvalidComponent(name: string, reason: "no-js" | "no-json" | "component-false") {
  const dir = join(COMPONENTS_DIR, name);
  mkdirSync(dir, { recursive: true });

  if (reason !== "no-js") {
    writeFileSync(join(dir, "index.js"), `Component({})`);
  }

  if (reason !== "no-json") {
    const componentValue = reason === "component-false" ? false : true;
    writeFileSync(join(dir, "index.json"), JSON.stringify({ component: componentValue }));
  }
}

/**
 * 在指定目录创建组件（用于多目录测试）
 */
function createComponentInDir(baseDir: string, name: string) {
  const dir = join(TEST_ROOT, baseDir, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.js"), `Component({})`);
  writeFileSync(join(dir, "index.json"), JSON.stringify({ component: true }));
}

// ========== 测试套件 ==========

describe("ComponentRegistry", () => {
  beforeEach(() => {
    // 清理测试目录
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true });
    }
    mkdirSync(COMPONENTS_DIR, { recursive: true });

    // Mock WeappDevContext
    (WeappDevContext as any).config = {
      srcRoot: TEST_ROOT,
      outDir: join(TEST_ROOT, "dist"),
      components: "auto",
    };
  });

  afterEach(() => {
    // 清理测试目录
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true });
    }
  });

  describe("本地组件扫描 - index 模式", () => {
    it("应该识别 index.js + index.json 的组件", () => {
      // Arrange
      createComponent("my-button", "index");
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("my-button");

      // Assert
      expect(result).toBe("/components/my-button/index");
    });

    it("应该识别 index.ts + index.json 的组件", () => {
      // Arrange
      const dir = join(COMPONENTS_DIR, "my-card");
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "index.ts"), `Component({})`);
      writeFileSync(join(dir, "index.json"), JSON.stringify({ component: true }));

      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("my-card");

      // Assert
      expect(result).toBe("/components/my-card/index");
    });

    it("应该识别多个 index 模式组件", () => {
      // Arrange
      createComponent("my-button", "index");
      createComponent("my-card", "index");
      createComponent("my-list", "index");

      const registry = new ComponentRegistry("auto");

      // Act & Assert
      expect(registry.resolve("my-button")).toBe("/components/my-button/index");
      expect(registry.resolve("my-card")).toBe("/components/my-card/index");
      expect(registry.resolve("my-list")).toBe("/components/my-list/index");
    });
  });

  describe("本地组件扫描 - 同名模式", () => {
    it("应该识别 my-button.js + my-button.json 的组件", () => {
      // Arrange
      createComponent("user-avatar", "same-name");
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("user-avatar");

      // Assert
      expect(result).toBe("/components/user-avatar/user-avatar");
    });

    it("应该识别 my-button.ts + my-button.json 的组件", () => {
      // Arrange
      const dir = join(COMPONENTS_DIR, "product-list");
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "product-list.ts"), `Component({})`);
      writeFileSync(join(dir, "product-list.json"), JSON.stringify({ component: true }));

      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("product-list");

      // Assert
      expect(result).toBe("/components/product-list/product-list");
    });

    it("应该识别多个同名模式组件", () => {
      // Arrange
      createComponent("user-avatar", "same-name");
      createComponent("product-list", "same-name");

      const registry = new ComponentRegistry("auto");

      // Act & Assert
      expect(registry.resolve("user-avatar")).toBe("/components/user-avatar/user-avatar");
      expect(registry.resolve("product-list")).toBe("/components/product-list/product-list");
    });
  });

  describe("本地组件扫描 - index 模式优先", () => {
    it("同时存在两种模式时应该优先使用 index 模式", () => {
      // Arrange
      const dir = join(COMPONENTS_DIR, "mixed-comp");
      mkdirSync(dir, { recursive: true });

      // 同时存在 index.js 和 mixed-comp.js
      writeFileSync(join(dir, "index.js"), `Component({})`);
      writeFileSync(join(dir, "index.json"), JSON.stringify({ component: true }));
      writeFileSync(join(dir, "mixed-comp.js"), `Component({})`);
      writeFileSync(join(dir, "mixed-comp.json"), JSON.stringify({ component: true }));

      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("mixed-comp");

      // Assert
      expect(result).toBe("/components/mixed-comp/index");
    });
  });

  describe("本地组件扫描 - 无效组件", () => {
    it("缺少 .js/.ts 文件的目录不应该注册", () => {
      // Arrange
      createInvalidComponent("no-js", "no-js");
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("no-js");

      // Assert
      expect(result).toBeUndefined();
    });

    it("缺少 .json 文件的目录不应该注册", () => {
      // Arrange
      createInvalidComponent("no-json", "no-json");
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("no-json");

      // Assert
      expect(result).toBeUndefined();
    });

    it("component: false 的目录不应该注册", () => {
      // Arrange
      createInvalidComponent("not-component", "component-false");
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("not-component");

      // Assert
      expect(result).toBeUndefined();
    });

    it(".json 文件格式错误时不应该注册", () => {
      // Arrange
      const dir = join(COMPONENTS_DIR, "invalid-json");
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "index.js"), `Component({})`);
      writeFileSync(join(dir, "index.json"), `{ invalid json }`);

      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("invalid-json");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("Vant Resolver", () => {
    it("应该识别 van-button", () => {
      // Arrange
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("van-button");

      // Assert
      expect(result).toBe("@vant/weapp/button/index");
    });

    it("应该识别 van-icon", () => {
      // Arrange
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("van-icon");

      // Assert
      expect(result).toBe("@vant/weapp/icon/index");
    });

    it("应该识别多个 Vant 组件", () => {
      // Arrange
      const registry = new ComponentRegistry("auto");

      // Act & Assert
      expect(registry.resolve("van-button")).toBe("@vant/weapp/button/index");
      expect(registry.resolve("van-cell")).toBe("@vant/weapp/cell/index");
      expect(registry.resolve("van-popup")).toBe("@vant/weapp/popup/index");
    });
  });

  describe("TDesign Resolver", () => {
    it("应该识别 t-button", () => {
      // Arrange
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("t-button");

      // Assert
      expect(result).toBe("tdesign-miniprogram/button/button");
    });

    it("应该识别 t-cell", () => {
      // Arrange
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("t-cell");

      // Assert
      expect(result).toBe("tdesign-miniprogram/cell/cell");
    });

    it("应该识别多个 TDesign 组件", () => {
      // Arrange
      const registry = new ComponentRegistry("auto");

      // Act & Assert
      expect(registry.resolve("t-button")).toBe("tdesign-miniprogram/button/button");
      expect(registry.resolve("t-cell")).toBe("tdesign-miniprogram/cell/cell");
      expect(registry.resolve("t-popup")).toBe("tdesign-miniprogram/popup/popup");
    });
  });

  describe("优先级 - 本地组件 > Vant", () => {
    it("本地组件应该覆盖 Vant resolver", () => {
      // Arrange
      createComponent("van-button", "index");
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("van-button");

      // Assert
      expect(result).toBe("/components/van-button/index");
    });

    it("本地组件应该覆盖 TDesign resolver", () => {
      // Arrange
      createComponent("t-button", "index");
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("t-button");

      // Assert
      expect(result).toBe("/components/t-button/index");
    });
  });

  describe("自定义 Resolver - 本地路径", () => {
    it("应该使用本地路径而不是 npm 包名", () => {
      // Arrange
      // 创建本地目录，让 joinPath 能识别为本地路径
      mkdirSync(join(TEST_ROOT, "vant-weapp"), { recursive: true });

      const config: WeappDevComponentsConfig = [VantResolver({ from: "vant-weapp" })];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("van-button");

      // Assert
      expect(result).toBe("/vant-weapp/button/index");
    });

    it("应该处理相对路径 ./my-lib", () => {
      // Arrange
      // 创建真实目录，确保场景完整
      mkdirSync(join(TEST_ROOT, "my-lib"), { recursive: true });

      const config: WeappDevComponentsConfig = [
        {
          match: "my-",
          from: "./my-lib",
          template: "{name}/index",
        },
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("my-button");

      // Assert
      expect(result).toBe("/my-lib/button/index");
    });

    it("应该处理绝对路径 /my-lib", () => {
      // Arrange
      const config: WeappDevComponentsConfig = [
        {
          match: "my-",
          from: "/my-lib",
          template: "{name}/index",
        },
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("my-button");

      // Assert
      expect(result).toBe("/my-lib/button/index");
    });

    it("应该处理父级相对路径 ../my-lib", () => {
      // Arrange
      const config: WeappDevComponentsConfig = [
        {
          match: "my-",
          from: "../my-lib",
          template: "{name}/index",
        },
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("my-button");

      // Assert
      expect(result).toBe("/my-lib/button/index");
    });

    it("省略 template 时应该使用默认模板 {name}/index", () => {
      // Arrange
      const config: WeappDevComponentsConfig = [
        {
          match: "my-",
          from: "my-lib",
        },
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("my-button");

      // Assert
      expect(result).toBe("my-lib/button/index");
    });
  });

  describe("自定义 Resolver - NutUI", () => {
    it("应该识别 nut-button", () => {
      // Arrange
      const config: WeappDevComponentsConfig = [
        {
          match: "nut-",
          from: "@nutui/nutui-miniprogram",
          template: "{name}/index",
        },
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("nut-button");

      // Assert
      expect(result).toBe("@nutui/nutui-miniprogram/button/index");
    });
  });

  describe("Resolver overrides", () => {
    it("应该使用 overrides 覆盖默认路径", () => {
      // Arrange
      // 创建本地目录
      mkdirSync(join(TEST_ROOT, "my-components"), { recursive: true });

      const config: WeappDevComponentsConfig = [
        {
          match: "my-",
          from: "my-components",
          template: "{name}/index",
          overrides: {
            "my-user-card": "user/card",
            "my-btn": "button/index",
          },
        },
      ];
      const registry = new ComponentRegistry(config);

      // Act & Assert
      expect(registry.resolve("my-user-card")).toBe("/my-components/user/card");
      expect(registry.resolve("my-btn")).toBe("/my-components/button/index");
    });

    it("未在 overrides 中的组件应该使用默认模板", () => {
      // Arrange
      // 创建本地目录
      mkdirSync(join(TEST_ROOT, "my-components"), { recursive: true });

      const config: WeappDevComponentsConfig = [
        {
          match: "my-",
          from: "my-components",
          template: "{name}/index",
          overrides: {
            "my-special": "special/path",
          },
        },
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("my-normal");

      // Assert
      expect(result).toBe("/my-components/normal/index");
    });

    it("overrides 中不匹配 match 前缀的 key 不生效", () => {
      // Arrange
      // overrides 在 startsWith(match) 检查之后才查询，
      // 因此不匹配前缀的 key 永远不会命中
      const config: WeappDevComponentsConfig = [
        VantResolver({ overrides: { button: "custom/button" } }),
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("button");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("Resolver 顺序", () => {
    it("match 前缀有包含关系时排在前面的 resolver 优先", () => {
      // Arrange
      const config: WeappDevComponentsConfig = [
        { match: "my-", from: "lib-a" },
        { match: "my-special-", from: "lib-b" },
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("my-special-button");

      // Assert
      // my- 在前，先命中，name 为 'special-button'
      expect(result).toBe("lib-a/special-button/index");
    });
  });

  describe("禁用 Resolver", () => {
    it("enable: false 应该禁用 resolver", () => {
      // Arrange
      const config: WeappDevComponentsConfig = [
        VantResolver(),
        { match: "t-", enable: false, from: "tdesign-miniprogram" },
      ];
      const registry = new ComponentRegistry(config);

      // Act & Assert
      expect(registry.resolve("van-button")).toBe("@vant/weapp/button/index");
      expect(registry.resolve("t-button")).toBeUndefined();
    });

    it("enable: false 的本地目录 resolver 不参与扫描", () => {
      // Arrange
      createComponent("my-button", "index");

      const config: WeappDevComponentsConfig = [
        { from: "components", enable: false },
        VantResolver(),
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("my-button");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("函数式 Resolver", () => {
    it("应该支持函数式 resolver", () => {
      // Arrange
      const config: WeappDevComponentsConfig = [
        (tag: string) => {
          if (tag.startsWith("custom-")) {
            return `/custom/${tag}/index`;
          }
          return undefined;
        },
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("custom-widget");

      // Assert
      expect(result).toBe("/custom/custom-widget/index");
    });

    it("函数式 resolver 返回 undefined 时应该继续匹配", () => {
      // Arrange
      const config: WeappDevComponentsConfig = [
        (tag: string) => {
          if (tag.startsWith("custom-")) {
            return `/custom/${tag}/index`;
          }
          return undefined;
        },
        VantResolver(),
      ];
      const registry = new ComponentRegistry(config);

      // Act & Assert
      expect(registry.resolve("custom-widget")).toBe("/custom/custom-widget/index");
      expect(registry.resolve("van-button")).toBe("@vant/weapp/button/index");
    });

    it("函数式 resolver 返回空字符串应该继续匹配下一个 resolver", () => {
      // Arrange
      const config: WeappDevComponentsConfig = [() => "", VantResolver()];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("van-button");

      // Assert
      expect(result).toBe("@vant/weapp/button/index");
    });
  });

  describe("多个本地组件目录", () => {
    it("应该扫描多个本地组件目录", () => {
      // Arrange
      createComponent("my-button", "index");
      createComponentInDir("biz-components", "biz-header");

      const config: WeappDevComponentsConfig = [
        ...LocalComponentsResolver(["components", "biz-components"]),
      ];
      const registry = new ComponentRegistry(config);

      // Act & Assert
      expect(registry.resolve("my-button")).toBe("/components/my-button/index");
      expect(registry.resolve("biz-header")).toBe("/biz-components/biz-header/index");
    });

    it("同名组件时后面的目录覆盖前面的", () => {
      // Arrange
      createComponent("my-button", "index");
      createComponentInDir("biz-components", "my-button");

      const config: WeappDevComponentsConfig = [
        ...LocalComponentsResolver(["components", "biz-components"]),
      ];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("my-button");

      // Assert
      expect(result).toBe("/biz-components/my-button/index");
    });

    it("本地目录配置带 ./ 前缀时注册路径应该被规范化", () => {
      // Arrange
      createComponent("my-button", "index");

      const config: WeappDevComponentsConfig = [...LocalComponentsResolver(["./components"])];
      const registry = new ComponentRegistry(config);

      // Act
      const result = registry.resolve("my-button");

      // Assert
      expect(result).toBe("/components/my-button/index");
    });

    it("本地目录中的普通文件应该被跳过", () => {
      // Arrange
      writeFileSync(join(COMPONENTS_DIR, "helper.js"), `export {}`);
      writeFileSync(join(COMPONENTS_DIR, "README.md"), `# readme`);
      createComponent("my-button", "index");

      const registry = new ComponentRegistry("auto");

      // Act & Assert
      expect(registry.resolve("helper")).toBeUndefined();
      expect(registry.resolve("README")).toBeUndefined();
      expect(registry.resolve("my-button")).toBe("/components/my-button/index");
    });
  });

  describe("未识别的组件", () => {
    it("未识别的组件应该返回 undefined", () => {
      // Arrange
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("unknown-component");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("混合场景", () => {
    it("应该同时识别本地组件、Vant、TDesign 和 NutUI", () => {
      // Arrange
      createComponent("my-local-comp", "index");

      const config: WeappDevComponentsConfig = [
        ...LocalComponentsResolver(),
        VantResolver(),
        TDesignResolver(),
        { match: "nut-", from: "@nutui/nutui-miniprogram" },
      ];
      const registry = new ComponentRegistry(config);

      // Act & Assert
      expect(registry.resolve("my-local-comp")).toBe("/components/my-local-comp/index");
      expect(registry.resolve("van-button")).toBe("@vant/weapp/button/index");
      expect(registry.resolve("t-button")).toBe("tdesign-miniprogram/button/button");
      expect(registry.resolve("nut-button")).toBe("@nutui/nutui-miniprogram/button/index");
    });
  });

  describe("getRegisteredTags", () => {
    it("应该返回所有已注册的本地组件标签", () => {
      // Arrange
      createComponent("my-button", "index");
      createComponent("user-avatar", "same-name");

      const registry = new ComponentRegistry("auto");

      // Act
      const tags = registry.getRegisteredTags();

      // Assert
      expect(tags).toContain("my-button");
      expect(tags).toContain("user-avatar");
      expect(tags).toHaveLength(2);
    });

    it("没有本地组件时应该返回空数组", () => {
      // Arrange
      const registry = new ComponentRegistry("auto");

      // Act
      const tags = registry.getRegisteredTags();

      // Assert
      expect(tags).toEqual([]);
    });
  });

  describe("边界情况", () => {
    it("空配置数组应该返回 undefined", () => {
      // Arrange
      const registry = new ComponentRegistry([]);

      // Act
      const result = registry.resolve("van-button");

      // Assert
      expect(result).toBeUndefined();
    });

    it("组件目录不存在时应该跳过", () => {
      // Arrange
      rmSync(COMPONENTS_DIR, { recursive: true });
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("my-button");

      // Assert
      expect(result).toBeUndefined();
    });

    it("标签名为空字符串应该返回 undefined", () => {
      // Arrange
      const registry = new ComponentRegistry("auto");

      // Act
      const result = registry.resolve("");

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
