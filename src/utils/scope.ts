// src/layouts/scope-1.ts

import Taro from "@tarojs/taro";

// ===================== 基础配置（无需代理，统一完整 URL） =====================
/** 解析基础地址优先级：运行时全局 -> 环境变量 -> 空字符串 */
function resolveBaseUrl(): string {
  // 运行时可由外部在 window 注入
  // @ts-ignore
  const runtime =
    (typeof window !== "undefined" && (window as any).BASE_URL) || "";
  // Vite/H5 环境变量（在非 Vite 环境下访问将抛错，用 try/catch 兜底）
  let viteEnv = "";
  try {
    // @ts-ignore
    viteEnv = (import.meta as any)?.env?.VITE_API_BASE || "";
  } catch {}
  // Node 环境变量（打包时注入）
  // @ts-ignore
  const nodeEnv =
    (typeof process !== "undefined" &&
      (process.env.API_BASE_URL || process.env.VITE_API_BASE)) ||
    "";
  return String(runtime || viteEnv || nodeEnv || "").replace(/\/+$/, "");
}
let BASE_URL = resolveBaseUrl();
/** 允许运行时覆盖基础地址 */
function setBaseUrl(url: string) {
  BASE_URL = String(url || "").replace(/\/+$/, "");
}
/** 组合为绝对地址：仅当以 / 开头时拼接 BASE_URL */
function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return url;
}

// ===================== Axios 实例与拦截器 =====================

const base64Decode = (str: string): string => {
  // 首先尝试用 atob 解码（标准 base64）
  if (typeof atob !== "undefined") {
    try {
      return decodeURIComponent(atob(str));
    } catch (error) {
      // atob 解码失败，可能是备用方案编码的数据
    }
  }

  // 尝试备用方案：恢复字符替换
  try {
    return decodeURIComponent(str.replace(/_/g, "%"));
  } catch (error) {
    console.error("备用方案解码也失败:", error);
    // 如果都失败，返回原始字符串
    return str;
  }
};

/** 安全存储工具函数（与登录页面保持一致） */
const secureStorage = {
  get: (key: string): string | null => {
    try {
      const encrypted = Taro.getStorageSync(key);
      if (!encrypted) return null;
      return base64Decode(encrypted);
    } catch (error) {
      console.error("读取存储失败:", error);
      return null;
    }
  },
};

/** 获取token并检查过期 */
function getTokenWithExpiryCheck(): string | null {
  const encryptedToken = Taro.getStorageSync("token");
  const tokenExpireTime = Taro.getStorageSync("tokenExpireTime");

  // 检查token是否存在且未过期
  if (!encryptedToken || !tokenExpireTime || Date.now() > tokenExpireTime) {
    // token过期或不存在，清除所有存储信息
    Taro.removeStorageSync("token");
    Taro.removeStorageSync("tokenExpireTime");
    Taro.removeStorageSync("openid");
    Taro.removeStorageSync("userInfo");

    // 跳转到登录页面
    Taro.reLaunch({ url: "/pages/login/index" });
    return null;
  }

  // 尝试解密token
  const token = secureStorage.get("token");
  if (!token) {
    console.error("Token 解密失败，清除存储数据");
    // 如果解密失败，清除所有存储信息
    Taro.removeStorageSync("token");
    Taro.removeStorageSync("tokenExpireTime");
    Taro.removeStorageSync("openid");
    Taro.removeStorageSync("userInfo");

    // 跳转到登录页面
    Taro.reLaunch({ url: "/pages/login/index" });
    return null;
  }

  return token;
}

// 占位对象，便于与 Taro.request 统一
const http = {
  async get(
    url: string,
    options: { params?: any; header?: Record<string, any> } = {}
  ) {
    const token = getTokenWithExpiryCheck();
    const query = options.params
      ? "?" + new URLSearchParams(options.params).toString()
      : "";
    const res = await Taro.request({
      url: toAbsoluteUrl(url) + query,
      method: "GET",
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {}),
      },
    });
    return { data: res.data };
  },
  async post(
    url: string,
    data?: any,
    options: { header?: Record<string, any> } = {}
  ) {
    const token = getTokenWithExpiryCheck();
    // 开发环境下输出调试信息
    if (process.env.NODE_ENV === "development") {
      console.log("POST 请求:", { url, data, hasToken: !!token });
    }
    const res = await Taro.request({
      url: toAbsoluteUrl(url),
      method: "POST",
      data: data ?? {},
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {}),
      },
    });
    return { data: res.data };
  },
  async put(
    url: string,
    data?: any,
    options: { header?: Record<string, any> } = {}
  ) {
    const token = getTokenWithExpiryCheck();
    const res = await Taro.request({
      url: toAbsoluteUrl(url),
      method: "PUT",
      data: data ?? {},
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {}),
      },
    });
    return { data: res.data };
  },
  async delete(
    url: string,
    options: { params?: any; header?: Record<string, any> } = {}
  ) {
    const token = getTokenWithExpiryCheck();
    const query = options.params
      ? "?" + new URLSearchParams(options.params).toString()
      : "";
    const res = await Taro.request({
      url: toAbsoluteUrl(url) + query,
      method: "DELETE",
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {}),
      },
    });
    return { data: res.data };
  },
};

/**
 * 全局配置与工具库（参考 scope-base.js）
 * 每个属性和方法都加上中文注释，方便团队理解和使用
 */

// ===================== 全局常量 =====================
/** 主题主色 */
const themeColor = "#F08300";
/** 主题副色 */
const themeFRColor = "#7294E5";
/** 主题背景色 */
const themeBGColor = "#284895F9";
/** H5 主题背景色 */
const themeH5BGColor = "#F6F9FF";
/** 颜色列表（用于图表等） */
const colors = [
  "#6f81da",
  "#deb140",
  "#49dff0",
  "#034079",
  "#00ffb4",
  "#c487ee",
  "#dd6b66",
  "#759aa0",
  "#e69d87",
  "#8dc1a9",
  "#ea7e53",
  "#eedd78",
  "#73a373",
  "#73b9bc",
  "#7289ab",
  "#91ca8c",
  "#f49f42",
];
/** 高德地图 key */
const amap_key = "462f5e65fa9453be367770b9d70990ea";
/** 腾讯地图 key */
const qmap_key = "KNLBZ-EDNCS-SGNOR-6PNPQ-WVMHH-4AF62";

// ===================== 全局 session 配置 =====================
const session = {
  // /** 文件服务地址（开发环境） */
  // fs_base_url: "https://fs.zhuguangmama.com",
  // /** 文件服务地址（生产环境） */
  // iotda_base_url: "https://gateway.zhuguangmama.com/bql-hardware-iotda",
  // /** 应用服务地址（开发环境） */
  // app_service_base_url:
  //   "https://gateway-ys.zhuguangmama.com/ai8000-micro-framework",
  // /** 应用服务地址（生产环境） */
  // modal_service_base_url:
  //   "https://gateway-ys.zhuguangmama.com/ai8000-micro-framework",
  // /** 权限列表 */
  // permissions: [] as string[],
  app_service_base_url: "http://localhost:8888",
};

// ===================== 全局事件管理 =====================
/** 全局事件对象 */
const events: Record<string, Function> = {};
/** 注册事件 */
function setEvent(event: string, fn: Function) {
  events[event] = fn;
}
/** 触发事件 */
function fireEvent(event: string, data?: any) {
  events[event]?.(data);
}
/** 移除事件 */
function removeEvent(event: string) {
  delete events[event];
}

// ===================== 全局消息/弹窗/通知 =====================
/** 全局消息提示 */
const showInfo = (title: string, duration = 2000) =>
  Taro.showToast({ title, icon: "none", duration });
/** 全局错误提示 */
const showError = (title: string, duration = 2000) =>
  Taro.showToast({ title, icon: "error", duration });
/** 全局加载提示 */
const showLoading = (title = "加载中...") =>
  Taro.showLoading({ title, mask: true });
/** 全局通知（统一为无取消的 Modal） */
const showNotification = (title: string, content?: string) =>
  Taro.showModal({ title, content: content || "", showCancel: false });
/** 全局确认弹窗 */
const showConfirm = (
  title: string,
  onOk?: () => void,
  onCancel?: () => void,
  content?: string
) => {
  Taro.showModal({ title, content: content || "" }).then((res) => {
    if (res.confirm) onOk?.();
    else onCancel?.();
  });
};
/** 关闭加载提示 */
const hideLoading = () => Taro.hideLoading();

// ===================== 全局工具函数 =====================
/** 判断是否为手机号 */
function isPhone(phone: string) {
  return /^[1][3-9][0-9]{9}$/.test(phone);
}
/** 判断是否为邮箱 */
function isEmail(email: string) {
  return /^\w+([.+-]\w+)*@\w+([.-]\w+)*\.\w+([.-]\w+)*$/.test(email);
}
/** 判断是否为身份证号 */
function isIDCard(cardNumber: string) {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(cardNumber);
}
/** 判断是否为空 */
function isNull(value: any) {
  return value === undefined || value === null || value === "";
}
/** 获取页面宽度 */
function getWidth() {
  const sys = Taro.getSystemInfoSync();
  return sys.windowWidth;
}
/** 获取页面高度 */
function getHeight() {
  const sys = Taro.getSystemInfoSync();
  return sys.windowHeight;
}

// ===================== 全局临时数据存储 =====================
const temporaryData: Record<string, any> = {};
function setTemporaryData(key: string, value: any) {
  temporaryData[key] = value;
}
function getTemporaryData(key: string) {
  return temporaryData[key];
}

// ===================== 全局页面跳转/导航 =====================
/** Umi4 路由跳转（推荐） */
function goto(
  url: string,
  type: "navigateTo" | "redirectTo" | "reLaunch" | "switchTab" = "navigateTo"
) {
  switch (type) {
    case "navigateTo":
      return Taro.navigateTo({ url });
    case "redirectTo":
      return Taro.redirectTo({ url });
    case "reLaunch":
      return Taro.reLaunch({ url });
    case "switchTab":
      return Taro.switchTab({ url });
    default:
      return Taro.navigateTo({ url });
  }
}

// ===================== 全局网络请求工具（统一 Taro.request，无代理） =====================
/** GET 请求（自动拼接绝对 URL） */
async function get(url: string, params?: Record<string, any>) {
  const res = await http.get(url, { params });
  return res.data;
}
/** POST 请求（自动拼接绝对 URL） */
async function post(url: string, data?: any) {
  const res = await http.post(url, data ?? {});
  return res.data;
}
/** PUT 请求 */
async function put(url: string, data?: any) {
  const res = await http.put(url, data ?? {});
  return res.data;
}
/** DELETE 请求 */
async function del(url: string, params?: Record<string, any>) {
  const res = await http.delete(url, { params });
  return res.data;
}

/**
 * 通用 RESTful API 请求方法
 * @param options 实体名、操作类型、id、数据、参数
 * @returns Promise<any>
 */
type CrudType = "create" | "read" | "update" | "delete";
interface CrudOptions {
  entity: string; // 实体名，如 'user'
  action: CrudType; // 操作类型
  id?: string | number; // 主键，查/改/删时用
  data?: any; // 数据体
  params?: any; // 查询参数
}

async function crudRequest(options: CrudOptions) {
  const url = "/batch";
  const res = await http.post(url, { options });
  return res.data;
}

/**
 * 通用带 loading、分页的请求
 * @param url 接口地址
 * @param params 请求参数（包含分页参数）
 * @param options 额外配置，如 setLoading、分页字段名等
 */
async function requestWithLoadingAndPagination(
  url: string,
  params: any = {},
  options: {
    pageField?: string; // 如 'pageNum'
    pageSizeField?: string; // 如 'pageSize'
    dataField?: string; // 返回数据的字段名
    totalField?: string; // 返回总数的字段名
    method?: "POST" | "GET";
    paramType?: "params" | "body"; // 新增参数类型
    needToken?: boolean; // 是否需要携带 token，默认 true
  } = {}
) {
  const {
    pageField = "pageNum",
    pageSizeField = "pageSize",
    dataField = "data",
    totalField = "total",
    method = "POST",
    paramType = "params", // 默认 params
    needToken = true, // 默认需要 token
  } = options;

  // 新增：全局 loading 动画（记录最后一次以便关闭）
  showLoading("加载中...");

  try {
    let res: any;
    if (method === "GET") {
      res = await http.get(url, { params });
    } else {
      res = await http.post(url, paramType === "params" ? params : params);
    }
    hideLoading();

    // 适配分页结构
    return {
      data: res.data[dataField] || [],
      total: res.data[totalField] || 0,
      ...res.data,
    };
  } catch (err: any) {
    hideLoading();
    showError(err?.message || "请求失败");
    throw err;
  }
}

// ===================== scope1 对象导出 =====================
const scope1 = {
  // 基础地址
  BASE_URL,
  setBaseUrl,
  toAbsoluteUrl,
  http,
  // 常量
  themeColor,
  themeFRColor,
  themeBGColor,
  themeH5BGColor,
  colors,
  amap_key,
  qmap_key,
  // session
  session,
  // 事件
  events,
  setEvent,
  fireEvent,
  removeEvent,
  // 消息/弹窗/通知
  showInfo,
  showError,
  showLoading,
  hideLoading,
  showNotification,
  showConfirm,
  // 工具函数
  isPhone,
  isEmail,
  isIDCard,
  isNull,
  getWidth,
  getHeight,
  // 临时数据
  temporaryData,
  setTemporaryData,
  getTemporaryData,
  // 页面跳转/导航
  goto,
  // 网络请求
  get,
  post,
  put,
  del,
  crudRequest, // 新增通用 RESTful API 方法
  requestWithLoadingAndPagination, // 新增带 loading 和分页的请求方法
};

globalThis.scope = scope1;
export default scope1;
