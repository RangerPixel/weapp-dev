import { merge } from "lodash-es";
import type { UserConfig as ViteUserConfig, ViteDevServer } from "vite";

import type { ResolvedWeappDevConfig } from "@/config/weappDevConfig";
import { DefaultWeappDevConfig } from "@/config/weappDevConfig";
import type { WeappTwContext } from "@/types/weapp-tw";
import { isDirectory } from "@/utils/fs/isDirectory";
import { resolve } from "@/utils/fs/resolve";
import { isTailwindcssEnabled } from "@/weapp/tw";

interface IWeappDevCtx {
  viteConfig: ViteUserConfig;
  viteDevServer?: ViteDevServer;
  config: ResolvedWeappDevConfig;
  weappTwCtx?: WeappTwContext;
}

export const WeappDevContext: IWeappDevCtx = {
  viteConfig: {},
  viteDevServer: undefined,
  config: DefaultWeappDevConfig,
  weappTwCtx: undefined,
} as Readonly<IWeappDevCtx>;

export const initWeappDevContext = async () => {
  const { loadConfigFromFile } = await import("vite");
  // 加载 vite 配置
  const viteConfigFile = await loadConfigFromFile({
    command: "build",
    mode: "",
  });
  // vite 配置
  WeappDevContext.viteConfig = viteConfigFile?.config || {};

  // 合并 WeappDev 配置
  WeappDevContext.config = merge({}, DefaultWeappDevConfig, viteConfigFile?.config.weapp || {});

  // 处理src: 如果用户配置的srcRoot是默认值"src"，但项目根目录下没有"src"文件夹而有"miniprogram"文件夹，则自动切换srcRoot为"miniprogram"
  if (WeappDevContext.config.srcRoot === "src" && !isDirectory(resolve("src"))) {
    if (!isDirectory(resolve("miniprogram"))) {
      console.warn("未检测到 src 或 miniprogram 文件夹，请检查项目目录结构 srcRoot 配置是否正确");
    } else {
      WeappDevContext.config.srcRoot = "miniprogram";
    }
  }

  // 归一化 cdn.dirs，确保均以 "/" 开头
  if (WeappDevContext.config.cdn?.dirs) {
    WeappDevContext.config.cdn.dirs = WeappDevContext.config.cdn.dirs.map((d) =>
      d.startsWith("/") ? d : `/${d}`,
    );
  }

  // 初始化 weapp tailwindcss 上下文
  if (isTailwindcssEnabled()) {
    const { createContext } = await import("weapp-tailwindcss/core");
    WeappDevContext.weappTwCtx = createContext(WeappDevContext.config.weappTwConfig);
    WeappDevContext.config.weappTwConfig.enable = true;
  } else {
    WeappDevContext.config.weappTwConfig.enable = false;
  }

  return WeappDevContext;
};
