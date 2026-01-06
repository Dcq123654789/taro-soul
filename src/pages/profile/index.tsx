import React, { useState } from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import { useDidShow, usePullDownRefresh, useReachBottom } from "@tarojs/taro";

/**
 * 个人中心页面组件
 * 实现微信小程序个人中心页面，包含用户信息展示、会员等级、数据统计、功能区等完整功能
 */
const ProfilePage: React.FC = () => {
  // 页面状态管理
  const [scrollTop, setScrollTop] = useState(0);
  const [userInfo] = useState({
    avatar: "https://via.placeholder.com/120x120/cccccc/ffffff?text=头像",
    nickname: "微信用户",
    wechatId: "wxid_123456789",
    memberLevel: "VIP",
    memberProgress: 75,
    followCount: 128,
    fansCount: 256,
    likeCount: 1024,
  });

  // 功能区数据
  const functionItems = [
    { id: "favorites", icon: "star", title: "我的收藏", color: "#FF6B6B" },
    {
      id: "orders",
      icon: "shopping-cart",
      title: "我的订单",
      color: "#07C160",
    },
    { id: "wallet", icon: "wallet", title: "我的钱包", color: "#FFC300" },
    { id: "address", icon: "location", title: "我的地址", color: "#FF6B6B" },
    { id: "service", icon: "service", title: "客服中心", color: "#07C160" },
    { id: "settings", icon: "setting", title: "设置", color: "#333333" },
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
      title: "隐私设置",
      subtitle: "管理个人隐私权限",
    },
    {
      id: "help",
      icon: "question-circle",
      title: "帮助与反馈",
      subtitle: "遇到问题？我们来帮您",
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
  const handleEditProfile = () => {
    console.log("编辑资料");
  };

  // 处理会员等级点击
  const handleMemberClick = () => {
    console.log("会员详情");
  };

  // 处理数据统计点击
  const handleStatsClick = (type: "follow" | "fans" | "like") => {
    console.log(`点击统计: ${type}`);
  };

  // 处理退出登录
  const handleLogout = () => {
    console.log("退出登录");
  };

  // 计算用户信息卡片的缩放比例
  const getCardScale = () => {
    const maxScale = 1;
    const minScale = 0.95;
    const scaleRange = maxScale - minScale;
    const scrollThreshold = 200;
    const progress = Math.min(scrollTop / scrollThreshold, 1);
    return maxScale - scaleRange * progress;
  };

  return (
    <View
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F5F5",
        position: "relative",
      }}
    >
      {/* 自定义导航栏区域 */}
      <View
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "88rpx", // 状态栏 + 导航栏高度
          background: "linear-gradient(135deg, #07C160 0%, #09D668 100%)",
          zIndex: 100,
          paddingTop: "44rpx", // 状态栏高度
        }}
      />

      {/* 主要内容区域 */}
      <ScrollView
        scrollY
        style={{
          height: "100vh",
          paddingTop: "88rpx",
        }}
        onScroll={handleScroll}
        enableFlex
        scrollWithAnimation
      >
        {/* 用户信息卡片区域 */}
        <View
          style={{
            margin: "24rpx 24rpx 0",
            transform: `scale(${getCardScale()})`,
            transformOrigin: "center top",
            transition: "transform 0.3s ease",
          }}
        >
          <View
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20rpx)",
              borderRadius: "24rpx",
              padding: "40rpx",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* 装饰背景 */}
            <View
              style={{
                position: "absolute",
                top: "-50rpx",
                right: "-50rpx",
                width: "200rpx",
                height: "200rpx",
                background:
                  "radial-gradient(circle, rgba(7, 193, 96, 0.1) 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            />

            {/* 用户头像和基本信息 */}
            <View
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "32rpx",
              }}
            >
              <View
                style={{
                  position: "relative",
                  marginRight: "24rpx",
                }}
              >
                <Image
                  src={userInfo.avatar}
                  style={{
                    width: "120rpx",
                    height: "120rpx",
                    borderRadius: "60rpx",
                    border: "4rpx solid #FFFFFF",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: "4rpx",
                    right: "4rpx",
                    width: "32rpx",
                    height: "32rpx",
                    backgroundColor: "#07C160",
                    borderRadius: "16rpx",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: "16rpx", color: "#FFFFFF" }}>✓</Text>
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: "34rpx",
                    fontWeight: "600",
                    color: "#333333",
                    marginBottom: "8rpx",
                    display: "block",
                  }}
                >
                  {userInfo.nickname}
                </Text>
                <Text
                  style={{
                    fontSize: "28rpx",
                    color: "rgba(255, 255, 255, 0.9)",
                    backgroundColor: "rgba(7, 193, 96, 0.1)",
                    padding: "6rpx 12rpx",
                    borderRadius: "12rpx",
                  }}
                >
                  微信号: {userInfo.wechatId}
                </Text>
              </View>

              {/* 编辑按钮 */}
              <View
                onClick={handleEditProfile}
                style={{
                  padding: "12rpx 16rpx",
                  backgroundColor: "rgba(7, 193, 96, 0.1)",
                  borderRadius: "16rpx",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Text
                  style={{
                    fontSize: "26rpx",
                    color: "#07C160",
                    marginRight: "8rpx",
                  }}
                >
                  编辑
                </Text>
                <Text style={{ fontSize: "20rpx", color: "#07C160" }}>›</Text>
              </View>
            </View>

            {/* 会员等级展示区 */}
            <View
              onClick={handleMemberClick}
              style={{
                background: "linear-gradient(135deg, #FFC300 0%, #FF8C00 100%)",
                borderRadius: "16rpx",
                padding: "20rpx 24rpx",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                marginBottom: "32rpx",
              }}
            >
              <View
                style={{
                  width: "48rpx",
                  height: "48rpx",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "24rpx",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "16rpx",
                }}
              >
                <Text
                  style={{
                    fontSize: "24rpx",
                    color: "#FFFFFF",
                    fontWeight: "bold",
                  }}
                >
                  👑
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: "32rpx",
                    fontWeight: "600",
                    color: "#FFFFFF",
                    marginBottom: "4rpx",
                    display: "block",
                  }}
                >
                  {userInfo.memberLevel}会员
                </Text>
                <View
                  style={{
                    width: "100%",
                    height: "8rpx",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    borderRadius: "4rpx",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${userInfo.memberProgress}%`,
                      height: "100%",
                      backgroundColor: "#FFFFFF",
                      borderRadius: "4rpx",
                      transition: "width 0.3s ease",
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: "24rpx",
                    color: "rgba(255, 255, 255, 0.8)",
                    marginTop: "4rpx",
                    display: "block",
                  }}
                >
                  成长值 {userInfo.memberProgress}/100
                </Text>
              </View>

              <Text style={{ fontSize: "28rpx", color: "#FFFFFF" }}>›</Text>
            </View>
          </View>
        </View>

        {/* 数据统计行 */}
        <View
          style={{
            margin: "24rpx 24rpx 0",
            backgroundColor: "#FFFFFF",
            borderRadius: "16rpx",
            padding: "32rpx 0",
            display: "flex",
          }}
        >
          <View
            onClick={() => handleStatsClick("follow")}
            style={{
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              padding: "0 16rpx",
            }}
          >
            <Text
              style={{
                fontSize: "48rpx",
                fontWeight: "600",
                color: "#333333",
                display: "block",
                marginBottom: "8rpx",
              }}
            >
              {userInfo.followCount}
            </Text>
            <Text
              style={{
                fontSize: "26rpx",
                color: "#999999",
              }}
            >
              关注
            </Text>
          </View>

          <View
            style={{
              width: "1rpx",
              backgroundColor: "#F0F0F0",
              margin: "16rpx 0",
            }}
          />

          <View
            onClick={() => handleStatsClick("fans")}
            style={{
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              padding: "0 16rpx",
            }}
          >
            <Text
              style={{
                fontSize: "48rpx",
                fontWeight: "600",
                color: "#333333",
                display: "block",
                marginBottom: "8rpx",
              }}
            >
              {userInfo.fansCount}
            </Text>
            <Text
              style={{
                fontSize: "26rpx",
                color: "#999999",
              }}
            >
              粉丝
            </Text>
          </View>

          <View
            style={{
              width: "1rpx",
              backgroundColor: "#F0F0F0",
              margin: "16rpx 0",
            }}
          />

          <View
            onClick={() => handleStatsClick("like")}
            style={{
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              padding: "0 16rpx",
            }}
          >
            <Text
              style={{
                fontSize: "48rpx",
                fontWeight: "600",
                color: "#333333",
                display: "block",
                marginBottom: "8rpx",
              }}
            >
              {userInfo.likeCount}
            </Text>
            <Text
              style={{
                fontSize: "26rpx",
                color: "#999999",
              }}
            >
              获赞
            </Text>
          </View>
        </View>

        {/* 功能区 - 宫格布局 */}
        <View
          style={{
            margin: "24rpx 24rpx 0",
            backgroundColor: "#FFFFFF",
            borderRadius: "16rpx",
            padding: "32rpx 24rpx",
          }}
        >
          <View
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "32rpx",
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
                  padding: "16rpx",
                  borderRadius: "12rpx",
                  transition: "transform 0.2s ease",
                }}
              >
                <View
                  style={{
                    width: "88rpx",
                    height: "88rpx",
                    backgroundColor: `${item.color}20`,
                    borderRadius: "44rpx",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12rpx",
                    boxShadow: "0 4rpx 12rpx rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Text style={{ fontSize: "36rpx" }}>
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
                    fontSize: "26rpx",
                    color: "#333333",
                    textAlign: "center",
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

        {/* 底部操作区 */}
        <View
          style={{
            margin: "24rpx 24rpx 40rpx",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <View
            onClick={handleLogout}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16rpx",
              padding: "32rpx",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <Text
              style={{
                fontSize: "32rpx",
                color: "#FF6B6B",
                fontWeight: "500",
              }}
            >
              退出登录
            </Text>
          </View>

          <Text
            style={{
              fontSize: "24rpx",
              color: "#999999",
              textAlign: "center",
              display: "block",
              marginTop: "16rpx",
            }}
          >
            为了您的账号安全，请谨慎操作
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfilePage;
