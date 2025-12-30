import { PropsWithChildren } from "react";
import { useLaunch } from "@tarojs/taro";
import Taro from "@tarojs/taro";
import "./utils/scope";
import "./app.scss";
import "@nutui/nutui-react-taro/dist/style.css";

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    const scopeRef = (globalThis as any)?.scope;

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
    const token = Taro.getStorageSync("token");
    const tokenExpireTime = Taro.getStorageSync("tokenExpireTime");
    const now = Date.now();

    let isTokenValid = false;

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
  });

  // children 是将要会渲染的页面
  return children;
}

export default App;

/*
  生成逻辑：
  1. 应用启动时检查本地存储的 token 和过期时间
  2. 如果 token 存在且未过期（7天有效期），同步到全局 scope 并跳转首页
  3. 如果 token 不存在或已过期，清除过期数据并跳转登录页
  4. 同时同步 openid 和 userInfo 到全局 scope（用于微信相关功能）

  依赖技术：
  - Taro useLaunch：应用启动钩子
  - Taro Storage：本地持久化存储 token、openid 和用户信息
  - globalThis scope：全局状态管理和临时数据存储
  - 时间戳比较：检查 token 是否在有效期内（7天）

  安全原理：
  - token 7天过期时间，过期后强制重新登录
  - 每次启动时验证 token 有效性，确保安全性
  - 过期 token 自动清除，避免使用无效凭证
*/
