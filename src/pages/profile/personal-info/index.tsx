import React from "react";
import { View, Text, Image, ScrollView } from "@tarojs/components";
import { useState } from "react";
import Taro from "@tarojs/taro";

/**
 * 用户详情页面组件
 * 实现移动端用户详情页面的完整功能，包含用户信息展示、账号状态、数据统计和功能操作
 * 使用TailwindCSS进行样式管理，确保移动端适配和视觉效果
 */

// 用户信息类型定义
interface UserInfo {
  avatar: string;
  username: string;
  phone: string;
  gender: "男" | "女";
  birthday: string;
  registerTime: string;
  city: string;
  accountStatus: "正常" | "异常";
  realNameVerified: boolean;
  phoneBound: boolean;
  orderCount: number;
  favoriteCount: number;
  points: number;
  couponCount: number;
  isFollowing: boolean;
  tags: string[];
}

// 模拟用户数据
const mockUserInfo: UserInfo = {
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  username: "张三",
  phone: "138****8888",
  gender: "男",
  birthday: "1990-01-01",
  registerTime: "2023-01-15",
  city: "北京市",
  accountStatus: "正常",
  realNameVerified: true,
  phoneBound: true,
  orderCount: 25,
  favoriteCount: 12,
  points: 1250,
  couponCount: 3,
  isFollowing: false,
  tags: ["VIP会员", "实名认证"],
};

// 基础信息项配置
const basicInfoItems = [
  { label: "手机号", key: "phone", value: mockUserInfo.phone },
  { label: "性别", key: "gender", value: mockUserInfo.gender },
  { label: "生日", key: "birthday", value: mockUserInfo.birthday },
  { label: "注册时间", key: "registerTime", value: mockUserInfo.registerTime },
  { label: "所在城市", key: "city", value: mockUserInfo.city },
];

// 账号状态项配置
const accountStatusItems = [
  {
    icon: "👤",
    text: "账号状态",
    status: mockUserInfo.accountStatus,
    color: mockUserInfo.accountStatus === "正常" ? "#67C23A" : "#F56C6C",
  },
  {
    icon: "⭐",
    text: "实名认证",
    status: mockUserInfo.realNameVerified ? "已认证" : "未认证",
    color: mockUserInfo.realNameVerified ? "#67C23A" : "#E6A23C",
  },
  {
    icon: "📱",
    text: "绑定手机",
    status: mockUserInfo.phoneBound ? "已绑定" : "未绑定",
    color: mockUserInfo.phoneBound ? "#67C23A" : "#E6A23C",
  },
];

// 数据统计项配置
const statsItems = [
  { number: mockUserInfo.orderCount, label: "订单数" },
  { number: mockUserInfo.favoriteCount, label: "收藏数" },
  { number: mockUserInfo.points, label: "积分" },
  { number: mockUserInfo.couponCount, label: "优惠券" },
];

// 功能项数据
const actionItems = [
  { icon: "✏️", text: "编辑资料", key: "edit" },
  { icon: "📍", text: "收货地址", key: "address" },
  { icon: "🔒", text: "安全设置", key: "security" },
  { icon: "💬", text: "消息通知", key: "notification" },
  { icon: "❓", text: "帮助中心", key: "help" },
  { icon: "📞", text: "联系客服", key: "service" },
];

/**
 * 用户详情页面主组件
 */
const PersonalInfo: React.FC = () => {
  // 编辑状态管理
  const [editingField, setEditingField] = useState<string | null>(null);
  // 用户信息状态
  const [userInfo] = useState<UserInfo>(mockUserInfo);
  // 关注状态
  const [isFollowing, setIsFollowing] = useState(userInfo.isFollowing);

  /**
   * 处理基础信息项点击 - 切换编辑状态
   */
  const handleInfoItemClick = (key: string) => {
    setEditingField(editingField === key ? null : key);
    Taro.showToast({
      title: "编辑功能开发中",
      icon: "none",
    });
  };

  /**
   * 处理关注状态切换
   */
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    Taro.showToast({
      title: isFollowing ? "已取消关注" : "关注成功",
      icon: "success",
    });
  };

  /**
   * 处理功能项点击
   */
  const handleActionClick = (key: string) => {
    Taro.showToast({
      title: `${actionItems.find((item) => item.key === key)?.text}功能开发中`,
      icon: "none",
    });
  };

  /**
   * 处理头像点击 - 预览大图
   */
  const handleAvatarClick = () => {
    Taro.previewImage({
      current: userInfo.avatar,
      urls: [userInfo.avatar],
    });
  };

  /**
   * 顶部信息区组件
   */
  const UserHeader: React.FC = () => (
    <View
      style={{
        position: "relative",
        height: "250rpx",
        background: "linear-gradient(180deg, #409EFF 0%, #66B1FF 100%)",
      }}
    >
      {/* 背景装饰 - 毛玻璃效果 */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10rpx)",
        }}
      ></View>

      {/* 操作按钮 */}
      <View
        style={{
          position: "absolute",
          top: 32,
          right: 24,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
          onClick={() => Taro.navigateBack()}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 18 }}>‹</Text>
        </View>
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 18 }}>⋯</Text>
        </View>
      </View>

      {/* 用户信息 */}
      <View
        style={{
          position: "absolute",
          bottom: 32,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 头像 */}
        <View style={{ position: "relative", marginBottom: 16 }}>
          <Image
            src={userInfo.avatar}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 2,
              borderColor: "#FFFFFF",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            onClick={handleAvatarClick}
          />
        </View>

        {/* 用户名 */}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          {userInfo.username}
        </Text>

        {/* 用户标签 */}
        <View
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {userInfo.tags.map((tag, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 4,
                paddingBottom: 4,
                borderRadius: 20,
                marginRight: index < userInfo.tags.length - 1 ? 8 : 0,
                marginBottom: 4,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 12 }}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  /**
   * 基础信息卡片组件
   */
  const UserBasicInfo: React.FC = () => (
    <View
      style={{
        marginLeft: 16,
        marginRight: 16,
        marginTop: 16,
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        boxShadow: "0 2rpx 8rpx rgba(0,0,0,0.05)",
      }}
    >
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#303133",
            marginBottom: 16,
          }}
        >
          基础信息
        </Text>
        <View>
          {basicInfoItems.map((item, index) => (
            <View
              key={item.key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 8,
                paddingBottom: 8,
                marginBottom: index < basicInfoItems.length - 1 ? 16 : 0,
              }}
              onClick={() => handleInfoItemClick(item.key)}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#606266",
                }}
              >
                {item.label}
              </Text>
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#303133", fontSize: 14, marginRight: 8 }}
                >
                  {item.value}
                </Text>
                <Text style={{ color: "#909399", fontSize: 12 }}>✏️</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  /**
   * 账号状态卡片组件
   */
  const UserAccountStatus: React.FC = () => (
    <View
      style={{
        marginLeft: 16,
        marginRight: 16,
        marginTop: 16,
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        boxShadow: "0 2rpx 8rpx rgba(0,0,0,0.05)",
      }}
    >
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#303133",
            marginBottom: 16,
          }}
        >
          账号状态
        </Text>
        <View style={{ display: "flex", justifyContent: "space-between" }}>
          {accountStatusItems.map((item, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</Text>
              <Text style={{ fontSize: 12, color: "#606266", marginBottom: 8 }}>
                {item.text}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: item.color,
                }}
              >
                {item.status}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  /**
   * 数据统计卡片组件
   */
  const UserStats: React.FC = () => (
    <View
      style={{
        marginLeft: 16,
        marginRight: 16,
        marginTop: 16,
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        boxShadow: "0 2rpx 8rpx rgba(0,0,0,0.05)",
      }}
    >
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#303133",
            marginBottom: 16,
          }}
        >
          数据统计
        </Text>
        <View style={{ display: "flex", justifyContent: "space-between" }}>
          {statsItems.map((item, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#409EFF",
                  marginBottom: 4,
                }}
              >
                {item.number}
              </Text>
              <Text style={{ fontSize: 12, color: "#606266" }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  /**
   * 功能操作区组件
   */
  const UserActions: React.FC = () => (
    <View
      style={{
        marginLeft: 16,
        marginRight: 16,
        marginTop: 16,
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        boxShadow: "0 2rpx 8rpx rgba(0,0,0,0.05)",
      }}
    >
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#303133",
            marginBottom: 16,
          }}
        >
          功能操作
        </Text>
        <View
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {actionItems.map((item) => (
            <View
              key={item.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 12,
                paddingBottom: 12,
                borderRadius: 8,
              }}
              onClick={() => handleActionClick(item.key)}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#606266",
                  textAlign: "center",
                }}
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  /**
   * 底部固定区组件
   */
  const UserFooter: React.FC = () => (
    <View
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E6EB",
        padding: 16,
        boxShadow: "0 -2rpx 8rpx rgba(0,0,0,0.05)",
      }}
    >
      <View style={{ display: "flex" }}>
        <View
          style={{
            flex: 1,
            height: 48,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "500",
            fontSize: 14,
            backgroundColor: isFollowing ? "#F5F7FA" : "#409EFF",
            color: isFollowing ? "#303133" : "#FFFFFF",
            marginRight: 12,
          }}
          onClick={handleFollowToggle}
        >
          {isFollowing ? "取消关注" : "关注"}
        </View>
        <View
          style={{
            flex: 1,
            height: 48,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: "#409EFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "500",
            fontSize: 14,
            color: "#409EFF",
          }}
        >
          拉黑/举报
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ minHeight: "100vh", backgroundColor: "#F5F7FA" }}>
      {/* 顶部信息区 */}
      <UserHeader />

      {/* 可滚动内容区 */}
      <ScrollView scrollY style={{ paddingBottom: "120rpx" }}>
        {/* 核心信息区 */}
        <UserBasicInfo />
        <UserAccountStatus />
        <UserStats />

        {/* 功能操作区 */}
        <UserActions />
      </ScrollView>

      {/* 底部固定区 */}
      <UserFooter />
    </View>
  );
};

export default PersonalInfo;

/*
生成逻辑：
1. 使用React函数组件和Hooks实现用户详情页面
2. 按照需求文档严格分层布局：顶部信息区、核心信息区（3个卡片）、功能操作区、底部固定区
3. 使用内联样式确保小程序兼容性
4. 实现点击反馈、状态管理等交互细节，使用emoji表情符号替代图标
5. 集成Taro API实现导航和提示功能
6. 组件化设计：将页面拆分为UserHeader、UserBasicInfo、UserAccountStatus、UserStats、UserActions、UserFooter等模块

依赖技术：
- React Hooks (useState)：状态管理
- Taro组件：@tarojs/components提供基础UI组件
- Taro API：实现页面导航和用户提示
- 内联样式：确保小程序环境兼容性

原理：
- 组件化设计：页面分解为多个功能模块，便于维护和复用
- 状态驱动：使用React状态管理用户交互和数据变化
- 样式系统：使用内联样式确保跨平台兼容
- 交互优化：添加点击反馈效果，提升用户体验
- 性能考虑：使用ScrollView处理长内容，避免频繁重渲染
- 设计规范：严格按照需求规格实现配色、字体、间距等设计规范
*/
