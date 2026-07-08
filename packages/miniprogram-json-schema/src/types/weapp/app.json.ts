export type IPlatform = "mini-android" | "mini-ios" | "mini-ohos" | "mini-weixin";

export interface WeappAppJson {
  pages: string[];
  static?: IAppJSONStaticConfig[];
  "mini-ios"?: IOriginAppJSON & {
    pages?: string[];
  };
  "mini-android"?: IOriginAppJSON & {
    pages?: string[];
  };
  "mini-weixin"?: IOriginAppJSON & {
    pages?: string[];
  };
  __warning__?: string;
  window?: IWindow;
  plugins?: {
    [k: string]: IPluginConfig;
  };
  entryPagePath?: string;
  permission?: {
    "scope.userLocation"?: {
      desc: string;
    };
    "scope.userFuzzyLocation"?: {
      desc: string;
    };
  };
  workers?:
    | {
        path: string;
        isSubpackage: boolean;
      }
    | string;
  subPackages?: ISubPackageItem[];
  subpackages?: ISubPackageItem[];
  agent?: {
    [k: string]: unknown;
  };
  chatTools?: {
    root: string;
    entryPagePath: string;
    desc: string;
    scopes?: string[];
  }[];
  preloadRule?: {
    [k: string]: {
      network?: "all" | "wifi";
      packages: string[];
    };
  };
  usingComponents?: {
    [k: string]: string;
  };
  componentPlaceholder?: {
    [k: string]: string;
  };
  tabBar?: ITabBar;
  appBar?: IAppBar;
  requiredBackgroundModes?: string[];
  mimeTypeDeclarations?: {
    [k: string]: string[];
  };
  networkTimeout?: {
    request?: number;
    connectSocket?: number;
    uploadFile?: number;
    downloadFile?: number;
  };
  debug?: boolean;
  resizable?: boolean;
  displayMode?: "desktop" | "mobile" | "pad";
  frameset?: boolean;
  functionalPages?:
    | {
        independent: boolean;
      }
    | boolean;
  cloud?: boolean;
  cloudVersion?: string;
  cloudConfig?: {
    gatewayDomain?: string;
    publicKey?: string;
    gatewayId?: string;
  };
  openDataContext?: string;
  openLocationPagePath?: string;
  sitemapLocation?: string;
  serviceProviderTicket?: string;
  style?: "v2";
  useExtendedLib?: {
    [k: string]: string | boolean;
  };
  entranceDeclare?: {
    locationMessage?: {
      path?: string;
      query?: string;
    };
  };
  darkmode?: boolean;
  themeLocation?: string;
  theme?: string;
  singlePage?: {
    navigationBarFit?: "float" | "squeezed";
  };
  /**
   * 小程序按需注入
   *
   * https://developers.weixin.qq.com/miniprogram/dev/framework/ability/lazyload.html
   */
  lazyCodeLoading?: "requiredComponents";
  lazyCodeLoadingLegacy?: boolean;
  enablePassiveEvent?:
    | {
        [k: string]: boolean;
      }
    | boolean;
  requireBackgroundModes?: string[];
  embeddedAppIdList?: string[];
  renderer?: "skyline" | "webview";
  resolveAlias?: {
    [k: string]: string;
  };
  debugOptions?: {
    enableFPSPanel?: boolean;
  };
  halfPage?: {
    firstPageNavigationStyle?: "custom" | "default";
  };
  requiredPrivateInfos?: (
    | "chooseAddress"
    | "chooseLocation"
    | "choosePoi"
    | "getFuzzyLocation"
    | "getLocation"
    | "onLocationChange"
    | "startLocationUpdate"
    | "startLocationUpdateBackground"
  )[];
  rendererOptions?: {
    defaultDisplayBlock?: boolean;
    skyline?: {
      disableABTest?: boolean;
      sdkVersionBegin?: string;
      sdkVersionEnd?: string;
      iosVersionBegin?: string;
      iosVersionEnd?: string;
      androidVersionBegin?: string;
      androidVersionEnd?: string;
      ohosVersionBegin?: string;
      ohosVersionEnd?: string;
    } & ISkylineFeatures;
  };
  componentFramework?: "exparser" | "glass-easel";
  accountCardPackage?: {
    root: string;
    cardList: {
      type: number;
      componentPath: string;
    }[];
  };
  xrEntryPagePath?: string;
  miniApp?: {
    useAuthorizePage?: boolean;
  };
  __usePrivacyCheck__?: boolean;
  keepContextPageInCycleJump?: boolean;
}
export interface IAppJSONStaticConfig {
  pattern: string;
  platforms: IPlatform[];
}
export interface IOriginAppJSON {
  __warning__?: string;
  window?: IWindow;
  plugins?: {
    [k: string]: IPluginConfig;
  };
  entryPagePath?: string;
  permission?: {
    "scope.userLocation"?: {
      desc: string;
    };
    "scope.userFuzzyLocation"?: {
      desc: string;
    };
  };
  workers?:
    | {
        path: string;
        isSubpackage: boolean;
      }
    | string;
  subPackages?: ISubPackageItem[];
  subpackages?: ISubPackageItem[];
  agent?: {
    [k: string]: unknown;
  };
  chatTools?: {
    root: string;
    entryPagePath: string;
    desc: string;
    scopes?: string[];
  }[];
  preloadRule?: {
    [k: string]: {
      network?: "all" | "wifi";
      packages: string[];
    };
  };
  usingComponents?: {
    [k: string]: string;
  };
  componentPlaceholder?: {
    [k: string]: string;
  };
  tabBar?: ITabBar;
  appBar?: IAppBar;
  requiredBackgroundModes?: string[];
  mimeTypeDeclarations?: {
    [k: string]: string[];
  };
  networkTimeout?: {
    request?: number;
    connectSocket?: number;
    uploadFile?: number;
    downloadFile?: number;
  };
  debug?: boolean;
  resizable?: boolean;
  displayMode?: "desktop" | "mobile" | "pad";
  frameset?: boolean;
  functionalPages?:
    | {
        independent: boolean;
      }
    | boolean;
  cloud?: boolean;
  cloudVersion?: string;
  cloudConfig?: {
    gatewayDomain?: string;
    publicKey?: string;
    gatewayId?: string;
  };
  openDataContext?: string;
  openLocationPagePath?: string;
  sitemapLocation?: string;
  serviceProviderTicket?: string;
  style?: "v2";
  useExtendedLib?: {
    [k: string]: string | boolean;
  };
  entranceDeclare?: {
    locationMessage?: {
      path?: string;
      query?: string;
    };
  };
  darkmode?: boolean;
  themeLocation?: string;
  theme?: string;
  singlePage?: {
    navigationBarFit?: "float" | "squeezed";
  };
  /**
   * 小程序按需注入
   *
   * https://developers.weixin.qq.com/miniprogram/dev/framework/ability/lazyload.html
   */
  lazyCodeLoading?: "requiredComponents";
  lazyCodeLoadingLegacy?: boolean;
  enablePassiveEvent?:
    | {
        [k: string]: boolean;
      }
    | boolean;
  requireBackgroundModes?: string[];
  embeddedAppIdList?: string[];
  renderer?: "skyline" | "webview";
  resolveAlias?: {
    [k: string]: string;
  };
  debugOptions?: {
    enableFPSPanel?: boolean;
  };
  halfPage?: {
    firstPageNavigationStyle?: "custom" | "default";
  };
  requiredPrivateInfos?: (
    | "chooseAddress"
    | "chooseLocation"
    | "choosePoi"
    | "getFuzzyLocation"
    | "getLocation"
    | "onLocationChange"
    | "startLocationUpdate"
    | "startLocationUpdateBackground"
  )[];
  rendererOptions?: {
    defaultDisplayBlock?: boolean;
    skyline?: {
      disableABTest?: boolean;
      sdkVersionBegin?: string;
      sdkVersionEnd?: string;
      iosVersionBegin?: string;
      iosVersionEnd?: string;
      androidVersionBegin?: string;
      androidVersionEnd?: string;
      ohosVersionBegin?: string;
      ohosVersionEnd?: string;
    } & ISkylineFeatures;
  };
  componentFramework?: "exparser" | "glass-easel";
  accountCardPackage?: {
    root: string;
    cardList: {
      type: number;
      componentPath: string;
    }[];
  };
  xrEntryPagePath?: string;
  miniApp?: {
    useAuthorizePage?: boolean;
  };
  __usePrivacyCheck__?: boolean;
  keepContextPageInCycleJump?: boolean;
}
export interface IWindow {
  backgroundColorTop?: string;
  backgroundColorBottom?: string;
  backgroundColorContent?: string;
  backgroundColor?: string;
  enablePullDownRefresh?: boolean;
  navigationBarTextStyle?: ("black" | "white") | string;
  navigationBarTitleText?: string;
  navigationStyle?: "custom" | "default";
  backgroundTextStyle?: ("dark" | "light") | string;
  onReachBottomDistance?: number;
  pageOrientation?: "auto" | "landscape" | "portrait";
  navigationBarBackgroundColor?: string;
  renderingMode?: "mixed" | "seperated";
  restartStrategy?: "homePage" | "homePageAndLatestPage";
  visualEffectInBackground?: "hidden" | "none";
  initialRenderingCache?: "capture" | "dynamic" | "static";
  handleWebviewPreload?: "auto" | "manual" | "static";
  homeButton?: boolean;
}
export interface IPluginConfig {
  provider: string;
  version: string;
  path?: string;
  export?: string;
  genericsImplementation?: {
    [k: string]: {
      [k: string]: string;
    };
  };
}
export interface ISubPackageItem {
  independent?: boolean;
  name?: string;
  entry?: string;
  root: string;
  pages: string[];
  plugins?: {
    [k: string]: IPluginConfig;
  };
  useExtendedLib?: {
    [k: string]: string | boolean;
  };
  componentFramework?: string;
  renderer?: string;
}
export interface ITabBar {
  custom?: boolean;
  list: {
    pagePath: string;
    text?: string;
    iconPath?: string;
    selectedIconPath?: string;
    renderer?: "cover-view" | "skyline" | "webview";
  }[];
  borderStyle?: ("black" | "white") | string;
  position?: "bottom" | "top";
  color?: string;
  selectedColor?: string;
  backgroundColor?: string;
}
export interface IAppBar {
  custom?: boolean;
}
export interface ISkylineFeatures {
  defaultContentBox?: boolean;
  defaultDisplayBlock?: boolean;
  tagNameStyleIsolation?: "isolated" | "legacy";
  enableScrollViewAutoSize?: boolean;
  keyframeStyleIsolation?: "isolated" | "legacy";
}
