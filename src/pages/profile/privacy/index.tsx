import { View, Text, ScrollView } from "@tarojs/components";

export default function PrivacyPage() {
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
          隐私政策
        </Text>

        <View style={{ lineHeight: "1.6", color: "#374151" }}>
          <Text style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", display: "block" }}>
            1. 信息收集与使用
          </Text>
          <Text style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}>
            我们可能会收集您的设备信息、位置信息、使用习惯等，用于为您提供更好的服务。我们承诺严格保护您的个人信息安全。
          </Text>

          <Text style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", display: "block" }}>
            2. 微信授权信息
          </Text>
          <Text style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}>
            当您使用微信登录时，我们会获取您的微信昵称、头像等公开信息。这些信息仅用于为您提供个性化服务。
          </Text>

          <Text style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", display: "block" }}>
            3. 信息存储
          </Text>
          <Text style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}>
            您的个人信息存储在安全的服务器上，我们采用行业标准的安全措施保护您的信息不被未经授权的访问、使用或泄露。
          </Text>

          <Text style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", display: "block" }}>
            4. 信息共享
          </Text>
          <Text style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}>
            我们不会向第三方出售、出租或以其他方式披露您的个人信息，除非获得您的明确同意或法律要求。
          </Text>

          <Text style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", display: "block" }}>
            5. Cookie使用
          </Text>
          <Text style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}>
            我们可能使用Cookie来改善用户体验，但这不会收集您的个人信息。
          </Text>

          <Text style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", display: "block" }}>
            6. 信息安全
          </Text>
          <Text style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}>
            我们采用SSL加密等技术保护您的信息安全。但请注意，互联网并非绝对安全的环境。
          </Text>

          <Text style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", display: "block" }}>
            7. 未成年人保护
          </Text>
          <Text style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}>
            我们非常重视未成年人的个人信息保护。如您为未成年人，请在监护人指导下使用我们的服务。
          </Text>

          <Text style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", display: "block" }}>
            8. 政策更新
          </Text>
          <Text style={{ fontSize: "14px", marginBottom: "16px", display: "block" }}>
            我们可能会不定期更新本隐私政策。重大变更时，我们会通过小程序内通知等方式告知您。
          </Text>

          <Text style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", display: "block" }}>
            9. 联系我们
          </Text>
          <Text style={{ fontSize: "14px", marginBottom: "20px", display: "block" }}>
            如果您对本隐私政策有任何疑问或建议，请通过小程序内的反馈渠道联系我们。
          </Text>

          <Text style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center", display: "block" }}>
            最后更新时间：2026年1月5日
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/*
生成逻辑：创建隐私政策页面，提供完整的隐私保护条款展示。
依赖技术：Taro ScrollView组件、页面配置。
原理：使用ScrollView实现可滚动内容区域，展示隐私政策各项条款，支持用户阅读和了解隐私保护措施。
*/
