import React from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import { useState, useEffect, useCallback } from "react";

const profileActions = [
  {
    title: "用户协议",
    desc: "查看最新条款",
    route: "/pages/profile/agreement/index",
  },
  {
    title: "隐私政策",
    desc: "管理隐私设置",
    route: "/pages/profile/privacy/index",
  },
  // { title: "通知中心", desc: "选择消息提醒", route: "/pages/notify/index" },
  // { title: "账号安全", desc: "重置密码与验证", route: "/pages/security/index" },
  // {
  //   title: "帮助与支持",
  //   desc: "联系顾问或反馈",
  //   route: "/pages/support/index",
  // },
];

// WorkshopUser数据类型定义
interface WorkshopUser {
  id: string;
  openid: string;
  nickname?: string;
  avatarUrl?: string;
  employeeNo?: string;
  name?: string;
  role?: string;
  department?: string;
  workshopId?: string;
  workshopName?: string;
  status?: string;
  createTime?: string;
  updateTime?: string;
  // 新增字段以匹配API返回的数据结构
  _id?: string;
  tenantId?: string | null;
  version?: number;
  username?: string;
  password?: string;
  realName?: string | null;
  gender?: string;
  age?: number | null;
  address?: string | null;
  phone?: string | null;
  enabled?: string;
  avatar?: string;
  remark?: string | null;
  wxOpenid?: string;
  wxUnionid?: string | null;
  wxSessionKey?: string;
  wxNickname?: string | null;
  wxAvatarUrl?: string | null;
  wxGender?: string | null;
  wxCountry?: string | null;
  wxProvince?: string | null;
  wxCity?: string | null;
  wxLanguage?: string | null;
  wxIsDemote?: boolean | null;
  wxLastLoginTime?: string;
  new?: boolean;
}

export default function PersonalCenter() {
  // 用户数据状态
  const [userData, setUserData] = useState<WorkshopUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  // URL构建工具函数
  const buildApiUrl = useCallback((apiPath: string): string => {
    const env = process.env.TARO_ENV;
    const isMiniProgram = env !== "h5";

    if (!isMiniProgram) {
      // H5 环境：直接使用代理路径
      return apiPath;
    }

    // 小程序环境：必须使用完整 URL
    if (scope?.toAbsoluteUrl) {
      return scope.toAbsoluteUrl(apiPath);
    }

    if (scope?.BASE_URL) {
      return `${scope.BASE_URL}${apiPath}`;
    }

    console.error("无法构建API URL：scope未正确初始化");
    return apiPath;
  }, []);

  // 查询WorkshopUser数据
  const fetchUserData = useCallback(
    async (openid: string) => {
      try {
        setLoading(true);
        const apiBaseUrl = buildApiUrl("/");
        const batchUrl = `${apiBaseUrl}api/batch`;
        // 使用batch API查询WorkshopUser实体
        const response = await scope?.requestWithLoadingAndPagination(
          batchUrl,
          {
            entity: "workshop_user",
            action: "query",
            conditions: {
              // 简单等于（保持兼容）
              wxOpenid: openid,
            },
          },
          {
            method: "POST",
            paramType: "body",
          }
        );

        // 提取用户数据 - 新数据格式：response.data.content[0]
        if (
          response &&
          response.data &&
          response.data.content &&
          response.data.content.length > 0
        ) {
          const rawUser = response.data.content[0];

          // 字段映射：将API字段映射到组件期望的字段格式
          const user: WorkshopUser = {
            id: rawUser._id || rawUser.id || "",
            openid: rawUser.wxOpenid || rawUser.openid || "",
            nickname: rawUser.wxNickname || rawUser.username || "-用户",
            avatarUrl:
              rawUser.avatar ||
              rawUser.wxAvatarUrl ||
              "https://cdn.jsdelivr.net/gh/ihommani/assets/avatar-fabric.jpg",
            employeeNo: rawUser.employeeNo || "",
            name:
              rawUser.realName || rawUser.name || rawUser.username || "-用户",
            role: rawUser.role || "",
            department: rawUser.department || "",
            workshopId: rawUser.workshopId || "",
            workshopName: rawUser.workshopName || "",
            status: rawUser.status?.toString() || rawUser.enabled || "",
            createTime: rawUser.createTime,
            updateTime: rawUser.updateTime,
            // 保留原始API字段
            ...rawUser,
          };

          setUserData(user);
          setAvatarError(false); // 重置头像错误状态
        } else {
          // 设置默认数据
          setUserData({
            id: "",
            openid: openid,
            nickname: "-用户",
            avatarUrl:
              "https://cdn.jsdelivr.net/gh/ihommani/assets/avatar-fabric.jpg",
            employeeNo: "",
            name: "-用户",
            role: "",
            department: "",
            workshopId: "",
            workshopName: "",
            status: "",
            _id: "",
            wxOpenid: openid,
          });
        }
      } catch (error) {
        console.error("查询WorkshopUser数据失败:", error);
        Taro.showToast({
          title: "获取用户信息失败",
          icon: "none",
          duration: 2000,
        });
        // 设置默认数据
        setUserData({
          id: "",
          openid: openid,
          nickname: "-用户",
          avatarUrl:
            "https://cdn.jsdelivr.net/gh/ihommani/assets/avatar-fabric.jpg",
          employeeNo: "",
          name: "-用户",
          role: "",
          department: "",
          workshopId: "",
          workshopName: "",
          status: "",
          _id: "",
          wxOpenid: openid,
        });
      } finally {
        setLoading(false);
      }
    },
    [buildApiUrl]
  );

  // 组件挂载时获取用户数据
  useEffect(() => {
    const initUserData = async () => {
      try {
        // 获取保存的openid
        const openid = Taro.getStorageSync("openid");

        if (!openid) {
          console.warn("未找到保存的openid");
          Taro.showToast({
            title: "请先登录",
            icon: "none",
            duration: 2000,
          });
          // 跳转到登录页面
          setTimeout(() => {
            Taro.redirectTo({ url: "/pages/login/index" });
          }, 2000);
          return;
        }

        // 根据openid查询WorkshopUser数据
        await fetchUserData(openid);
      } catch (error) {
        console.error("初始化用户数据失败:", error);
        setLoading(false);
      }
    };

    initUserData();
  }, [fetchUserData]);

  // 显示用户名
  const displayName = userData?.name || userData?.nickname || "-用户";
  // 显示性别
  const displayGender = userData?.gender || "-";
  // 显示年龄
  const displayAge = userData?.age ? `${userData.age}岁` : "-";
  // 显示员工编号（不展示ID）
  const displayEmployeeNo = userData?.employeeNo
    ? `员工编号：${userData.employeeNo}`
    : "员工编号：-";
  // 显示头像 - 处理微信头像URL
  const getDisplayAvatar = () => {
    if (avatarError) {
      return "https://cdn.jsdelivr.net/gh/ihommani/assets/avatar-fabric.jpg";
    }

    const avatarUrl = userData?.avatarUrl;
    if (!avatarUrl) {
      return "https://cdn.jsdelivr.net/gh/ihommani/assets/avatar-fabric.jpg";
    }

    // 检查是否为微信头像URL，如果是则添加时间戳防止缓存问题
    if (
      avatarUrl.includes("thirdwx.qlogo.cn") ||
      avatarUrl.includes("wx.qlogo.cn")
    ) {
      const timestamp = Date.now();
      return `${avatarUrl}${avatarUrl.includes("?") ? "&" : "?"}t=${timestamp}`;
    }

    return avatarUrl;
  };

  const displayAvatar = getDisplayAvatar();

  // 显示加载状态
  if (loading) {
    return (
      <View
        style={{
          minHeight: "100vh",
          backgroundColor: "#F8FAFC",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#94A3B8", fontSize: "14px" }}>加载中...</Text>
      </View>
    );
  }

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
        onClick={() => {
          Taro.navigateTo({
            url: "/pages/profile/personal-info/index",
            fail: (error) => {
              console.error("跳转个人信息页面失败:", error);
              Taro.showToast({
                title: "页面跳转失败",
                icon: "error",
                duration: 2000,
              });
            },
          });
        }}
        hoverClass="page-hover"
      >
        <Image
          src={displayAvatar}
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "18px",
            marginRight: "16px",
          }}
          onError={(e) => {
            setAvatarError(true);
          }}
          onLoad={() => {
            // 头像加载成功时重置错误状态
            setAvatarError(false);
          }}
          mode="aspectFill"
        />
        <View>
          <Text
            style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A" }}
          >
            {displayName}
          </Text>
          <Text
            style={{
              display: "block",
              marginTop: "6px",
              fontSize: "12px",
              color: "#94A3B8",
            }}
          >
            性别：{displayGender} | 年龄：{displayAge}
          </Text>
          <Text
            style={{
              display: "block",
              marginTop: "4px",
              fontSize: "12px",
              color: "#64748B",
            }}
          >
            {displayEmployeeNo}
          </Text>
          {userData?.workshopName && (
            <Text
              style={{
                display: "block",
                marginTop: "4px",
                fontSize: "12px",
                color: "#64748B",
              }}
            >
              {userData.workshopName}
            </Text>
          )}
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

/*
生成逻辑：根据保存的openid查询WorkshopUser实体获取用户数据，适配新的API数据格式(response.data.content[0])，包含用户基本信息、性别、年龄、员工编号、车间信息等。
依赖技术：React Hooks(useState, useEffect, useCallback)、Taro Storage API、scope工具类、batch API查询、Taro Image组件。
原理：组件挂载时从本地存储获取openid，通过batch API查询workshop_user实体，对API返回数据进行字段映射，更新UI显示头像、名称、性别、年龄等用户信息，不展示ID。头像加载失败时自动降级到默认头像。
*/
