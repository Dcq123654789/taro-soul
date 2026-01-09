import { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";

type TabType = "order" | "employeeOrder";
type StatusType = "completed" | "processing" | "pending";

interface OrderItem {
  id: string;
  orderNo: string;
  customerName: string;
  amount: number;
  quantity: number; // 订单数量
  status: StatusType;
  createTime: string;
  employeeName?: string;
}

export default function Hall() {
  const scopeRef = (globalThis as any)?.scope;
  const [activeTab, setActiveTab] = useState<TabType>("order");
  const [activeStatus, setActiveStatus] = useState<StatusType>("completed");

  const [orderData, setOrderData] = useState<OrderItem[]>([]);
  const [employeeOrderData, setEmployeeOrderData] = useState<OrderItem[]>([]);
  // 保存原始服务器数据，用于传递给详情页面
  const [rawOrderData, setRawOrderData] = useState<any[]>([]);
  const [rawEmployeeOrderData, setRawEmployeeOrderData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
    // 处理嵌套的 content 结构
    if (res.data && Array.isArray(res.data.content)) return res.data.content;
    return [];
  };

  /*
    状态值标准化函数：将后端返回的状态码转换为前端定义的三种状态类型
    生成逻辑：根据 statusCode 字段的值进行状态映射
    依赖技术：TypeScript 类型断言、条件判断
  */
  const normalizeStatus = (statusCode: string): StatusType => {
    const statusMap: Record<string, StatusType> = {
      已完成: "completed",
      进行中: "processing",
      待派发: "pending",
      待确认: "pending",
      已确认: "processing",
      生产中: "processing",
      已审批: "processing",
      // 添加一些可能的其他状态值
      completed: "completed",
      processing: "processing",
      pending: "pending",
    };
    const result = statusMap[statusCode] || "pending";
    return result;
  };

  /*
    数据转换函数：将后端API数据转换为前端OrderItem格式
    生成逻辑：字段映射、数据类型转换、计算总价等
    依赖技术：对象解构、类型断言、数学运算
  */
  const transformOrderData = (rawData: any[]): OrderItem[] => {
    return rawData.map((item: any) => ({
      id: item._id || item.id || "",
      orderNo: item.orderNo || "",
      customerName: item.clientName || "",
      amount: (item.unitPrice || 0) * (item.totalQuantity || 0),
      quantity: item.totalQuantity || 0, // 订单数量
      status: normalizeStatus(item.statusCode || ""),
      createTime: scope.formatDateTime(item.createTime || ""),
      employeeName: item.employeeName,
    }));
  };

  /*
    员工订单数据转换函数：将后端员工订单API数据转换为前端OrderItem格式
    生成逻辑：根据员工订单特有的字段结构进行映射转换，支持关联查询的员工信息
    依赖技术：对象解构、类型断言、关联数据处理等
  */
  const transformEmployeeOrderData = (
    rawData: any[],
    employees: any[] = []
  ): OrderItem[] => {
    return rawData.map((item: any) => {
      // 从关联查询结果中获取员工姓名，优先使用关联的employee对象
      let employeeName = "未知员工";
      if (item.employee && typeof item.employee === "object") {
        // 如果有关联查询的employee对象
        employeeName = item.employee.name || "未知员工";
      } else if (employees.length > 0) {
        // 备用：根据employeeId查找员工姓名
        const employee = employees.find(
          (emp) => emp._id === item.employeeId || emp.id === item.employeeId
        );
        employeeName = employee ? employee.name : "未知员工";
      } else if (item.employeeName) {
        // 如果API直接返回了employeeName字段
        employeeName = item.employeeName;
      }

      return {
        id: item._id || item.id || "",
        orderNo: item.orderName || "", // 员工订单使用orderName作为订单号显示
        customerName: item.orderName || "", // 员工订单显示订单名称作为客户信息
        amount: item.totalAmount || 0, // 员工订单直接使用totalAmount
        quantity: item.assignedQuantity || 0, // 员工订单使用assignedQuantity
        status: normalizeStatus(item.statusCode || ""),
        createTime: scope.formatDateTime(item.createTime || ""),
        employeeName: employeeName, // 显示负责员工姓名
      };
    });
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
      setLoading(true);
      const batchUrl = joinUrl(apiBaseUrl, "/api/batch");

      // 查询订单数据 (entity: "order")
      const orderRes = await scopeRef.requestWithLoadingAndPagination(
        batchUrl,
        {
          entity: "order",
          action: "query",
        },
        {
          method: "POST",
          paramType: "body",
        }
      );
      const orderRemoteList = safeExtractList(orderRes);
      const transformedOrderData = transformOrderData(orderRemoteList);
      setOrderData(transformedOrderData);
      setRawOrderData(orderRemoteList); // 保存原始数据

      // 查询员工订单数据 (entity: "work_order") - 关联查询员工信息
      const employeeOrderRes = await scopeRef.requestWithLoadingAndPagination(
        batchUrl,
        {
          entity: "work_order",
          action: "query",
          fetch: ["employee"], // 关联查询员工信息
        },
        {
          method: "POST",
          paramType: "body",
        }
      );
      const employeeOrderRemoteList = safeExtractList(employeeOrderRes);
      const transformedEmployeeOrderData = transformEmployeeOrderData(
        employeeOrderRemoteList,
        [] // 不需要单独的员工列表，因为已经在关联查询中获取
      );
      setEmployeeOrderData(transformedEmployeeOrderData);
      setRawEmployeeOrderData(employeeOrderRemoteList); // 保存原始数据
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "请求失败，请稍后重试";
      Taro.showToast({
        title: message,
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  }, [scopeRef]);

  useEffect(() => {
    if (scopeRef) {
      fetchData();
    }
  }, [fetchData, scopeRef]);

  // 使用页面生命周期监听页面显示事件
  useEffect(() => {
    // 创建一个标记来避免重复调用
    let refreshTimeout: NodeJS.Timeout;

    const refreshData = () => {
      if (scopeRef && !refreshTimeout) {
        refreshTimeout = setTimeout(() => {
          fetchData();
          refreshTimeout = null as any;
        }, 300); // 防抖，避免频繁调用
      }
    };

    // 监听页面显示事件（Taro 3.x 的方式）
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];

    // 为当前页面实例添加刷新方法
    if (currentPage) {
      (currentPage as any).refreshListData = refreshData;
    }

    // 监听自定义事件（从新增页面发来的刷新信号）
    Taro.eventCenter.on("hall:list:refresh", refreshData);

    return () => {
      Taro.eventCenter.off("hall:list:refresh", refreshData);
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [scopeRef, fetchData]);

  // 切换头部导航栏时重置子导航栏状态
  useEffect(() => {
    if (activeTab === "employeeOrder" && activeStatus === "pending") {
      // 员工订单没有"待派发"状态，重置为"已完成"
      setActiveStatus("completed");
    }
  }, [activeTab, activeStatus]);

  // 在组件挂载时，如果 scopeRef 还不可用，也尝试获取数据

  /*
    生成逻辑：利用 useCallback 封装批量查询函数，依赖全局 scope 对象调用 requestWithLoadingAndPagination，并在 useEffect 中首屏触发；通过 safeExtractList 兼容不同返回结构。
    依赖技术：React Hooks（useState/useCallback/useEffect）、Taro API、全局 scope 工具。
  */

  // 根据当前选中的tab和status过滤数据
  const filteredData = useMemo(() => {
    const data = activeTab === "order" ? orderData : employeeOrderData;
    const filtered = data.filter((item) => item.status === activeStatus);
    return filtered;
  }, [activeTab, activeStatus, orderData, employeeOrderData]);

  const getStatusText = (status: StatusType) => {
    // 根据当前选中的tab返回不同的状态文本
    if (activeTab === "order") {
      const map = {
        completed: "已完成",
        processing: "进行中",
        pending: "已取货",
      };
      return map[status];
    } else {
      // 员工订单
      const map = {
        completed: "已完成",
        processing: "进行中",
        pending: "待派发", // 虽然不显示，但保留以防万一
      };
      return map[status];
    }
  };

  const getStatusColor = (status: StatusType) => {
    const map = {
      completed: "#10B981",
      processing: "#3B82F6",
      pending: "#F59E0B",
    };
    return map[status];
  };

  // 处理新增按钮点击事件
  const handleAddNew = () => {
    if (activeTab === "order") {
      // 跳转到新增订单页面
      Taro.navigateTo({
        url: "/pages/hall/add-order/index",
      });
    } else if (activeTab === "employeeOrder") {
      // 跳转到新增员工订单页面
      Taro.navigateTo({
        url: "/pages/hall/add-employee-order/index",
      });
    }
  };

  // 跳转到订单详情页
  const handleOrderClick = (item: OrderItem) => {
    // 根据当前标签页获取对应的原始数据
    const rawData = activeTab === "order" ? rawOrderData : rawEmployeeOrderData;
    // 通过ID找到对应的原始服务器数据
    const rawOrderItem = rawData.find(
      (rawItem) => rawItem._id === item.id || rawItem.id === item.id
    );

    Taro.navigateTo({
      url: "/pages/order-detail/index",
      success: (res) => {
        // 传递完整的原始服务器数据
        res.eventChannel?.emit("order:open", rawOrderItem || item);
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 状态按钮组 */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
          }}
        >
          {/* 根据当前tab显示不同的状态按钮 */}
          {(activeTab === "order"
            ? ["completed", "processing", "pending"]
            : ["completed", "processing"]
          ).map((status) => (
            <View
              key={status}
              onClick={() => setActiveStatus(status as StatusType)}
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
                {getStatusText(status as StatusType)}
              </Text>
            </View>
          ))}
        </View>

        {/* 新增按钮 */}
        <View
          onClick={() => handleAddNew()}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            backgroundColor: "#10B981",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            新增
          </Text>
        </View>
      </View>

      {/* 订单列表 */}
      <View style={{ padding: "16px" }}>
        {loading ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <Text style={{ fontSize: "14px", color: "#94A3B8" }}>
              数据加载中...123
            </Text>
          </View>
        ) : filteredData.length === 0 ? (
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
              {/* 根据标签页显示不同的内容 */}
              {activeTab === "order" ? (
                // 订单列表 - 美化布局
                <>
                  {/* 头部区域：订单号和状态 */}
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      {item.orderNo}
                    </Text>
                    <View
                      style={{
                        padding: "6px 12px",
                        borderRadius: "16px",
                        backgroundColor: `${getStatusColor(item.status)}15`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: getStatusColor(item.status),
                        }}
                      >
                        {getStatusText(item.status)}
                      </Text>
                    </View>
                  </View>

                  {/* 主要信息区域 */}
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      padding: "12px",
                      backgroundColor: "#F8FAFC",
                      borderRadius: "8px",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ marginBottom: "8px" }}>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#64748B",
                            marginBottom: "4px",
                          }}
                        >
                          客户信息
                        </Text>
                        <Text
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#0F172A",
                          }}
                        >
                          {item.customerName}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#64748B",
                            marginBottom: "4px",
                          }}
                        >
                          订单数量
                        </Text>
                        <Text
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#0F172A",
                          }}
                        >
                          {item.quantity} 件
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 底部信息区域 */}
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "12px",
                      borderTop: "1px solid #E2E8F0",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#64748B",
                          marginBottom: "4px",
                        }}
                      >
                        订单金额
                      </Text>
                      <Text
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#10B981",
                        }}
                      >
                        ¥{item.amount.toFixed(2)}
                      </Text>
                    </View>
                    <View style={{ textAlign: "right" }}>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#64748B",
                          marginBottom: "4px",
                        }}
                      >
                        创建时间
                      </Text>
                      <Text
                        style={{
                          fontSize: "13px",
                          color: "#374151",
                          fontWeight: "500",
                        }}
                      >
                        {item.createTime}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                // 员工订单列表 - 美化布局
                <>
                  {/* 头部区域：订单号和状态 */}
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      {item.orderNo}
                    </Text>
                    <View
                      style={{
                        padding: "6px 12px",
                        borderRadius: "16px",
                        backgroundColor: `${getStatusColor(item.status)}15`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: getStatusColor(item.status),
                        }}
                      >
                        {getStatusText(item.status)}
                      </Text>
                    </View>
                  </View>

                  {/* 主要信息区域 */}
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      padding: "12px",
                      backgroundColor: "#F8FAFC",
                      borderRadius: "8px",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ marginBottom: "12px" }}>
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#64748B",
                            marginBottom: "4px",
                          }}
                        >
                          任务名称
                        </Text>
                        <Text
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#0F172A",
                          }}
                        >
                          {item.customerName}
                        </Text>
                      </View>
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "16px",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: "12px",
                              color: "#64748B",
                              marginBottom: "4px",
                            }}
                          >
                            订单数量
                          </Text>
                          <Text
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#0F172A",
                            }}
                          >
                            {item.quantity} 件
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: "12px",
                              color: "#64748B",
                              marginBottom: "4px",
                            }}
                          >
                            负责员工
                          </Text>
                          <Text
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#0F172A",
                            }}
                          >
                            {item.employeeName}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* 底部信息区域 */}
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "12px",
                      borderTop: "1px solid #E2E8F0",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#64748B",
                          marginBottom: "4px",
                        }}
                      >
                        订单金额
                      </Text>
                      <Text
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#10B981",
                        }}
                      >
                        ¥{item.amount.toFixed(2)}
                      </Text>
                    </View>
                    <View style={{ textAlign: "right" }}>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#64748B",
                          marginBottom: "4px",
                        }}
                      >
                        创建时间
                      </Text>
                      <Text
                        style={{
                          fontSize: "13px",
                          color: "#374151",
                          fontWeight: "500",
                        }}
                      >
                        {item.createTime}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}
