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
    //console.error("备用方案解码也失败:", error);
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

// ===================== 全局消息/弹窗/通知 =====================
/** 全局加载提示 */
const showLoading = (title = "加载中...") =>
  Taro.showLoading({ title, mask: true });
/** 全局错误提示 */
const showError = (title: string, duration = 2000) =>
  Taro.showToast({ title, icon: "error", duration });
/** 关闭加载提示 */
const hideLoading = () => Taro.hideLoading();

// ===================== 全局工具函数 =====================
/** 判断是否为空 */
function isNull(value: any) {
  return value === undefined || value === null || value === "";
}

/**
 * 格式化时间显示：将ISO时间字符串转换为中文格式
 * @param isoString ISO时间字符串
 * @returns 格式化后的时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
function formatDateTime(isoString: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return isoString;
  }
}

// ===================== 全局临时数据存储 =====================
const temporaryData: Record<string, any> = {};
function setTemporaryData(key: string, value: any) {
  temporaryData[key] = value;
}
function getTemporaryData(key: string) {
  return temporaryData[key];
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

/**
 * 图片上传请求方法
 * @param filePath 本地图片文件路径
 * @param options 额外配置
 * @returns Promise<{code: number, data: {url: string}, message?: string}>
 */
async function uploadImage(
  filePath: string,
  options: {
    url?: string; // 上传接口地址，默认 '/api/upload'
    formData?: Record<string, any>; // 额外的表单数据
    showLoading?: boolean; // 是否显示loading，默认true
    needToken?: boolean; // 是否需要携带token，默认true
  } = {}
) {
  const {
    url = "/api/upload",
    formData = {},
    showLoading = true,
    needToken = true,
  } = options;

  // 显示loading
  if (showLoading) {
    scope.showLoading("上传中...");
  }

  return new Promise((resolve, reject) => {
    // 获取token（如果需要）
    let header: Record<string, any> = {};
    if (needToken) {
      const token = getTokenWithExpiryCheck();
      if (token) {
        header["Authorization"] = `Bearer ${token}`;
      }
    }

    Taro.uploadFile({
      url: toAbsoluteUrl(url),
      filePath: filePath,
      name: "file",
      formData: formData,
      header: header,
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          console.log("Upload response:", data);

          if (data.code === 200 && data.data && data.data.url) {
            // 上传成功
            resolve({
              code: 200,
              data: {
                url: data.data.url,
              },
              message: "上传成功",
            });
          } else {
            // 服务器返回错误
            const errorMsg = data.errorMessage || data.message || "上传失败";
            reject(new Error(errorMsg));
          }
        } catch (error) {
          console.error("解析上传响应失败:", error);
          reject(new Error("解析响应失败"));
        }
      },
      fail: (error) => {
        console.error("图片上传失败:", error);
        reject(error);
      },
      complete: () => {
        // 隐藏loading
        if (showLoading) {
          hideLoading();
        }
      },
    });
  });
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
  // session
  session,
  // 消息/弹窗/通知
  showError,
  hideLoading,
  showLoading,
  // 工具函数
  isNull,
  formatDateTime,
  // 临时数据
  temporaryData,
  setTemporaryData,
  getTemporaryData,
  // 网络请求
  get,
  post,
  put,
  del,
  requestWithLoadingAndPagination, // 带 loading 和分页的请求方法
  uploadImage, // 图片上传方法
};

globalThis.scope = scope1;
export default scope1;
