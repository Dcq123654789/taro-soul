import { useEffect } from "react";
import Taro from "@tarojs/taro";

export const useAuthGuard = () => {
  useEffect(() => {
    const token = Taro.getStorageSync("token");
    const tokenExpireTime = Taro.getStorageSync("tokenExpireTime");

    // 检查token是否存在且未过期
    const now = Date.now();
    if (token && tokenExpireTime && now < tokenExpireTime) return;

    const pages = Taro.getCurrentPages();
    const current = pages?.[pages.length - 1];
    const route = (current as any)?.route || "";
    if (route === "pages/login/index") return;

    Taro.reLaunch({ url: "/pages/login/index" });
  }, []);
};

/*
  生成逻辑：封装鉴权守卫 Hook，若无 token 则强制跳转登录页，避免直接访问业务页面。
  依赖技术：React useEffect、Taro Storage、Taro.reLaunch。
*/
