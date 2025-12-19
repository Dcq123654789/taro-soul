import { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type TabType = "order" | "employeeOrder";
type StatusType = "completed" | "processing" | "pending";

interface OrderItem {
  id: string;
  orderNo: string;
  customerName: string;
  amount: number;
  status: StatusType;
  createTime: string;
  employeeName?: string;
}

export default function Hall() {
  useAuthGuard();
  const scopeRef = (globalThis as any)?.scope;
  const [activeTab, setActiveTab] = useState<TabType>("order");
  const [activeStatus, setActiveStatus] = useState<StatusType>("completed");

  // 模拟订单数据
  const defaultOrderData: OrderItem[] = [
    {
      id: "1",
      orderNo: "ORD20240101001",
      customerName: "张三",
      amount: 1280.0,
      status: "completed",
      createTime: "2024-01-15 10:30:00",
    },
    {
      id: "2",
      orderNo: "ORD20240101002",
      customerName: "李四",
      amount: 2560.0,
      status: "completed",
      createTime: "2024-01-15 11:20:00",
    },
    {
      id: "3",
      orderNo: "ORD20240101003",
      customerName: "王五",
      amount: 890.0,
      status: "processing",
      createTime: "2024-01-15 14:15:00",
    },
    {
      id: "4",
      orderNo: "ORD20240101004",
      customerName: "赵六",
      amount: 3200.0,
      status: "processing",
      createTime: "2024-01-15 15:30:00",
    },
    {
      id: "5",
      orderNo: "ORD20240101005",
      customerName: "钱七",
      amount: 1500.0,
      status: "pending",
      createTime: "2024-01-15 16:00:00",
    },
    {
      id: "6",
      orderNo: "ORD20240101006",
      customerName: "孙八",
      amount: 980.0,
      status: "pending",
      createTime: "2024-01-15 16:30:00",
    },
  ];

  // 模拟员工订单数据
  const defaultEmployeeOrderData: OrderItem[] = [
    {
      id: "e1",
      orderNo: "ORD20240101001",
      customerName: "张三",
      amount: 1280.0,
      status: "completed",
      createTime: "2024-01-15 10:30:00",
      employeeName: "员工A",
    },
    {
      id: "e2",
      orderNo: "ORD20240101002",
      customerName: "李四",
      amount: 2560.0,
      status: "completed",
      createTime: "2024-01-15 11:20:00",
      employeeName: "员工B",
    },
    {
      id: "e3",
      orderNo: "ORD20240101003",
      customerName: "王五",
      amount: 890.0,
      status: "processing",
      createTime: "2024-01-15 14:15:00",
      employeeName: "员工A",
    },
    {
      id: "e4",
      orderNo: "ORD20240101004",
      customerName: "赵六",
      amount: 3200.0,
      status: "processing",
      createTime: "2024-01-15 15:30:00",
      employeeName: "员工C",
    },
    {
      id: "e5",
      orderNo: "ORD20240101005",
      customerName: "钱七",
      amount: 1500.0,
      status: "pending",
      createTime: "2024-01-15 16:00:00",
      employeeName: "员工B",
    },
    {
      id: "e6",
      orderNo: "ORD20240101006",
      customerName: "孙八",
      amount: 980.0,
      status: "pending",
      createTime: "2024-01-15 16:30:00",
      employeeName: "员工A",
    },
  ];
  const [orderData, setOrderData] = useState<OrderItem[]>(defaultOrderData);
  const [employeeOrderData] = useState<OrderItem[]>(defaultEmployeeOrderData);
  const [, setFieldColumns] = useState<Record<string, any>[]>([]);

  const joinUrl = (baseUrl: string, path: string) => {
    if (!baseUrl) return "";
    const normalizedBase = baseUrl.replace(/\/+$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  };

  const safeExtractList = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.records)) return res.records;
    if (Array.isArray(res.list)) return res.list;
    return [];
  };

  const fetchData = useCallback(async () => {
    if (!scopeRef) {
      Taro.showToast({
        title: "全局 scope 不存在，请检查注册逻辑",
        icon: "none",
      });
      return;
    }

    const apiBaseUrl =
      scopeRef.session?.app_service_base_url || scopeRef.BASE_URL || "";
    if (!apiBaseUrl) {
      Taro.showToast({
        title: "API 地址未配置，请先设置 scope BASE_URL",
        icon: "none",
      });
      return;
    }

    try {
      const batchUrl = joinUrl(apiBaseUrl, "/api/batch");
      const fieldUrl = joinUrl(apiBaseUrl, "/api/entity/fields");

      const res = await scopeRef.requestWithLoadingAndPagination(
        batchUrl,
        {
          entity: "work_order",
          action: "query",
        },
        {
          method: "POST",
          paramType: "body",
        }
      );
      const remoteList = safeExtractList(res);
      setOrderData(remoteList.length ? (remoteList as OrderItem[]) : []);

      const columnData = await scopeRef.requestWithLoadingAndPagination(
        fieldUrl,
        {
          entity: "work_order",
        },
        {
          method: "POST",
          paramType: "body",
        }
      );
      const remoteFields = safeExtractList(columnData);
      setFieldColumns(remoteFields);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "请求失败，请稍后重试";
      Taro.showToast({
        title: message,
        icon: "none",
      });
    }
  }, [scopeRef]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /*
    生成逻辑：利用 useCallback 封装批量查询函数，依赖全局 scope 对象调用 requestWithLoadingAndPagination，并在 useEffect 中首屏触发；通过 safeExtractList 兼容不同返回结构。
    依赖技术：React Hooks（useState/useCallback/useEffect）、Taro API、全局 scope 工具。
  */

  // 根据当前选中的tab和status过滤数据
  const filteredData = useMemo(() => {
    const data = activeTab === "order" ? orderData : employeeOrderData;
    return data.filter((item) => item.status === activeStatus);
  }, [activeTab, activeStatus]);

  const getStatusText = (status: StatusType) => {
    const map = {
      completed: "已完成",
      processing: "进行中",
      pending: "待派发",
    };
    return map[status];
  };

  const getStatusColor = (status: StatusType) => {
    const map = {
      completed: "#10B981",
      processing: "#3B82F6",
      pending: "#F59E0B",
    };
    return map[status];
  };

  // 跳转到订单详情页
  const handleOrderClick = (item: OrderItem) => {
    Taro.navigateTo({
      url: "/pages/order-detail/index",
      success: (res) => {
        res.eventChannel?.emit("order:open", item);
      },
    });
  };

  return (
    <View
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAFAFB",
        paddingBottom: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* 头部导航栏 */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          padding: "16px",
          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.05)",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: "#F1F5F9",
            borderRadius: "8px",
            padding: "4px",
          }}
        >
          <View
            onClick={() => setActiveTab("order")}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: "6px",
              textAlign: "center",
              backgroundColor:
                activeTab === "order" ? "#FFFFFF" : "transparent",
              boxShadow:
                activeTab === "order"
                  ? "0 1px 3px rgba(15, 23, 42, 0.1)"
                  : "none",
              cursor: "pointer",
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                fontWeight: activeTab === "order" ? "600" : "400",
                color: activeTab === "order" ? "#0F172A" : "#64748B",
              }}
            >
              订单
            </Text>
          </View>
          <View
            onClick={() => setActiveTab("employeeOrder")}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: "6px",
              textAlign: "center",
              backgroundColor:
                activeTab === "employeeOrder" ? "#FFFFFF" : "transparent",
              boxShadow:
                activeTab === "employeeOrder"
                  ? "0 1px 3px rgba(15, 23, 42, 0.1)"
                  : "none",
              cursor: "pointer",
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                fontWeight: activeTab === "employeeOrder" ? "600" : "400",
                color: activeTab === "employeeOrder" ? "#0F172A" : "#64748B",
              }}
            >
              员工订单
            </Text>
          </View>
        </View>
      </View>

      {/* 子导航栏 */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          padding: "12px 16px",
          marginTop: "8px",
          display: "flex",
          flexDirection: "row",
          gap: "8px",
        }}
      >
        {(["completed", "processing", "pending"] as StatusType[]).map(
          (status) => (
            <View
              key={status}
              onClick={() => setActiveStatus(status)}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                backgroundColor:
                  activeStatus === status ? "#EFF6FF" : "#F8FAFC",
                border:
                  activeStatus === status
                    ? "1px solid #3B82F6"
                    : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  fontWeight: activeStatus === status ? "600" : "400",
                  color: activeStatus === status ? "#3B82F6" : "#64748B",
                }}
              >
                {getStatusText(status)}
              </Text>
            </View>
          )
        )}
      </View>

      {/* 订单列表 */}
      <View style={{ padding: "16px" }}>
        {filteredData.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <Text style={{ fontSize: "14px", color: "#94A3B8" }}>
              暂无{getStatusText(activeStatus)}的订单
            </Text>
          </View>
        ) : (
          filteredData.map((item) => (
            <View
              key={item.id}
              onClick={() => handleOrderClick(item)}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "12px",
                boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
                cursor: "pointer",
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#0F172A",
                    }}
                  >
                    {item.orderNo}
                  </Text>
                  <View style={{ marginTop: "6px" }}>
                    <Text style={{ fontSize: "13px", color: "#64748B" }}>
                      客户：{item.customerName}
                    </Text>
                  </View>
                  {activeTab === "employeeOrder" && item.employeeName && (
                    <View style={{ marginTop: "4px" }}>
                      <Text style={{ fontSize: "13px", color: "#64748B" }}>
                        员工：{item.employeeName}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    backgroundColor: `${getStatusColor(item.status)}15`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      color: getStatusColor(item.status),
                    }}
                  >
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "12px",
                  borderTop: "1px solid #F1F5F9",
                }}
              >
                <View>
                  <Text style={{ fontSize: "12px", color: "#94A3B8" }}>
                    订单金额
                  </Text>
                  <View style={{ marginTop: "4px" }}>
                    <Text
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      ¥{item.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={{ textAlign: "right" }}>
                  <Text style={{ fontSize: "12px", color: "#94A3B8" }}>
                    创建时间
                  </Text>
                  <View style={{ marginTop: "4px" }}>
                    <Text style={{ fontSize: "12px", color: "#64748B" }}>
                      {item.createTime}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
