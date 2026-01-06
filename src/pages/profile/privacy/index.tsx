import { View, Text, ScrollView } from "@tarojs/components";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. 信息收集与使用",
      content:
        "我们可能会收集您的设备信息、位置信息、使用习惯等，用于为您提供更好的服务。我们承诺严格保护您的个人信息安全。",
    },
    {
      title: "2. 微信授权信息",
      content:
        "当您使用微信登录时，我们会获取您的微信昵称、头像等公开信息。这些信息仅用于为您提供个性化服务。",
    },
    {
      title: "3. 信息存储",
      content:
        "您的个人信息存储在安全的服务器上，我们采用行业标准的安全措施保护您的信息不被未经授权的访问、使用或泄露。",
    },
    {
      title: "4. 信息共享",
      content:
        "我们不会向第三方出售、出租或以其他方式披露您的个人信息，除非获得您的明确同意或法律要求。",
    },
    {
      title: "5. Cookie使用",
      content:
        "我们可能使用Cookie来改善用户体验，但这不会收集您的个人信息。我们尊重您的隐私选择。",
    },
    {
      title: "6. 信息安全",
      content:
        "我们采用SSL加密等技术保护您的信息安全。但请注意，互联网并非绝对安全的环境，我们会尽力保护您的信息。",
    },
    {
      title: "7. 未成年人保护",
      content:
        "我们非常重视未成年人的个人信息保护。如您为未成年人，请在监护人指导下使用我们的服务。我们会妥善保护未成年人的隐私权益。",
    },
    {
      title: "8. 政策更新",
      content:
        "我们可能会不定期更新本隐私政策。重大变更时，我们会通过小程序内通知等方式告知您，并征求您的同意。",
    },
    {
      title: "9. 联系我们",
      content:
        "如果您对本隐私政策有任何疑问或建议，请通过小程序内的反馈渠道联系我们。我们会在合理时间内回复您的咨询。",
    },
  ];

  return (
    <View
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "16px",
      }}
    >
      <ScrollView
        scrollY
        style={{
          height: "100vh",
          paddingBottom: "20px",
        }}
        scrollWithAnimation
      >
        {/* 页面标题区域 */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px 20px",
            marginBottom: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#1F2937",
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            隐私政策
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            保护您的个人信息安全
          </Text>
        </View>

        {/* 隐私政策内容区域 */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {sections.map((section, index) => (
            <View
              key={index}
              style={{
                borderBottom:
                  index < sections.length - 1 ? "1px solid #F3F4F6" : "none",
                padding: "20px",
              }}
            >
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1F2937",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                {section.title}
              </Text>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#4B5563",
                  lineHeight: "1.6",
                  display: "block",
                }}
              >
                {section.content}
              </Text>
            </View>
          ))}
        </View>

        {/* 底部信息区域 */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            marginTop: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              textAlign: "center",
            }}
          >
            最后更新时间：2026年1月5日
          </Text>
          <Text
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              textAlign: "center",
              marginTop: "4px",
            }}
          >
            您的隐私是我们最重要的承诺
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/*
生成逻辑：创建隐私政策页面，提供完整的隐私保护条款展示。
依赖技术：Taro ScrollView组件、页面配置。
原理：使用ScrollView实现可滚动内容区域，展示隐私政策各项条款，支持用户阅读和了解隐私保护措施。
*/
