import { md5 } from "@/utils/md5";
import { diffSetString } from "@/utils/set/diffSetString";
import { isEqualSet } from "@/utils/set/isEqualSet";

import { extractWxmlTwClasses } from "./extractWxmlTwClasses";

interface IWxmlCache {
  fileMd5: string;
  classes: Set<string>;
  components: Set<string>;
}
type FilePath = string;

export const wxmlCache = new Map<FilePath, IWxmlCache>();

/**
 * 设置 WXML 文件的编存
 * @param file
 * @param content
 */
export function setWxmlCache(file: FilePath, content: string) {
  const { classes, components } = extractWxmlTwClasses(content);

  wxmlCache.set(file, {
    fileMd5: md5(content),
    classes,
    components,
  });
}

/**
 * 获取 WXML 文件的编存Md5
 * @param file
 */
export function getWxmlFileCachedMd5(file: FilePath) {
  const cache: IWxmlCache | undefined = wxmlCache.get(file);
  return cache?.fileMd5;
}

/**
 * 判断 WXML 文件是否变更
 * @param file
 * @param content
 * @returns
 */
export function isWxmlFileChanged(file: FilePath, content: string) {
  const beforeMd5 = getWxmlFileCachedMd5(file);
  const afterMd5 = md5(content);
  return beforeMd5 !== afterMd5;
}

/**
 * 获取 WXML 文件的编存class
 * @param file
 */
export function getWxmlFileCachedClassList(file: FilePath) {
  const cache: IWxmlCache | undefined = wxmlCache.get(file);
  return cache?.classes;
}

/**
 * 获取 WXML 文件的编存components
 * @param file
 */
export function getWxmlFileCachedComponets(file: FilePath) {
  const cache: IWxmlCache | undefined = wxmlCache.get(file);
  return cache?.components;
}

/**
 * 判断 WXML 文件的class是否变更过
 * @param file
 * @param content
 * @returns
 */
const emptySet = new Set<string>();

export function wxmlFileChangedInfo(file: FilePath, content: string) {
  const beforeClassList = getWxmlFileCachedClassList(file) || emptySet;
  const beforeComponents = getWxmlFileCachedComponets(file) || emptySet;

  const { classes: afterClassList, components: afterComponents } = extractWxmlTwClasses(content);

  return {
    isClassChanged: !isEqualSet(beforeClassList, afterClassList),
    classes: afterClassList,
    addedClass: diffSetString(afterClassList, beforeClassList),

    isComponentChanged: !isEqualSet(beforeComponents, afterComponents),
    components: afterComponents,
    detectedComponents: [...afterComponents],
    addedComponent: diffSetString(afterComponents, beforeComponents),
  };
}
