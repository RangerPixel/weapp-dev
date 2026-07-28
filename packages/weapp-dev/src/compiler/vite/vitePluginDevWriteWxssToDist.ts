import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import type { Plugin } from "vite";

import { WeappDevContext } from "@/config/mergedConfig";
import { replaceFileExt } from "@/utils/string/replaceFileExt";
import { replaceSrcToDist } from "@/utils/string/replaceSrcToDist";
import { getWeappFileFinalExtensions } from "@/weapp/platform";
import { WeappCssProcessorList } from "@/weapp/wxss";

export function vitePluginDevWriteWxssToDist(): Plugin {
  const { config, weappTwCtx } = WeappDevContext;
  const { srcRoot, outDir } = config;

  return {
    name: "weapp-dev-vite:dev-write-wxss-to-dist",

    apply: "serve",

    async transform(code: string, id: string) {
      if (id.includes("node_modules")) return;

      let dist = "";
      const wxssExt = WeappCssProcessorList.find((item) => id.endsWith(item));

      if (wxssExt) {
        // 转换src目录到dist目录
        dist = replaceSrcToDist(replaceFileExt(id, (await getWeappFileFinalExtensions()).wxss), {
          fromDir: srcRoot,
          toDir: outDir,
        });

        // 需要转换tw class
        if (weappTwCtx) {
          code = (
            await weappTwCtx.transformWxss(code, {
              postcssOptions: config.weappTwConfig?.postcssOptions,
              cssRemoveHoverPseudoClass: config.weappTwConfig?.cssRemoveHoverPseudoClass,
              cssPresetEnv: config.weappTwConfig?.cssPresetEnv,
              autoprefixer: config.weappTwConfig?.autoprefixer,
              cssCalc: config.weappTwConfig?.cssCalc,
              cssPreflight: config.weappTwConfig?.cssPreflight,
              cssPreflightRange: config.weappTwConfig?.cssPreflightRange,
              cssChildCombinatorReplaceValue: config.weappTwConfig?.cssChildCombinatorReplaceValue,
              injectAdditionalCssVarScope: config.weappTwConfig?.injectAdditionalCssVarScope,
              cssSelectorReplacement: config.weappTwConfig?.cssSelectorReplacement,
              rem2rpx: config.weappTwConfig?.rem2rpx,
              px2rpx: config.weappTwConfig?.px2rpx,
              unitsToPx: config.weappTwConfig?.unitsToPx,
            })
          ).css;
        }
      }

      if (dist) {
        mkdirSync(dirname(dist), { recursive: true });
        writeFileSync(dist, code);
      }
      return code;
    },
  };
}
