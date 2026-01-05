import { View, Text, ScrollView } from "@tarojs/components";

export default function AgreementPage() {
  return (
    <ScrollView
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "20px 16px",
      }}
      scrollY
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Text
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#0F172A",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          用户协议
        </Text>

        <View style={{ lineHeight: "1.6", color: "#374151" }}>
          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "block",
            }}
          >
            1. 服务条款
          </Text>
          <Text
            style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}
          >
            欢迎您使用我们的小程序服务。本协议是您与本小程序服务提供者之间就使用本服务所订立的协议。
          </Text>

          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "block",
            }}
          >
            2. 用户资格
          </Text>
          <Text
            style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}
          >
            您确认，在您开始使用本服务前，您应当具备中华人民共和国法律规定的与您行为相适应的民事行为能力。
          </Text>

          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "block",
            }}
          >
            3. 服务内容
          </Text>
          <Text
            style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}
          >
            本小程序为您提供车间管理、工作流程优化等相关服务。我们将根据实际情况不断更新和完善服务内容。
          </Text>

          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "block",
            }}
          >
            4. 用户义务
          </Text>
          <Text
            style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}
          >
            您应当妥善保管您的账户信息，不得将账户转让、出售或出借给他人使用。您对使用本服务产生的后果承担全部责任。
          </Text>

          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "block",
            }}
          >
            5. 隐私保护
          </Text>
          <Text
            style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}
          >
            我们重视您的隐私权，详细的隐私保护政策请查看《隐私政策》。
          </Text>

          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "block",
            }}
          >
            6. 服务变更、中断或终止
          </Text>
          <Text
            style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}
          >
            我们可能会对服务内容进行变更、暂停或终止。如遇不可抗力等因素导致服务中断，我们将尽力恢复服务。
          </Text>

          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "block",
            }}
          >
            7. 免责声明
          </Text>
          <Text
            style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}
          >
            本服务按"现状"提供，我们不保证服务不会中断，也不保证服务的及时性、安全性、准确性。
          </Text>

          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "block",
            }}
          >
            8. 协议修改
          </Text>
          <Text
            style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}
          >
            我们保留随时修改本协议的权利。修改后的协议将在小程序内公布，视为您已接受修改内容。
          </Text>

          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              display: "block",
            }}
          >
            9. 法律适用
          </Text>
          <Text
            style={{ fontSize: "14px", marginBottom: "20px", display: "block" }}
          >
            本协议适用中华人民共和国法律。如发生争议，应提交有管辖权的人民法院解决。
          </Text>

          <Text
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              textAlign: "center",
              display: "block",
            }}
          >
            最后更新时间：2026年1月5日
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/*
生成逻辑：创建用户协议页面，提供完整的用户协议条款展示。
依赖技术：Taro ScrollView组件、页面配置。
原理：使用ScrollView实现可滚动内容区域，展示用户协议各项条款，支持用户阅读和导航。
*/
