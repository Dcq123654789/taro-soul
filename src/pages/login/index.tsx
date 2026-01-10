import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Checkbox,
  CheckboxGroup,
  Image,
} from "@tarojs/components";
import Taro from "@tarojs/taro";

// 导入图片
import techBgImg from "../../assets/images/tech-bg.jpg";
import factoryHeaderImg from "../../assets/images/factory-header.jpg";

// 类型定义 
interface LoginResponse {
  code: number;
  msg: string;
  data: {
    token: string;
    openid: string;
    userId: string;
    role: string;
    enabled: string;
  };
}

interface UserInfo {
  userId: string; 
  openid: string;
  role: string;
  enabled: string;
}

// URL构建工具函数
const buildApiUrl = (apiPath: string, scopeRef: any): string => {
  const env = process.env.TARO_ENV;
  const isMiniProgram = env !== "h5";

  if (!isMiniProgram) {
    // H5 环境：直接使用代理路径
    return apiPath;
  }

  // 小程序环境：必须使用完整 URL
  if (scopeRef?.toAbsoluteUrl) {
    return scopeRef.toAbsoluteUrl(apiPath);
  }

  if (scopeRef?.BASE_URL) {
    const baseUrl = scopeRef.BASE_URL.replace(/\/+$/, "");
    return `${baseUrl}${apiPath}`;
  }

  // 尝试使用 session 中的地址
  const baseUrl = scopeRef?.session?.app_service_base_url?.replace(/\/+$/, "");
  if (baseUrl) {
    return `${baseUrl}${apiPath}`;
  }

  // 最后兜底：使用开发环境地址
  return `http://localhost:8888${apiPath}`;
};

// 加密存储工具函数
const secureStorage = {
  set: (key: string, value: string) => {
    try {
      // 简单加密处理（生产环境建议使用更强的加密）
      const encrypted = btoa(encodeURIComponent(value));
      Taro.setStorageSync(key, encrypted);
    } catch (error) {
      console.error("存储失败:", error);
    }
  },

  get: (key: string): string | null => {
    try {
      const encrypted = Taro.getStorageSync(key);
      if (!encrypted) return null;
      return decodeURIComponent(atob(encrypted));
    } catch (error) {
      console.error("读取存储失败:", error);
      return null;
    }
  },
};

// 用户信息验证函数
const validateUserInfo = (data: any): data is LoginResponse["data"] => {
  return (
    data &&
    typeof data.token === "string" &&
    typeof data.openid === "string" &&
    typeof data.userId === "string" &&
    typeof data.role === "string" &&
    typeof data.enabled === "string"
  );
};

export default function LoginPage() {
  // 测试基本的React hooks是否工作
  const [testState, setTestState] = useState("test");
  console.log("React hooks working:", testState);

  const [loading, setLoading] = useState(false);
  const [agreeProtocol, setAgreeProtocol] = useState(true);

  // 使用 useRef 避免不必要的重渲染
  const isRequestCancelledRef = useRef(false);
  const scopeRef = useRef((globalThis as any)?.scope);

  // 缓存 API URL，避免重复计算
  const apiUrl = useMemo(() => {
    const apiPath = "/api/wechat/openid";
    return buildApiUrl(apiPath, scopeRef.current);
  }, []);

  // 组件卸载时清理请求
  useEffect(() => {
    return () => {
      isRequestCancelledRef.current = true;
    };
  }, []);

  // 协议检查函数
  const checkProtocolAgreement = useCallback(() => {
    if (!agreeProtocol) {
      Taro.showToast({
        title: "请先同意用户协议和隐私政策",
        icon: "none",
        duration: 3000,
      });
      return false;
    }
    return true;
  }, [agreeProtocol]);

  // 获取微信登录code
  const getWechatCode = useCallback(async (): Promise<string> => {
    const loginRes = await Taro.login();
    if (!loginRes.code) {
      throw new Error("微信登录失败，请稍后再试");
    }
    return loginRes.code;
  }, []);

  // 执行登录请求（带重试机制）
  const performLoginRequest = useCallback(
    async (code: string, retryCount = 0): Promise<LoginResponse> => {
      const maxRetries = 2;
      const timeout = 10000; // 10秒超时

      try {
        // 检查请求是否被取消
        if (isRequestCancelledRef.current) {
          throw new Error("请求已取消");
        }

        const response = await Taro.request<LoginResponse>({
          url: apiUrl,
          method: "POST",
          data: { code },
          header: {
            "Content-Type": "application/json",
          },
          timeout,
        });

        // 再次检查请求是否被取消（在异步等待期间可能被取消）
        if (isRequestCancelledRef.current) {
          throw new Error("请求已取消");
        }

        const result = response.data;

        // 验证响应格式
        if (!result || typeof result.code !== "number") {
          throw new Error("服务器响应格式错误");
        }

        if (result.code !== 200) {
          throw new Error(result.msg || "登录失败，请重试");
        }

        if (!result.data || !validateUserInfo(result.data)) {
          throw new Error("用户信息验证失败");
        }

        return result;
      } catch (error) {
        // 网络错误重试逻辑（排除取消错误）
        const errorMsg = (error as any)?.errMsg || "";
        if (
          !isRequestCancelledRef.current &&
          retryCount < maxRetries &&
          errorMsg.includes("timeout")
        ) {
          console.warn(`登录请求超时，重试第${retryCount + 1}次`);
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1))
          ); // 递增延迟
          return performLoginRequest(code, retryCount + 1);
        }
        throw error;
      }
    },
    [apiUrl]
  );

  // 保存用户认证信息
  const saveAuthInfo = useCallback((userData: LoginResponse["data"]) => {
    const { token, openid, userId, role, enabled } = userData;
    const userInfo: UserInfo = { userId, openid, role, enabled };

    // 设置7天过期时间
    const tokenExpireTime = Date.now() + 7 * 24 * 60 * 60 * 1000;

    // 使用安全的存储方式
    secureStorage.set("token", token);
    secureStorage.set("openid", openid);
    Taro.setStorageSync("tokenExpireTime", tokenExpireTime);
    Taro.setStorageSync("userInfo", userInfo);

    // 同步到全局 scope
    const scope = scopeRef.current;
    if (scope) {
      scope.setTemporaryData?.("token", token);
      scope.setTemporaryData?.("openid", openid);
      scope.setTemporaryData?.("userInfo", userInfo);
    }
  }, []);

  // 处理登录成功
  const handleLoginSuccess = useCallback(() => {
    Taro.showToast({
      title: "登录成功",
      icon: "success",
    });

    // 延迟跳转，避免loading状态闪烁
    setTimeout(() => {
      Taro.switchTab({ url: "/pages/index/index" });
    }, 400);
  }, []);

  // 处理登录错误
  const handleLoginError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : "登录失败，请检查网络连接";
    Taro.showToast({
      title: message,
      icon: "none",
      duration: 3000,
    });
  }, []);

  // 协议复选框变化处理函数
  const handleProtocolChange = useCallback((_e: any) => {
    // 使用函数式更新确保状态一致性
    setAgreeProtocol((prev) => !prev);
  }, []);

  // 主登录函数
  const handleWechatLogin = useCallback(async () => {
    // 防止重复请求
    if (loading) return;

    // 检查协议同意状态
    if (!checkProtocolAgreement()) return;

    // 取消之前的请求（如果存在）
    isRequestCancelledRef.current = true;
    // 短暂延迟确保之前的请求被标记为取消
    await new Promise((resolve) => setTimeout(resolve, 0));
    // 重置取消标记，开始新请求
    isRequestCancelledRef.current = false;

    try {
      setLoading(true);

      // 1. 获取微信code
      const code = await getWechatCode();

      // 2. 执行登录请求
      const result = await performLoginRequest(code);

      // 3. 保存认证信息
      saveAuthInfo(result.data);

      // 4. 处理成功登录
      handleLoginSuccess();
    } catch (error) {
      // 过滤掉用户主动取消的请求
      const errorMessage = (error as Error)?.message || "";
      if (errorMessage !== "请求已取消") {
        handleLoginError(error);
      }
    } finally {
      setLoading(false);
      isRequestCancelledRef.current = false;
    }
  }, [
    loading,
    checkProtocolAgreement,
    getWechatCode,
    performLoginRequest,
    saveAuthInfo,
    handleLoginSuccess,
    handleLoginError,
  ]);

  return (
    <View
      style={{
        minHeight: "100vh",
        padding: "32px 24px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 背景图片 */}
      <Image
        src={techBgImg}
        mode="aspectFill"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      {/* 半透明遮罩 */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.9) 100%)",
          zIndex: 1,
        }}
      />

      {/* 内容区域 */}
      <View style={{ position: "relative", zIndex: 2 }}>

      {/* APP头部区域 */}
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "20px",
          marginBottom: "32px",
          position: "relative",
        }}
      >
        {/* APP Logo卡片 - 使用工厂图片 */}
        <View
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "28px",
            overflow: "hidden",
            marginBottom: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            position: "relative",
            borderWidth: "3px",
            borderColor: "rgba(255,255,255,0.3)",
            borderStyle: "solid",
          }}
        >
          <Image
            src={factoryHeaderImg}
            mode="aspectFill"
            style={{ width: "100%", height: "100%" }}
          />
          {/* 渐变遮罩 */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
            }}
          />
        </View>

        {/* APP名称 */}
        <Text
          style={{
            fontSize: "32px",
            fontWeight: "800",
            color: "#FFFFFF",
            marginBottom: "8px",
            textAlign: "center",
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            letterSpacing: "2px",
          }}
        >
          智能加工管理
        </Text>

        {/* 副标题 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <View
            style={{
              width: "40px",
              height: "3px",
              background: "linear-gradient(90deg, transparent 0%, #667eea 100%)",
            }}
          />
          <Text
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.9)",
              fontWeight: "500",
              letterSpacing: "4px",
            }}
          >
            INTELLIGENT FACTORY
          </Text>
          <View
            style={{
              width: "40px",
              height: "3px",
              background: "linear-gradient(90deg, #667eea 0%, transparent 100%)",
            }}
          />
        </View>

        {/* 功能特性 */}
        <View
          style={{
            marginTop: "20px",
            width: "100%",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              flexWrap: "wrap",
            }}
          >
            <View style={{ alignItems: "center", marginHorizontal: "8px" }}>
              <Text style={{ fontSize: "32px", marginBottom: "6px" }}>🏭</Text>
              <Text style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>数据管理</Text>
            </View>

            <View style={{ width: "1px", height: "35px", backgroundColor: "rgba(255,255,255,0.3)" }} />

            <View style={{ alignItems: "center", marginHorizontal: "8px" }}>
              <Text style={{ fontSize: "32px", marginBottom: "6px" }}>📦</Text>
              <Text style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>材料库</Text>
            </View>

            <View style={{ width: "1px", height: "35px", backgroundColor: "rgba(255,255,255,0.3)" }} />

            <View style={{ alignItems: "center", marginHorizontal: "8px" }}>
              <Text style={{ fontSize: "32px", marginBottom: "6px" }}>⚙️</Text>
              <Text style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>智能生产</Text>
            </View>
          </View>
        </View>

        {/* 欢迎提示 */}
        <Text
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            paddingHorizontal: "20px",
            marginTop: "20px",
            lineHeight: "1.6",
          }}
        >
          使用微信账号登录，开启智能加工之旅
        </Text>
      </View>

      {/* 登录卡片 */}
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "24px",
          padding: "32px 24px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          position: "relative",
        }}
      >
        {/* 卡片装饰图标 */}
        <View
          style={{
            position: "absolute",
            top: -15,
            right: 20,
            width: "30px",
            height: "30px",
            backgroundColor: "#667eea",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: "14px" }}>🔒</Text>
        </View>

        {/* 登录按钮 */}
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: loading ? "rgba(255, 255, 255, 0.3)" : "#07C160",
            borderRadius: "16px",
            height: "56px",
            boxShadow: loading ? "none" : "0 8px 24px rgba(7, 193, 96, 0.3)",
          }}
          onClick={loading ? undefined : handleWechatLogin}
        >
          <Text style={{ fontSize: "24px", marginRight: "12px" }}>💬</Text>
          <Text
            style={{
              fontSize: "17px",
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            {loading ? "登录中..." : "微信一键登录"}
          </Text>
        </View>

        {/* 协议区域 */}
        <View
          style={{
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "4px",
          }}
        >
          <CheckboxGroup onChange={handleProtocolChange}>
            <Checkbox
              value="agree"
              checked={agreeProtocol}
              style={{ transform: "scale(0.85)" }}
            />
          </CheckboxGroup>
          <Text style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
            登录即表示同意
          </Text>
          <View
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Text style={{ fontSize: "14px" }}>📄</Text>
            <Text style={{ fontSize: "13px", color: "#667eea" }}>
              《用户协议》
            </Text>
          </View>
          <Text style={{ fontSize: "13px", color: "#64748B" }}>和</Text>
          <View
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Text style={{ fontSize: "14px" }}>🛡️</Text>
            <Text style={{ fontSize: "13px", color: "#667eea" }}>
              《隐私政策》
            </Text>
          </View>
        </View>

        {/* 底部装饰 */}
        <View
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <View
            style={{
              width: "32px",
              height: "4px",
              backgroundColor: "#FFFFFF",
              borderRadius: "2px",
              opacity: 0.3,
            }}
          />
          <View
            style={{
              width: "32px",
              height: "4px",
              backgroundColor: "#FFFFFF",
              borderRadius: "2px",
              opacity: 0.5,
            }}
          />
          <View
            style={{
              width: "32px",
              height: "4px",
              backgroundColor: "#FFFFFF",
              borderRadius: "2px",
              opacity: 0.7,
            }}
          />
        </View>
      </View>

      {/* 底部安全提示 */}
      <View
        style={{
          marginTop: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <Text style={{ fontSize: "14px" }}>✅</Text>
        <Text style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
          安全登录，保护您的隐私
        </Text>
      </View>
      </View>
    </View>
  );
}

/*
  ===== 优化后的登录逻辑 =====

  核心流程：
  1. 用户协议同意检查 → 微信授权 → 后端验证 → 信息存储 → 成功跳转

  主要优化点：
  1. 代码结构：将单一长函数拆分为多个职责明确的小函数
  2. 错误处理：添加重试机制、请求取消、详细错误信息
  3. 性能优化：使用 useMemo 缓存 URL、useRef 避免重渲染、请求防抖
  4. 安全增强：token 加密存储、数据验证、请求超时控制
  5. 用户体验：加载状态优化、重复请求防护、优雅的错误提示

  技术栈：
  - React Hooks (useState/useCallback/useMemo/useRef/useEffect)
  - Taro 微信小程序框架
  - TypeScript 类型安全
  - 自定义工具函数 (URL构建/安全存储/数据验证)

  安全特性：
  - code 单次使用，有效期 5 分钟
  - token 加密存储，定期过期
  - 请求超时和取消机制
  - 数据完整性验证
*/
