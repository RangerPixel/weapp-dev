export interface WeappPageComponentJson {
  pageJSONLight?: IOriginalPageJSON;
  pageJSONDark?: IOriginalPageJSON;
  enablePassiveEvent?:
    | {
        [k: string]: boolean;
      }
    | boolean;
  style?: "v2";
  componentPlaceholder?: {
    [k: string]: string;
  };
  "mini-ios"?: IOriginalPageJSON;
  "mini-android"?: IOriginalPageJSON;
  "mini-ohos"?: IOriginalPageJSON;
  "mini-weixin"?: IOriginalPageJSON;
  disableScroll?: boolean;
  disableSwipeBack?: boolean;
  usingComponents?: {
    [k: string]: string;
  };
  renderer?: "cover-view" | "skyline" | "webview" | "xr-frame";
  rendererOptions?: {
    skyline?: {
      disableABTest?: boolean;
      sdkVersionBegin?: string;
      sdkVersionEnd?: string;
      iosVersionBegin?: string;
      iosVersionEnd?: string;
      androidVersionBegin?: string;
      androidVersionEnd?: string;
    } & ISkylineFeatures;
  };
  component?: boolean;
  componentGenerics?: {
    [k: string]:
      | {
          default: string;
        }
      | true
      | null;
  };
  singlePage?: {
    navigationBarFit?: "float" | "squeezed";
  };
  componentFramework?: "exparser" | "glass-easel";
  styleIsolation?:
    | "apply-shared"
    | "isolated"
    | "page-apply-shared"
    | "page-isolated"
    | "page-shared"
    | "shared";
  pureDataPattern?: string;
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
export interface IOriginalPageJSON {
  disableScroll?: boolean;
  disableSwipeBack?: boolean;
  usingComponents?: {
    [k: string]: string;
  };
  renderer?: "cover-view" | "skyline" | "webview" | "xr-frame";
  rendererOptions?: {
    skyline?: {
      disableABTest?: boolean;
      sdkVersionBegin?: string;
      sdkVersionEnd?: string;
      iosVersionBegin?: string;
      iosVersionEnd?: string;
      androidVersionBegin?: string;
      androidVersionEnd?: string;
    } & ISkylineFeatures;
  };
  component?: boolean;
  componentGenerics?: {
    [k: string]:
      | {
          default: string;
        }
      | true
      | null;
  };
  singlePage?: {
    navigationBarFit?: "float" | "squeezed";
  };
  componentFramework?: "exparser" | "glass-easel";
  styleIsolation?:
    | "apply-shared"
    | "isolated"
    | "page-apply-shared"
    | "page-isolated"
    | "page-shared"
    | "shared";
  pureDataPattern?: string;
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
export interface ISkylineFeatures {
  defaultContentBox?: boolean;
  defaultDisplayBlock?: boolean;
  tagNameStyleIsolation?: "isolated" | "legacy";
  enableScrollViewAutoSize?: boolean;
  keyframeStyleIsolation?: "isolated" | "legacy";
}
