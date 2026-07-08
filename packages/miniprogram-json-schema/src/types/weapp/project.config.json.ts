export interface WeappProjectConfigJson {
  libVersion?: ("" | "development" | "latest" | "trial" | "widelyUsed") | string;
  editorSetting?: {
    tabIndent?: "auto" | "insertSpaces" | "tab";
    tabSize?: "\t" | number;
  };
  cloudfunctionRoot?: string;
  cloudfunctionTemplateRoot?: string;
  cloudcontainerRoot?: string;
  srcMiniprogramRoot?: string;
  description?: string;
  simulatorType?: string;
  simulatorPluginLibVersion?: unknown;
  miniprogramRoot?: string;
  qcloudRoot?: string;
  pluginRoot?: string;
  cloudbaseRoot?: string;
  compileType?: string;
  pluginAppid?: string;
  jsserverRoot?: string;
  projectname?: string;
  appid?: string;
  packOptions?: {
    ignore?: {
      type: string;
      value: string;
    }[];
    include?: {
      type: string;
      value: string;
    }[];
  };
  watchOptions?: {
    ignore?: string[];
  };
  setting?: {
    es6?: boolean;
    enhance?: boolean;
    postcss?: boolean;
    minified?: boolean;
    minifyWXSS?: boolean;
    minifyWXML?: boolean;
    uglifyFileName?: boolean;
    ignoreUploadUnusedFiles?: boolean;
    ignoreCodeQuality?: boolean;
    autoAudits?: boolean;
    urlCheck?: boolean;
    compileHotReLoad?: boolean;
    preloadBackgroundData?: boolean;
    lazyloadPlaceholderEnable?: boolean;
    useStaticServer?: boolean;
    babelSetting?: {
      outputPath?: string;
      ignore?: string[];
      disablePlugins?: unknown[];
    };
    useCompilerPlugins?: ("less" | "sass" | "typescript")[] | false;
    disableUseStrict?: boolean;
    uploadWithSourceMap?: boolean;
    localPlugins?: boolean;
    packNpmManually?: boolean;
    packNpmRelationList?: {
      packageJsonPath: string;
      miniprogramNpmDistDir: string;
    }[];
    coverView?: boolean;
    ignoreDevUnusedFiles?: boolean;
    checkInvalidKey?: boolean;
    showShadowRootInWxmlPanel?: boolean;
    useIsolateContext?: boolean;
    useMultiFrameRuntime?: boolean;
    useApiHook?: boolean;
    useApiHostProcess?: boolean;
    useLanDebug?: boolean;
    enableEngineNative?: boolean;
    showES6CompileOption?: boolean;
    minifyWXMLSetting?: {
      global: {
        collapseWhitespace?: boolean;
        conservativeCollapse?: boolean;
        preserveLineBreaks?: boolean;
      };
      [k: string]: {
        collapseWhitespace?: boolean;
        conservativeCollapse?: boolean;
        preserveLineBreaks?: boolean;
      };
    };
  };
  staticServerOptions?: {
    servePath?: string;
  };
  scripts?: {
    beforeCompile?: string;
    beforePreview?: string;
    beforeUpload?: string;
  };
  debugOptions?: {
    hideInDevtools?: string[];
  };
  condition?: {
    game?: {
      current?: number;
      list?: {
        name?: string;
        pathName?: string;
        query?: string;
        scene?: null | string | number;
        shareInfo?: unknown;
        referrerInfo?: unknown;
        chatroomUsernameInfo?: unknown;
        groupInfo?: unknown;
      }[];
    };
    gamePlugin?: {
      current?: number;
      list?: {
        name?: string;
        query?: string;
        scene?: null | string | number;
        shareInfo?: unknown;
        referrerInfo?: unknown;
        groupInfo?: unknown;
      }[];
    };
    plugin?: {
      current?: number;
      list?: {
        name?: string;
        pathName?: string;
        query?: string;
        launchMode?: string;
        scene?: null | string | number;
        shareInfo?: unknown;
        referrerInfo?: unknown;
        groupInfo?: unknown;
      }[];
    };
    miniprogram?: {
      current?: number;
      list?: {
        name?: string;
        pathName?: string;
        query?: string;
        launchMode?: string;
        scene?: null | string | number;
        partialCompile?: {
          enabled?: boolean;
          pages?: unknown[];
        };
        shareInfo?: unknown;
        referrerInfo?: unknown;
        chatroomUsernameInfo?: unknown;
        groupInfo?: unknown;
      }[];
    };
  };
  skeletonConfig?: {
    global: ISkeletonConfig;
    [k: string]: ISkeletonConfig;
  };
}
export interface ISkeletonConfig {
  loading?: "" | "chiaroscuro" | "shine" | "spin";
  outline?: {
    remain: boolean;
    replace: string;
  };
  text?: {
    color: string;
  };
  image?: {
    color: string;
    shape: "" | "circle" | "rect";
    shapeOpposite: string[];
  };
  button?: {
    color: string;
    excludes: string[];
  };
  pseudo?: {
    color: string;
    shape: "circle" | "rect";
  };
  excludes?: string[];
  remove?: string[];
  grayBlock?: string[];
  showNative?: boolean;
  backgroundColor?: string;
  mode?: "auto" | "fullscreen";
  templateName?: string;
  cssUnit?: "rem" | "rpx" | "vh" | "vmax" | "vmin" | "vw";
  decimal?: number;
}
