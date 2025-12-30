import { useState, useCallback } from "react";
import { View, Text, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const scopeRef = (globalThis as any)?.scope;

  // 微信一键登录：获取code后直接调用后端，后端通过code获取用户信息（openid），自动创建或登录账号
  const handleWechatLogin = useCallback(async () => {
    try {
      setLoading(true);

      // 1. 获取微信code
      const loginRes = await Taro.login();

      if (!loginRes.code) {
        throw new Error("微信登录失败，请稍后再试");
      }

      // 2. 调用登录接口
      // H5 环境：使用代理路径 /api（会被代理到 http://localhost:8888）
      // 小程序环境：需要使用完整 URL（代理不生效，需要在 app.ts 中配置 BASE_URL）
      const apiPath = "/api/wechat/openid";

      // 获取完整 URL
      let requestUrl = apiPath;
      const env = process.env.TARO_ENV; // 'h5' | 'weapp' | 'swan' | 'alipay' | 'tt' | 'qq' | 'jd' | 'rn'
      const isMiniProgram = env !== "h5";

      if (isMiniProgram) {
        // 小程序环境：必须使用完整 URL（代理不生效）
        // 优先使用 scope.toAbsoluteUrl 方法
        if (scopeRef?.toAbsoluteUrl) {
          requestUrl = scopeRef.toAbsoluteUrl(apiPath);
        } else if (scopeRef?.BASE_URL) {
          // 使用已配置的 BASE_URL
          const baseUrl = scopeRef.BASE_URL.replace(/\/+$/, "");
          requestUrl = `${baseUrl}${apiPath}`;
        } else {
          // 如果 BASE_URL 未配置，尝试使用 session 中的地址
          const baseUrl =
            scopeRef?.session?.app_service_base_url?.replace(/\/+$/, "") || "";
          if (baseUrl) {
            requestUrl = `${baseUrl}${apiPath}`;
          } else {
            // 最后兜底：使用开发环境地址（app.ts 中应该已配置）
            requestUrl = `http://localhost:8888${apiPath}`;
          }
        }
      }
      // H5 环境：直接使用代理路径（会被 config/dev.ts 中的代理转发）

      const requestData = { code: loginRes.code };

      const response = await Taro.request<{
        code: number;
        msg: string;
        data: {
          token: string;
          openid: string;
          userId: string;
          role: string;
          enabled: string;
        };
      }>({
        url: requestUrl,
        method: "POST",
        data: requestData,
        header: {
          "Content-Type": "application/json",
        },
      });

      // 3. 处理接口返回的数据结构：{ code, msg, data }
      const result = response.data;
      if (result.code !== 200 || !result.data?.token) {
        throw new Error(result.msg || "登录失败，请重试");
      }

      const { token, openid, userId, role, enabled } = result.data;

      // 4. 保存token和用户信息（包括openid），设置7天过期时间
      const tokenExpireTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7天后的时间戳
      Taro.setStorageSync("token", token);
      Taro.setStorageSync("tokenExpireTime", tokenExpireTime);
      Taro.setStorageSync("openid", openid);
      Taro.setStorageSync("userInfo", { userId, openid, role, enabled });

      // 5. 同步到全局 scope 临时数据
      scopeRef?.setTemporaryData?.("token", token);
      scopeRef?.setTemporaryData?.("openid", openid);
      scopeRef?.setTemporaryData?.("userInfo", {
        userId,
        openid,
        role,
        enabled,
      });

      // 6. 登录成功，跳转到首页
      Taro.showToast({
        title: "登录成功",
        icon: "success",
      });
      setTimeout(() => {
        Taro.switchTab({ url: "/pages/index/index" });
      }, 400);
    } catch (error) {
      const message = error instanceof Error ? error.message : "登录失败";
      Taro.showToast({
        title: message,
        icon: "none",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [scopeRef]);

  return (
    <View
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FB",
        padding: "32px 24px",
        boxSizing: "border-box",
      }}
    >
      <View
        style={{
          marginTop: "40px",
          marginBottom: "24px",
        }}
      >
        <Text
          style={{
            display: "block",
            fontSize: "24px",
            fontWeight: "700",
            color: "#0F172A",
            marginBottom: "8px",
          }}
        >
          欢迎使用
        </Text>
        <Text style={{ fontSize: "14px", color: "#64748B" }}>
          使用微信账号快速登录，首次登录将自动注册
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 12px 40px rgba(15,23,42,0.08)",
        }}
      >
        <Button
          disabled={loading}
          onClick={handleWechatLogin}
          onTap={handleWechatLogin}
          style={{
            backgroundColor: loading ? "#CBD5F5" : "#07C160",
            color: "#FFFFFF",
            borderRadius: "12px",
            height: "48px",
            lineHeight: "48px",
            fontSize: "16px",
            fontWeight: "600",
            width: "100%",
          }}
        >
          {loading ? "登录中..." : "微信一键登录"}
        </Button>

        <View style={{ marginTop: "16px", textAlign: "center" }}>
          <Text style={{ fontSize: "12px", color: "#94A3B8" }}>
            登录即表示同意《用户协议》和《隐私政策》
          </Text>
        </View>
      </View>
    </View>
  );
}

/*
  生成逻辑：
  1. 微信一键登录流程：调用 Taro.login() 获取微信 code
  2. 将 code 传给后端 /api/wechat/openid 接口（使用代理配置）
  3. 后端通过 code 调用微信 code2session API 获取 openid 和 session_key
  4. 后端根据 openid 判断用户是否存在，不存在则自动创建账号，存在则直接登录
  5. 后端返回 token、openid、userId、role、enabled 等用户信息
  6. 前端保存 token（用于接口鉴权）和 openid（用于微信相关功能）到 Storage
  
  代理配置说明：
  - 开发环境（H5）：config/dev.ts 中配置了 /api 代理到 http://localhost:8888
  - 生产环境：需要配置 BASE_URL 或使用完整 URL
  - 小程序环境：代理不生效，需要配置完整的后端地址
  
  openid 的后续作用：
  - 微信订阅消息：发送订阅消息时需要 openid 作为接收者标识
  - 微信支付：小程序支付时可能需要 openid 作为用户标识
  - 用户绑定：如果需要绑定手机号或其他账号，openid 可作为关联标识
  - 跨应用识别：如果使用 unionid，openid 可用于关联同一微信用户在不同小程序的身份
  - 数据统计：可用于统计微信用户的登录行为、活跃度等
  
  依赖技术：
  - React Hooks（useState/useEffect/useCallback）
  - Taro.login：获取微信临时登录凭证 code
  - Taro.request：调用后端登录接口（使用代理路径 /api）
  - Taro.setStorageSync：持久化存储 token、openid 和用户信息
  - 全局 scope：临时数据存储
  - Vite 代理配置：开发环境自动转发 /api 请求到后端服务器
  
  安全原理：
  - code 只能使用一次，有效期 5 分钟
  - 后端通过 appid + secret + code 调用微信服务器验证，确保用户身份真实
  - 前端无法伪造 code，必须通过微信小程序环境获取
  - token 用于后续所有接口鉴权，openid 仅用于微信相关功能调用
*/
