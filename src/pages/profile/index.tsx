import React, { useState } from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import { useDidShow, usePullDownRefresh, useReachBottom } from "@tarojs/taro";
import { Avatar } from "@nutui/nutui-react-taro";
// 本地默认头像导入，使用项目别名 @ 指向 src 目录（见 config）
import avatarImg from "@/assets/images/avatar.png";

/**
 * 个人中心页面组件
 * 实现微信小程序个人中心页面，包含用户信息展示、会员等级、数据统计、功能区等完整功能
 */
const ProfilePage: React.FC = () => {
  // 页面状态管理
  const [scrollTop, setScrollTop] = useState(0);

  const [userInfo] = useState({
    // 使用本地项目内的默认头像（通过 import 导入，构建器会处理静态资源）
    avatar: avatarImg,
    nickname: "微信用户",
    phone: "138****1234",
    wechatId: "wxid_123456789",
    memberLevel: "VIP",
    memberProgress: 75,
    followCount: 128,
    fansCount: 256,
    likeCount: 1024,
  });

  // 功能区数据
  const functionItems = [
    {
      id: "orders",
      icon: "shopping-cart",
      title: "订单列表",
      color: "#07C160",
    },
    { id: "address", icon: "location", title: "我的地址", color: "#FF6B6B" },
    { id: "service", icon: "service", title: "客服中心", color: "#07C160" },
  ];

  // 工具列表数据
  const toolItems = [
    {
      id: "notifications",
      icon: "bell",
      title: "消息通知",
      subtitle: "接收重要通知和提醒",
    },
    {
      id: "privacy",
      icon: "shield",
      title: "隐私政策",
      subtitle: "查看隐私政策详情",
    },
    {
      id: "help",
      icon: "question-circle",
      title: "用户协议",
      subtitle: "查看用户协议条款",
    },
    {
      id: "about",
      icon: "info-circle",
      title: "关于我们",
      subtitle: "了解更多关于我们",
    },
  ];

  // 页面初始化
  useDidShow(() => {
    // 页面显示时的数据加载逻辑
    console.log("个人中心页面显示");
  });

  // 下拉刷新处理
  usePullDownRefresh(() => {
    console.log("下拉刷新触发");
    // 模拟数据刷新
    setTimeout(() => {
      console.log("数据刷新完成");
    }, 1500);
  });

  // 滚动到底部处理
  useReachBottom(() => {
    console.log("滚动到底部");
  });

  // 处理滚动事件
  const handleScroll = (e: any) => {
    setScrollTop(e.detail.scrollTop);
  };

  // 处理功能点击
  const handleFunctionClick = (itemId: string) => {
    console.log(`点击功能: ${itemId}`);
    // 根据itemId跳转到对应页面
  };

  // 处理工具项点击
  const handleToolClick = (itemId: string) => {
    console.log(`点击工具: ${itemId}`);
    // 根据itemId跳转到对应页面
  };

  // 处理编辑资料点击

  return (
    <View
      style={{
        minHeight: "100vh",
        // 轻柔蓝色底色，提升整体质感
        backgroundColor: "#F6FBFF",
        position: "relative",
      }}
    >
      {/* 主要内容区域 */}
      <ScrollView
        scrollY
        style={{
          height: "100vh",
        }}
        onScroll={handleScroll}
        enableFlex
        scrollWithAnimation
      >
        {/* 人物信息展示区域（更简洁的卡片风格与柔和色调） */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20rpx",
            margin: "24rpx",
            zIndex: 2,
            padding: "28rpx",
            // 轻微阴影让卡片有层次感
            boxShadow: "0 8rpx 20rpx rgba(14, 30, 37, 0.06)",
          }}
        >
          {/* 头像区域 */}
          <View
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20rpx",
            }}
          >
            {/* 圆形头像容器：使用 Image 的 aspectFill（覆盖）模式裁剪为圆形 */}
            <View
              style={{
                width: "140rpx",
                height: "140rpx",
                borderRadius: "70rpx",
                marginRight: "24rpx",
                overflow: "hidden",
                boxShadow: "0 8rpx 18rpx rgba(14, 30, 37, 0.08)",
                backgroundColor: "#f2f6fb",
                flexShrink: 0,
              }}
            >
              <Image
                src={userInfo.avatar}
                mode="aspectFill"
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            </View>
            <View style={{ flex: 1 }}>
              {/* 人物名称 */}
              <Text
                style={{
                  fontSize: "36rpx",
                  fontWeight: "600",
                  color: "#333333",
                  marginBottom: "8rpx",
                  display: "block",
                }}
              >
                {userInfo.nickname}
              </Text>
              {/* 人物电话 */}
              <Text
                style={{
                  fontSize: "28rpx",
                  color: "#666666",
                }}
              >
                📞 {userInfo.phone}
              </Text>
            </View>
          </View>
        </View>
        {/* 功能区 - 精简宫格布局 */}
        <View
          style={{
            margin: "24rpx 24rpx 0",
            backgroundColor: "transparent",
            borderRadius: "12rpx",
            padding: "16rpx 8rpx",
          }}
        >
          <View
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20rpx",
            }}
          >
            {functionItems.map((item) => (
              <View
                key={item.id}
                onClick={() => handleFunctionClick(item.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "10rpx",
                  borderRadius: "14rpx",
                  transition: "transform 0.18s ease",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 6rpx 18rpx rgba(14,30,37,0.06)",
                }}
              >
                <View
                  style={{
                    width: "80rpx",
                    height: "80rpx",
                    backgroundColor: `${item.color}15`,
                    borderRadius: "40rpx",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "10rpx",
                  }}
                >
                  <Text style={{ fontSize: "34rpx" }}>
                    {item.icon === "star" && "⭐"}
                    {item.icon === "shopping-cart" && "🛒"}
                    {item.icon === "wallet" && "💰"}
                    {item.icon === "location" && "📍"}
                    {item.icon === "service" && "💬"}
                    {item.icon === "setting" && "⚙️"}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: "28rpx",
                    color: "#222222",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {item.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {/* 工具列表区 */}
        <View
          style={{
            margin: "24rpx 24rpx 0",
            backgroundColor: "#FFFFFF",
            borderRadius: "16rpx",
          }}
        >
          {toolItems.map((item, index) => (
            <View key={item.id}>
              <View
                onClick={() => handleToolClick(item.id)}
                style={{
                  padding: "24rpx 32rpx",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <View
                  style={{
                    width: "48rpx",
                    height: "48rpx",
                    backgroundColor: "#F5F5F5",
                    borderRadius: "24rpx",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "20rpx",
                  }}
                >
                  <Text style={{ fontSize: "24rpx" }}>
                    {item.icon === "bell" && "🔔"}
                    {item.icon === "shield" && "🛡️"}
                    {item.icon === "question-circle" && "❓"}
                    {item.icon === "info-circle" && "ℹ️"}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: "32rpx",
                      fontWeight: "500",
                      color: "#333333",
                      marginBottom: "4rpx",
                      display: "block",
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: "26rpx",
                      color: "#999999",
                    }}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: "28rpx",
                    color: "#CCCCCC",
                  }}
                >
                  ›
                </Text>
              </View>

              {index < toolItems.length - 1 && (
                <View
                  style={{
                    height: "1rpx",
                    backgroundColor: "#F0F0F0",
                    marginLeft: "100rpx",
                  }}
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
