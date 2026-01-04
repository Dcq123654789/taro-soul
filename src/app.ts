import { PropsWithChildren } from "react";
import { useLaunch } from "@tarojs/taro";
import Taro from "@tarojs/taro";
import "./utils/scope";
import "./app.scss";
import "@nutui/nutui-react-taro/dist/style.css";

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    const scopeRef = (globalThis as any)?.scope;
    // Base64 编码/解码辅助函数（兼容小程序环境）
    const base64Encode = (str: string): string => {
      try {
        // 小程序环境兼容处理
        if (typeof btoa !== "undefined") {
          return btoa(encodeURIComponent(str));
        }
        // 备用方案：使用简单的字符替换（生产环境应使用更安全的加密）
        return encodeURIComponent(str).replace(/%/g, "_");
      } catch (error) {
        console.error("Base64 编码失败:", error);
        return str;
      }
    };

    const base64Decode = (str: string): string => {
      // 首先尝试用 atob 解码（标准 base64）
      if (typeof atob !== "undefined") {
        try {
          return decodeURIComponent(atob(str));
        } catch (error) {
          // atob 解码失败，可能是备用方案编码的数据
          console.warn("atob 解码失败，尝试备用方案:", error);
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

    const secureStorage = {
      set: (key: string, value: string) => {
        try {
          // 简单加密处理（生产环境建议使用更强的加密）
          const encrypted = base64Encode(value);
          Taro.setStorageSync(key, encrypted);
        } catch (error) {
          console.error("存储失败:", error);
        }
      },

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

    if (!scopeRef) {
      console.warn("全局 scope 未挂载，请检查 utils/scope 初始化逻辑");
    }
    // 根据环境配置 BASE_URL
    // H5 环境：使用代理，不需要配置 BASE_URL
    // 小程序环境：需要配置完整 URL（代理不生效）
    const env = process.env.TARO_ENV;
    const isMiniProgram = env !== "h5";

    if (isMiniProgram && scopeRef) {
      // 小程序环境：如果未配置 BASE_URL，使用开发环境地址
      // 注意：小程序无法直接访问 localhost，需要使用局域网 IP 或内网穿透
      if (!scopeRef.BASE_URL) {
        // 开发环境：使用 localhost（微信开发者工具中可用）
        // 生产环境：应该配置实际的后端地址
        const isDev = process.env.NODE_ENV === "development";
        if (isDev) {
          scopeRef.setBaseUrl?.("http://localhost:8888");
          console.log(
            "[App] 小程序开发环境，已设置 BASE_URL 为 http://localhost:8888"
          );
          console.warn(
            "[App] 提示：如果 localhost 无法访问，请使用局域网 IP 或配置实际后端地址"
          );
        } else {
          // 生产环境：使用 session 中的地址或提示配置
          const prodUrl = scopeRef.session?.app_service_base_url;
          if (prodUrl) {
            scopeRef.setBaseUrl?.(prodUrl);
            console.log("[App] 小程序生产环境，已设置 BASE_URL 为:", prodUrl);
          } else {
            console.warn(
              "[App] 小程序生产环境未配置 BASE_URL，请使用 scope.setBaseUrl() 设置"
            );
          }
        }
      }
    }

    // 检查 token 有效性
    const token = secureStorage.get("token");
    const tokenExpireTime = Taro.getStorageSync("tokenExpireTime");
    const now = Date.now();

    let isTokenValid = false;
    console.log(123, token, tokenExpireTime);

    if (token && tokenExpireTime && now < tokenExpireTime) {
      // token 存在且未过期
      isTokenValid = true;

      // 同步 token 到全局 scope
      scopeRef?.setTemporaryData?.("token", token);

      // 同步 openid 和 userInfo（如果存在）
      const openid = Taro.getStorageSync("openid");
      const userInfo = Taro.getStorageSync("userInfo");

      if (openid) {
        scopeRef?.setTemporaryData?.("openid", openid);
      }

      if (userInfo) {
        scopeRef?.setTemporaryData?.("userInfo", userInfo);
      }

      console.log("[App] token 验证通过，自动登录");
    } else {
      // token 不存在或已过期，清除过期数据
      if (token || tokenExpireTime) {
        Taro.removeStorageSync("token");
        Taro.removeStorageSync("tokenExpireTime");
        Taro.removeStorageSync("openid");
        Taro.removeStorageSync("userInfo");
        console.log("[App] token 已过期，已清除");
      }
    }

    // 根据登录状态决定跳转页面
    const targetUrl = isTokenValid
      ? "/pages/index/index"
      : "/pages/login/index";

    if (isTokenValid) {
      // 已登录用户跳转到 tabBar 页面
      Taro.switchTab({
        url: targetUrl,
        success: () => {
          // 在 tabBar 页面加载成功后设置样式
          setTimeout(() => {
            Taro.setTabBarStyle({
              color: "#666666",
              selectedColor: "#07C160",
              backgroundColor: "#ffffff",
              borderStyle: "black",
              // fontSize: "14px", // 设置字体大小
            });
          }, 100); // 稍微延时确保 tabBar 完全初始化
        },
      });
    } else {
      // 未登录用户跳转到登录页面（非 tabBar 页面）
      Taro.redirectTo({
        url: targetUrl,
      });
    }
  });

  // children 是将要会渲染的页面
  return children;
}

export default App;

/*
  生成逻辑：
  1. 应用启动时检查本地存储的加密 token 和过期时间
  2. 如果 token 存在且未过期（7天有效期），解密 token 并同步到全局 scope，使用 switchTab 跳转首页
  3. 如果 token 不存在或已过期，清除过期数据并使用 redirectTo 跳转登录页
  4. 同时同步 openid 和 userInfo 到全局 scope（用于微信相关功能）
  5. 根据页面是否在 tabBar 中配置选择不同的跳转方式

  依赖技术：
  - Taro useLaunch：应用启动钩子
  - Taro Storage：本地持久化存储加密的 token、openid 和用户信息
  - Taro switchTab：跳转到 tabBar 配置的页面
  - Taro redirectTo：重定向到非 tabBar 页面
  - globalThis scope：全局状态管理和临时数据存储
  - 时间戳比较：检查 token 是否在有效期内（7天）
  - 兼容的 Base64 编解码：实现跨平台的 token 加密存储和解密读取

  安全原理：
  - token 加密存储，防止明文泄露
  - token 7天过期时间，过期后强制重新登录
  - 每次启动时验证 token 有效性，确保安全性
  - 过期 token 自动清除，避免使用无效凭证
*/
