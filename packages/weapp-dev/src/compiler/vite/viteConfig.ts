import { globSync } from "tinyglobby";
import type { InlineConfig } from "vite";

import { vitePluginReplaceAssetPaths } from "@/compiler/replace";
import { WeappDevContext } from "@/config/mergedConfig";
import type { RolldownOutput } from "@/types/rolldown";
import { getAllWxssSrcPaths } from "@/weapp/wxss";

import { vitePluginDevFileWatcher } from "./vitePluginDevFileWatcher";
import { vitePluginDevWriteWxssToDist } from "./vitePluginDevWriteWxssToDist";

/**
 * 获取 wxss Vite 配置
 */
export async function getWxssViteConfig(isProd = false) {
  const { mergeConfig } = await import("vite");
  const { UnifiedViteWeappTailwindcssPlugin } = await import("weapp-tailwindcss/vite");
  const { config, viteConfig } = WeappDevContext;
  const { weappTwConfig } = config;

  // 默认启用 host，允许局域网访问（手机真机预览需要）
  // 用户可在 vite.config.ts 中显式配置 host: false 来关闭
  const mergedViteConfig = mergeConfig(
    {
      ...viteConfig,
      server: {
        ...viteConfig.server,
        host: viteConfig.server?.host ?? true,
      },
    },
    {
      ...getDefaultViteConfig(
        globSync([
          // src下的wxss相关文件
          ...(await getAllWxssSrcPaths()),
        ]),
        isProd,
      ),
      plugins: [
        weappTwConfig.enable
          ? UnifiedViteWeappTailwindcssPlugin({ ...weappTwConfig, logLevel: "silent" })
          : undefined,

        vitePluginReplaceAssetPaths(isProd),
        vitePluginDevWriteWxssToDist(),
        vitePluginDevFileWatcher(),
      ],
    },
  );

  return mergedViteConfig;
}

export function getDefaultViteConfig(input: string[], isProd = false): InlineConfig {
  return {
    logLevel: "silent",

    build: {
      emptyOutDir: false,
      minify: isProd,
      rolldownOptions: {
        input,
        output: getWxssPreserveModulesOutput(),
      },
    },
    plugins: [],
  };
}

export function getWxssPreserveModulesOutput(isProd: boolean = false): RolldownOutput {
  return {
    ...(isProd
      ? {
          sourcemap: false,
          minify: true,
        }
      : {
          sourcemap: false,
          minify: false,
        }),

    preserveModules: true,
    preserveModulesRoot: "src",
    chunkFileNames: "[name].js",
    assetFileNames: (assetInfo) => {
      const name = assetInfo.name || "";

      // 处理 css
      if (name.endsWith(".css")) {
        // 保留原路径 + 改后缀
        return name.replace(/\.css$/, ".wxss");
      }

      return name;
    },
  };
}
