import { useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type StatusType = "completed" | "processing" | "pending";

interface OrderDetail {
  id: string;
  orderNo: string;
  customerName: string;
  amount: number;
  status: StatusType;
  createTime: string;
  employeeName?: string;
  address?: string;
  phone?: string;
  remark?: string;
}

const buildOrderDetail = (payload: Partial<OrderDetail>): OrderDetail => ({
  id: payload.id || "1",
  orderNo: payload.orderNo || "ORD20240101001",
  customerName: payload.customerName || "张三",
  amount: payload.amount || 1280.0,
  status: payload.status || "completed",
  createTime: payload.createTime || "2024-01-15 10:30:00",
  employeeName: payload.employeeName,
  address: payload.address || "北京市朝阳区xxx街道xxx号",
  phone: payload.phone || "13800138000",
  remark: payload.remark || "请尽快处理",
});

export default function OrderDetail() {
  useAuthGuard();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);

  useEffect(() => {
    const instance = Taro.getCurrentInstance();
    const page: any = instance?.page;
    const eventChannel = page?.getOpenerEventChannel?.();

    const updateDetail = (detail: Partial<OrderDetail>) => {
      setOrderDetail(buildOrderDetail(detail));
    };

    if (eventChannel) {
      eventChannel.on("order:open", updateDetail);
      return () => {
        eventChannel.off?.("order:open", updateDetail);
      };
    }

    // 兜底方案：从路由参数读取
    const router = instance?.router;
    const params = router?.params || {};
    if (params.id || params.orderNo) {
      updateDetail({
        id: params.id,
        orderNo: params.orderNo
          ? decodeURIComponent(params.orderNo)
          : undefined,
      });
    } else {
      Taro.showToast({
        title: "订单信息不存在",
        icon: "none",
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }
  }, []);

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

  if (!orderDetail) {
    return (
      <View
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAFAFB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: "14px", color: "#94A3B8" }}>加载中...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAFAFB",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* 订单基本信息 */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "12px",
          boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A" }}
            >
              {orderDetail.orderNo}
            </Text>
            <View style={{ marginTop: "8px" }}>
              <Text style={{ fontSize: "14px", color: "#64748B" }}>
                创建时间：{orderDetail.createTime}
              </Text>
            </View>
          </View>
          <View
            style={{
              padding: "6px 16px",
              borderRadius: "12px",
              backgroundColor: `${getStatusColor(orderDetail.status)}15`,
            }}
          >
            <Text
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: getStatusColor(orderDetail.status),
              }}
            >
              {getStatusText(orderDetail.status)}
            </Text>
          </View>
        </View>

        <View
          style={{
            paddingTop: "16px",
            borderTop: "1px solid #F1F5F9",
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <Text style={{ fontSize: "14px", color: "#64748B" }}>订单金额</Text>
            <Text
              style={{ fontSize: "20px", fontWeight: "700", color: "#0F172A" }}
            >
              ¥{orderDetail.amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* 客户信息 */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "12px",
          boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Text
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#0F172A",
            marginBottom: "12px",
          }}
        >
          客户信息
        </Text>
        <View style={{ marginBottom: "10px" }}>
          <Text
            style={{ fontSize: "13px", color: "#64748B", marginRight: "8px" }}
          >
            客户姓名：
          </Text>
          <Text style={{ fontSize: "14px", color: "#0F172A" }}>
            {orderDetail.customerName}
          </Text>
        </View>
        {orderDetail.phone && (
          <View style={{ marginBottom: "10px" }}>
            <Text
              style={{ fontSize: "13px", color: "#64748B", marginRight: "8px" }}
            >
              联系电话：
            </Text>
            <Text style={{ fontSize: "14px", color: "#0F172A" }}>
              {orderDetail.phone}
            </Text>
          </View>
        )}
        {orderDetail.address && (
          <View>
            <Text
              style={{ fontSize: "13px", color: "#64748B", marginRight: "8px" }}
            >
              收货地址：
            </Text>
            <Text style={{ fontSize: "14px", color: "#0F172A" }}>
              {orderDetail.address}
            </Text>
          </View>
        )}
      </View>

      {/* 员工信息（如果是员工订单） */}
      {orderDetail.employeeName && (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "12px",
            boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#0F172A",
              marginBottom: "12px",
            }}
          >
            员工信息
          </Text>
          <View>
            <Text
              style={{ fontSize: "13px", color: "#64748B", marginRight: "8px" }}
            >
              负责员工：
            </Text>
            <Text style={{ fontSize: "14px", color: "#0F172A" }}>
              {orderDetail.employeeName}
            </Text>
          </View>
        </View>
      )}

      {/* 备注信息 */}
      {orderDetail.remark && (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "12px",
            boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#0F172A",
              marginBottom: "12px",
            }}
          >
            备注信息
          </Text>
          <Text
            style={{ fontSize: "14px", color: "#0F172A", lineHeight: "1.6" }}
          >
            {orderDetail.remark}
          </Text>
        </View>
      )}
    </View>
  );
}
