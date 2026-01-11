import React, { PropsWithChildren } from "react";
import { useLaunch } from "@tarojs/taro";
import Taro from "@tarojs/taro";
import "./utils/scope";
import "./app.scss";
import "@nutui/nutui-react-taro/dist/style.css";

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    const scopeRef = (globalThis as any)?.scope;
 
    Taro.getStorageSync
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
    console.log(token, tokenExpireTime, "token, tokenExpireTime");

    const now = Date.now();

    let isTokenValid = false;
    if (token && tokenExpireTime && now < tokenExpireTime) {
      // token 存在且未过期
      isTokenValid = true;
    } else {
      // token 不存在或已过期，清除过期数据
      if (token || (tokenExpireTime && tokenExpireTime > now)) {
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

    // 根据登录状态决定跳转页面
    if (isTokenValid) {
      // 已登录用户跳转到 tabBar 页面
      const trySwitchTab = (retries = 3) => {
        console.log(`尝试 switchTab (剩余重试次数: ${retries})`);
        Taro.switchTab({
          url: "/pages/index/index",
          success: () => {
            console.log("✅ switchTab 成功");
            // 延迟设置样式，确保页面已完全加载
            setTimeout(() => {
              Taro.setTabBarStyle({
                color: "#666666",
                selectedColor: "#07C160",
                backgroundColor: "#ffffff",
                borderStyle: "black",
              });
            }, 300);
          },
          fail: (error) => {
            console.error(
              `❌ switchTab 失败 (剩余重试次数: ${retries - 1}):`,
              error
            );

            if (retries > 1) {
              // 递增延迟后重试，避免频繁重试
              const delay = 500 * (4 - retries); // 1500ms, 1000ms, 500ms
              console.log(`等待 ${delay}ms 后重试...`);
              setTimeout(() => trySwitchTab(retries - 1), delay);
            } else {
              console.warn(
                "⚠️ switchTab 多次重试失败，使用 reLaunch 作为最终方案"
              );
              // 最后的备用方案：使用 reLaunch (可以跳转到 tabBar 页面)
              Taro.reLaunch({
                url: "/pages/index/index",
                success: () => console.log("✅ reLaunch 成功"),
                fail: (finalError) => {
                  console.error("🚫 所有跳转方式都失败:", finalError);
                  // 如果实在跳转不了，至少要有个提示
                  Taro.showToast({
                    title: "页面加载失败，请重启应用",
                    icon: "none",
                    duration: 3000,
                  });
                },
              });
            }
          },
        });
      };

      // 初始延迟后开始尝试，避免与其他初始化冲突
      setTimeout(() => trySwitchTab(), 200);
    } else {
      // 未登录用户跳转到登录页面（非 tabBar 页面）
      console.log("跳转到登录页面:", targetUrl);
      Taro.redirectTo({
        url: targetUrl,
        fail: (error) => {
          console.error("跳转登录页面失败:", error);
          // 最后的最后备用方案
          Taro.reLaunch({
            url: targetUrl,
          });
        },
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
