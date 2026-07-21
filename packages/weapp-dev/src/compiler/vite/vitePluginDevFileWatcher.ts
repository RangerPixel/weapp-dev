import path, { relative, resolve } from "node:path";

import { debounce } from "lodash-es";
import type { Plugin } from "vite";

import { WeappDevContext } from "@/config/mergedConfig";
import { fsRemove, fsStat } from "@/utils/fs/fs";
import { copyLogger, tsLogger, deleteLogger } from "@/utils/logger";
import { getWeappFileFinalExtensions } from "@/weapp/platform";
import { getAllWxmlExts } from "@/weapp/wxml";
import { WeappCssProcessorList } from "@/weapp/wxss";

import { copy } from "../copy/copy";
import { getMatchedCopyEntry } from "../copy/copyAssets";
import { compileTs, compileAllTs } from "../typescript/compileTs";
import { transformWxmlFile } from "../wxml/transformWxml";
import { compileWxss } from "../wxss/compileWxss";

export function vitePluginDevFileWatcher(): Plugin {
  return {
    name: "weapp-dev-vite:dev-file-watcher",

    apply: "serve",

    enforce: "post",

    async configureServer(server) {
      // 不监听dist下的文件变化
      server.watcher.unwatch(`${path.resolve(process.cwd(), WeappDevContext.config.outDir)}/**`);
      server.watcher.unwatch(`${path.resolve(process.cwd(), "vite.config.ts")}`);

      // 判断是 src 目录下的文件变化
      const isSrcRoot = (_path: string) => {
        return _path.startsWith(`${path.resolve(process.cwd(), WeappDevContext.config.srcRoot)}`);
      };

      server.watcher.once("ready", () => {
        console.log("监听就绪...");

        server.watcher.on("add", (path) => {
          if (!isSrcRoot(path)) {
            return;
          }
          getDebounceHandler(path, "add")();
        });
        server.watcher.on("change", (path) => {
          // src 外部、项目内的 TS 依赖，后续会注册到 vite watcher
          // src外的非ts文件变化直接跳过
          if (!path.endsWith(".ts") && !isSrcRoot(path)) {
            return;
          }
          getDebounceHandler(path, "change")();
        });
        server.watcher.on("unlink", (path) => {
          if (!isSrcRoot(path)) {
            return;
          }
          getDebounceHandler(path, "unlink")();
        });
      });
    },
  };
}

// 防抖函数映射，以文件路径+事件作为键
const debounceHandlers = new Map<string, ReturnType<typeof debounce>>();

// 获取或创建防抖处理函数
function getDebounceHandler(path: string, event: string) {
  const key = `${path}:${event}`;
  if (!debounceHandlers.has(key)) {
    console.log(`${event} -> ${relative(process.cwd(), path)}`);
    debounceHandlers.set(
      key,
      debounce(
        async () => {
          try {
            await handleFileEvent(path, event);
          } catch (error) {
            console.error(`处理文件事件失败 ${path}:`, error);
          } finally {
            // 处理完成后清理防抖函数，避免内存泄漏
            debounceHandlers.delete(key);
          }
        },
        200,
        { leading: false, trailing: true },
      ),
    );
  }
  return debounceHandlers.get(key)!;
}

// 处理文件事件的核心函数
async function handleFileEvent(path: string, event: string) {
  const fileExt = path.split(".").pop();
  const absolutePath = resolve(process.cwd(), path);
  // console.log(`absolutePath: ${absolutePath}, event: ${event}`);

  // 匹配需要copy的文件
  const matchedCopyEntry = await getMatchedCopyEntry(absolutePath);

  switch (event) {
    case "change":
    case "add":
      if (matchedCopyEntry) {
        await copy({
          copy: [matchedCopyEntry],
        });
        copyLogger.success(`${event}: ${path}`);
        return;
      }

      // wxml系列
      if (fileExt && getAllWxmlExts().includes(fileExt)) {
        // wxmlLogger.info(`${event}: ${path}`);
        await transformWxmlFile({ wxmlList: absolutePath, isIncremental: true });
      }
      // wxss系列
      else if (fileExt && WeappCssProcessorList.includes(fileExt as any)) {
        // wxssLogger.info(`${event}: ${path}`);
        await compileWxss(absolutePath);
      }
      // ts文件
      else if (path.endsWith(".ts")) {
        const unbundle = WeappDevContext.config.tsdown?.unbundle ?? false;
        // TODO 优化tsdown，只编译变更的文件
        if (unbundle) {
          tsLogger.info(`${event}: ${path}`);
          await compileTs(path);
        } else {
          await compileAllTs(false);
        }
      }
      // json文件
      else if (path.endsWith(".json")) {
        // copyLogger.info(`${event}: ${path}`);
        // await copyFile(absolutePath);
        await transformWxmlFile({
          wxmlList: absolutePath,
          isIncremental: true,
          isJsonChanged: true,
        });
      }
      break;

    case "unlink":
      // case "unlinkDir":
      if (matchedCopyEntry) {
        await cleanDistFileOrDirFromSrc(matchedCopyEntry.from);
      } else {
        await cleanDistFileOrDirFromSrc(path);
      }

      if (path.endsWith(".ts")) {
        // console.log("重新编译");
        await compileAllTs(false);
      } else {
        deleteLogger.info(`${event}: ${path}`);
      }

      break;
  }
}

// 清理dist目录中的对应文件
async function cleanDistFileOrDirFromSrc(srcPath: string) {
  const { config } = WeappDevContext;
  const finalWxssExt = (await getWeappFileFinalExtensions()).wxss;

  const { srcRoot, outDir } = config;
  const distPath = srcPath
    .replace(new RegExp(`(/*)${srcRoot}/`), `$1${outDir}/`)
    .replace(/\.ts$/, ".js")
    .replace(new RegExp(`.(${WeappCssProcessorList.join("|")})$`), `.${finalWxssExt}`);

  const stat = await fsStat(distPath);
  if (!stat) return;

  await fsRemove(distPath);
  // console.log(`清理${stat.isFile() ? "文件" : "目录"} ${distPath}`);
}
