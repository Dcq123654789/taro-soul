import { useEffect, useState } from "react";
import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type StatusType = "completed" | "processing" | "pending";

// 根据API实际返回数据结构定义接口
interface OrderDetail {
  _id: string;
  orderNo: string;
  clientName: string; // API返回的是clientName
  productId: string;
  totalQuantity: number;
  unitPrice: number;
  totalAmount: number;
  status: number;
  statusCode: string;
  createTime: string;
  updateTime: string;
  dueDate: string | null;
  finishedQuantity: number | null;
  remark: string;
  orderImages: string[];
  tenantId: string | null;
  version: number;
  new: boolean;
}

// 将API状态码转换为前端状态类型
const normalizeStatus = (statusCode: string): StatusType => {
  const statusMap: Record<string, StatusType> = {
    已完成: "completed",
    进行中: "processing",
    待派发: "pending",
    待确认: "pending",
    已确认: "processing",
    生产中: "processing",
    已审批: "processing",
  };
  return statusMap[statusCode] || "pending";
};

// 构建订单详情数据（兼容旧数据和新API数据）
const buildOrderDetail = (payload: any): OrderDetail => ({
  _id: payload._id || payload.id || "",
  orderNo: payload.orderNo || "未知订单",
  clientName: payload.clientName || payload.customerName || "未知客户",
  productId: payload.productId || "",
  totalQuantity: payload.totalQuantity || 0,
  unitPrice: payload.unitPrice || 0,
  totalAmount: payload.totalAmount || 0,
  status: payload.status || 0,
  statusCode: payload.statusCode || "未知状态",
  createTime: payload.createTime || "",
  updateTime: payload.updateTime || "",
  dueDate: payload.dueDate || null,
  finishedQuantity: payload.finishedQuantity || null,
  remark: payload.remark || "",
  orderImages: payload.orderImages || [],
  tenantId: payload.tenantId || null,
  version: payload.version || 0,
  new: payload.new || false,
});

export default function OrderDetail() {
  useAuthGuard();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false);

  console.log(orderDetail, "wqwq");

  // 图片预览功能
  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImage("");
  };

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
        _id: params.id,
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

  const getStatusColor = (status: StatusType) => {
    const map = {
      completed: "#10B981",
      processing: "#3B82F6",
      pending: "#F59E0B",
    };
    return map[status];
  };

  // 获取状态类型（用于显示）
  const getOrderStatus = (): StatusType => {
    return normalizeStatus(orderDetail!.statusCode);
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
      {/* 订单基本信息和金额信息合并 */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px", // 增加间距
          boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
        }}
      >
        {/* 订单头部 */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: "20px", fontWeight: "700", color: "#0F172A" }}
            >
              {orderDetail.orderNo}
            </Text>
            <View style={{ marginTop: "8px" }}>
              <Text style={{ fontSize: "14px", color: "#64748B" }}>
                创建时间：{scope.formatDateTime(orderDetail.createTime)}
              </Text>
            </View>
          </View>
          <View
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: `${getStatusColor(getOrderStatus())}15`,
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: getStatusColor(getOrderStatus()),
              }}
            >
              {orderDetail.statusCode}
            </Text>
          </View>
        </View>

        {/* 订单金额信息 */}
        <View
          style={{
            backgroundColor: "#F8FAFC",
            borderRadius: "8px",
          }}
        >
          <Text
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#0F172A",
            }}
          >
            订单信息
          </Text>

          <View style={{ marginBottom: "12px", padding: "24px" }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  color: "#64748B",
                  marginRight: "8px",
                }}
              >
                客户姓名：
              </Text>
              <Text style={{ fontSize: "14px", color: "#0F172A" }}>
                {orderDetail.clientName}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  color: "#64748B",
                  marginRight: "8px",
                }}
              >
                产品ID：
              </Text>
              <Text style={{ fontSize: "14px", color: "#0F172A" }}>
                {orderDetail.productId || "未指定"}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <Text style={{ fontSize: "14px", color: "#64748B" }}>
                订单数量
              </Text>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#0F172A",
                  fontWeight: "500",
                }}
              >
                {orderDetail.totalQuantity} 件
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <Text style={{ fontSize: "14px", color: "#64748B" }}>单价</Text>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#0F172A",
                  fontWeight: "500",
                }}
              >
                ¥{orderDetail.unitPrice.toFixed(2)}
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: "20px",
                borderTop: "1px solid #E2E8F0",
              }}
            >
              <Text
                style={{
                  fontSize: "16px",
                  color: "#0F172A",
                  fontWeight: "600",
                }}
              >
                总金额
              </Text>
              <Text
                style={{
                  fontSize: "20px",
                  color: "#10B981",
                  fontWeight: "700",
                }}
              >
                ¥{orderDetail.totalAmount.toFixed(2)}
              </Text>
            </View>

            {orderDetail.finishedQuantity !== null && (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <Text style={{ fontSize: "14px", color: "#64748B" }}>
                  已完成数量1
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#3B82F6",
                    fontWeight: "500",
                  }}
                >
                  {orderDetail.finishedQuantity} 件
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 订单图片 */}
      {orderDetail.orderImages && orderDetail.orderImages.length > 0 && (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px", // 增加间距
            boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Text
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#0F172A",
            }}
          >
            订单图片 ({orderDetail.orderImages.length})
          </Text>
          <View
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "12px", // 增加图片间距
            }}
          >
            {orderDetail.orderImages.map((imageUrl, index) => (
              <View
                key={index}
                onClick={() => handleImagePreview(imageUrl)}
                style={{
                  width: "120px", // 稍微增大切片尺寸
                  height: "120px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #E2E8F0",
                  cursor: "pointer",
                }}
              >
                <Image
                  src={imageUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  mode="aspectFill"
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 备注信息 */}
      {orderDetail.remark && (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px", // 增加间距
            boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Text
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#0F172A",
              marginBottom: "16px",
            }}
          >
            备注信息
          </Text>
          <View
            style={{
              backgroundColor: "#F8FAFC",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <Text
              style={{ fontSize: "14px", color: "#0F172A", lineHeight: "1.6" }}
            >
              {orderDetail.remark}
            </Text>
          </View>
        </View>
      )}

      {/* 图片预览弹窗 */}
      {showImagePreview && (
        <View
          onClick={closeImagePreview}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={previewImage}
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
              mode="aspectFit"
            />
            <View
              onClick={closeImagePreview}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: "18px" }}>×</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
