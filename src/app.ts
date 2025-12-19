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

    const token = Taro.getStorageSync("token");
    console.log("token", token);
    if (!token) {
      Taro.reLaunch({ url: "/pages/login/index" });
      return;
    }

    Taro.switchTab({ url: "/pages/index/index" });
  });

  // children 是将要会渲染的页面
  return children;
}

export default App;

/*
  生成逻辑：在应用入口通过 side-effect 引入 utils/scope，并在 useLaunch 中根据 token 判断跳转，确保登录页为首屏，登录后自动进入业务首页。
  依赖技术：Taro useLaunch、Taro Storage、globalThis scope。
*/
