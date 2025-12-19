import Taro from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const profileActions = [
  { title: "用户协议", desc: "查看最新条款", route: "/pages/agreement/index" },
  { title: "隐私政策", desc: "管理隐私设置", route: "/pages/privacy/index" },
  { title: "通知中心", desc: "选择消息提醒", route: "/pages/notify/index" },
  { title: "账号安全", desc: "重置密码与验证", route: "/pages/security/index" },
  {
    title: "帮助与支持",
    desc: "联系顾问或反馈",
    route: "/pages/support/index",
  },
];

export default function PersonalCenter() {
  useAuthGuard();
  return (
    <View
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "20px 16px 32px",
        boxSizing: "border-box",
      }}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          padding: "20px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: "20px",
          boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
        }}
      >
        <Image
          src="https://cdn.jsdelivr.net/gh/ihommani/assets/avatar-fabric.jpg"
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "18px",
            marginRight: "16px",
          }}
        />
        <View>
          <Text
            style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A" }}
          >
            陈婕
          </Text>
          <Text
            style={{
              display: "block",
              marginTop: "6px",
              fontSize: "12px",
              color: "#94A3B8",
            }}
          >
            员工编号：WX-1027
          </Text>
        </View>
      </View>

      <View>
        {profileActions.map((action, idx) => (
          <View
            key={action.title}
            style={{
              marginBottom: idx === profileActions.length - 1 ? "0" : "12px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "16px 18px",
              boxShadow: "0 12px 26px rgba(15,23,42,0.06)",
            }}
            hoverClass="page-hover"
            onClick={() => {
              if (!action.route) return;
              Taro.navigateTo({ url: action.route });
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#0F172A",
                  }}
                >
                  {action.title}
                </Text>
                <Text
                  style={{
                    display: "block",
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#94A3B8",
                  }}
                >
                  {action.desc}
                </Text>
              </View>
              <Text style={{ fontSize: "18px", color: "#CBD5F5" }}>›</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
