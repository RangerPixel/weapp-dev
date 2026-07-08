import { globSync } from "tinyglobby";

import { WeappDevContext } from "@/config/mergedConfig";
import { fsStat } from "@/utils/fs/fs";

import { getWeappFileFinalExtensions } from "./platform";

export enum CssProcessorEnum {
  css = "css",
  less = "less",
  sass = "sass",
  scss = "scss",
  styl = "styl",
  stylus = "stylus",
  postcss = "postcss",
}

export type WeappCssProcessorKey = keyof typeof CssProcessorEnum;

export const WeappCssProcessorList = Object.values(CssProcessorEnum).sort(
  (a, b) => b.length - a.length,
) as WeappCssProcessorKey[];

/**
 * 获取 WXSS 文件最终路径
 * @returns
 */
export const getAppWxssDistPath = async () => {
  const { outDir } = WeappDevContext.config;
  return `${outDir}/app.${(await getWeappFileFinalExtensions()).wxss}`;
};

let appSrcWxssPath = "";

/**
 * 获取 WXSS 文件源路径
 * @returns
 */
export const getAppWxssSrcPath = async () => {
  if (appSrcWxssPath) {
    return appSrcWxssPath;
  }

  const { srcRoot } = WeappDevContext.config;
  const paths = WeappCssProcessorList.map((ext) => `${srcRoot}/app.${ext}`);
  const stats = await Promise.all(paths.map(fsStat));
  appSrcWxssPath = paths.find((_, i) => stats[i]) || "";
  return appSrcWxssPath;
};

/**
 * 获取所有 WXSS 文件源路径
 * @returns
 */
export const getAllWxssSrcPaths = async () => {
  const { srcRoot } = WeappDevContext.config;
  const styles = globSync([`${srcRoot}/**/*.{${WeappCssProcessorList.join(",")}}`]);
  return styles;
};
