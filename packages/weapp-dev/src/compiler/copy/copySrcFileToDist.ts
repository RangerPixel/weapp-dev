import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import { WeappDevContext } from "@/config/mergedConfig";
import { fsCopy, fsExists } from "@/utils/fs/fs";
import { copyLogger } from "@/utils/logger";

/**
 * 复制src文件到dist目录
 * @param srcPath
 * @param showLog
 */
export async function copySrcFileToDist(srcPath: string, showLog = false) {
  const { config } = WeappDevContext;
  const { srcRoot, outDir } = config;
  const distPath = srcPath.replace(new RegExp(`/${srcRoot}/`), `/${outDir}/`);

  if (!(await fsExists(srcPath))) {
    // copyLogger.warn(`${basename(srcPath)} 源文件不存在，跳过复制`);
    return;
  }

  if (await fsExists(distPath)) {
    try {
      const [srcBuf, distBuf] = await Promise.all([readFile(srcPath), readFile(distPath)]);
      if (srcBuf.equals(distBuf)) {
        if (showLog) {
          // copyLogger.info(`${basename(srcPath)} 内容一致，跳过复制`);
        }
        return;
      }
    } catch {
      // copyLogger.warn(`${basename(srcPath)} 读取文件失败，将继续复制`);
    }
  }

  await fsCopy(srcPath, distPath);
  if (showLog) {
    copyLogger.success(`${basename(srcPath)} 复制完成`);
  }
}
