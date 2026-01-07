import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Input,
  Textarea,
  Button,
  Picker,
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import scope from "@/utils/scope";

// 员工数据类型
interface WorkshopUser {
  _id: string;
  name: string;
  role: string;
  [key: string]: any;
}

// 订单数据类型
interface Order {
  _id: string;
  orderNo: string;
  clientName: string;
  totalQuantity: number;
  pendingQuantity: number; // 待分配数量
  unitPrice: number;
  totalAmount: number;
  status: string;
  [key: string]: any;
}

/**
 * 新增员工订单页面组件
 * 实现员工订单信息录入功能，包含员工选择、表单验证和提交逻辑
 */
const AddEmployeeOrderPage: React.FC = () => {
  // 表单状态管理
  const [formData, setFormData] = useState({
    // 订单选择相关
    selectedOrderId: "",
    selectedOrder: null as any,

    // 员工订单特有字段
    orderNo: "",
    allocatedQuantity: "",
    unitPrice: "", // 继承自原订单
    employeeId: "",
    employeeName: "",
    notes: "",
  });

  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]); // 已上传的OSS URL

  // 订单选择器相关状态
  const [orderRange, setOrderRange] = useState<string[]>([]);
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);

  // 员工选择器相关状态
  const [employeeRange, setEmployeeRange] = useState<string[]>([]);
  const [employeeIndex, setEmployeeIndex] = useState<number>(0);
  const [employees, setEmployees] = useState<WorkshopUser[]>([]);

  // 表单验证状态
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 调试函数 - 检查BASE_URL

  // 数据提取辅助函数
  const safeExtractList = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.records)) return res.records;
    if (Array.isArray(res.list)) return res.list;
    // 处理嵌套的 content 结构
    if (res.data && Array.isArray(res.data.content)) return res.data.content;
    return [];
  };

  // 获取员工列表（WorkshopUser实体，筛选role为员工）
  const fetchEmployees = async () => {
    try {
      const result = await scope.requestWithLoadingAndPagination(
        "/api/batch",
        {
          entity: "workshop_user",
          action: "query",
          // 添加筛选条件：role 为员工
          conditions: {
            role: "员工",
          },
        },
        {
          method: "POST",
          paramType: "body",
        }
      );

      const employeeList = safeExtractList(result);
      setEmployees(employeeList);
      setEmployeeRange(employeeList.map((emp: WorkshopUser) => emp.username));
    } catch (error) {
      console.error("获取员工列表失败:", error);
      Taro.showToast({
        title: "获取员工列表失败",
        icon: "none",
        duration: 2000,
      });
    }
  };

  // 获取订单列表（order实体）
  const fetchOrders = async () => {
    try {
      const result = await scope.requestWithLoadingAndPagination(
        "/api/batch",
        {
          entity: "order",
          action: "query",
        },
        {
          method: "POST",
          paramType: "body",
        }
      );

      const orderList = safeExtractList(result);
      setOrders(orderList);
      setOrderRange(
        orderList.map(
          (order: Order) => `${order.orderNo} (${order.clientName})`
        )
      );
    } catch (error) {
      console.error("获取订单列表失败:", error);
      Taro.showToast({
        title: "获取订单列表失败",
        icon: "none",
        duration: 2000,
      });
    }
  };

  // 初始化数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        await Promise.all([fetchEmployees(), fetchOrders()]);
      } catch (error) {
        console.error("初始化数据失败:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []);

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 清除对应字段的错误信息
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // 处理订单选择
  const handleOrderChange = (e: any) => {
    const index = e.detail.value;
    const selectedOrder = orders[index];

    if (!selectedOrder) return;

    setOrderIndex(index);
    setFormData((prev) => ({
      ...prev,
      selectedOrderId: selectedOrder._id,
      selectedOrder: selectedOrder,
      orderNo: `${selectedOrder.orderNo}-员工任务`, // 自动生成订单名称
      // unitPrice 由用户单独输入，不自动继承
    }));

    // 清除订单选择错误
    if (errors.selectedOrderId) {
      setErrors((prev) => ({
        ...prev,
        selectedOrderId: "",
      }));
    }
  };

  // 处理员工选择
  const handleEmployeeChange = (e: any) => {
    const index = e.detail.value;
    const selectedEmployee = employees[index];

    if (!selectedEmployee) return;

    setEmployeeIndex(index);
    setFormData((prev) => ({
      ...prev,
      employeeId: selectedEmployee._id,
      employeeName: selectedEmployee.username,
    }));

    // 清除员工选择错误
    if (errors.employeeId) {
      setErrors((prev) => ({
        ...prev,
        employeeId: "",
      }));
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.selectedOrderId) {
      newErrors.selectedOrderId = "请选择要分配的订单";
    }

    if (!formData.orderNo.trim()) {
      newErrors.orderNo = "请输入订单名称";
    }

    if (!formData.allocatedQuantity.trim()) {
      newErrors.allocatedQuantity = "请输入分配数量";
    } else if (
      isNaN(Number(formData.allocatedQuantity)) ||
      Number(formData.allocatedQuantity) <= 0
    ) {
      newErrors.allocatedQuantity = "请输入有效的分配数量";
    } else if (
      formData.selectedOrder &&
      Number(formData.allocatedQuantity) >
        formData.selectedOrder.pendingQuantity
    ) {
      const maxQuantity = formData.selectedOrder.pendingQuantity;
      newErrors.allocatedQuantity = `分配数量不能超过待分配数量 (${maxQuantity})`;
    }

    if (!formData.unitPrice.trim()) {
      newErrors.unitPrice = "请输入单价";
    } else if (
      isNaN(Number(formData.unitPrice)) ||
      Number(formData.unitPrice) <= 0
    ) {
      newErrors.unitPrice = "请输入有效的单价";
    }

    if (!formData.employeeId) {
      newErrors.employeeId = "请选择负责员工";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 这里添加提交逻辑，包含上传的图片URL
      const submitData = {
        orderId: formData.selectedOrderId,
        employeeId: formData.employeeId,
        assignedQuantity: Number(formData.allocatedQuantity),
        statusCode: "进行中",
        remark: formData.notes,
        unitPrice: Number(formData.unitPrice),
        totalAmount:
          Number(formData.allocatedQuantity) * Number(formData.unitPrice),
        orderName: formData.orderNo,
      };
      console.log("提交员工订单数据:", submitData);

      // 创建work_order记录
      const createResult = await scope.post("/api/batch", {
        entity: "work_order",
        action: "create",
        data: submitData,
      });

      // 检查创建work_order是否成功
      if (createResult.code === 200 || createResult.success) {
        // 更新order实体的pendingQuantity
        const allocatedQuantity = Number(formData.allocatedQuantity);
        const newPendingQuantity =
          formData.selectedOrder.pendingQuantity - allocatedQuantity;

        const updateResult = await scope.post("/api/batch", {
          entity: "order",
          action: "update",
          id: formData.selectedOrderId,
          data: {
            pendingQuantity: newPendingQuantity,
          },
        });

        if (updateResult.code === 200 || updateResult.success) {
          // 提交成功后跳转回上一页
          Taro.showToast({
            title: "员工任务创建成功",
            icon: "success",
            duration: 2000,
          });

          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            Taro.navigateBack();
          }, 2000);
        } else {
          // order更新失败，回滚work_order记录（这里可以根据实际需求决定是否需要回滚）
          console.error("更新订单pendingQuantity失败:", updateResult);
          Taro.showToast({
            title: "更新订单失败，请重试",
            icon: "error",
            duration: 2000,
          });
        }
      } else {
        // work_order创建失败
        console.error("创建work_order失败:", createResult);
        Taro.showToast({
          title: "创建任务失败，请重试",
          icon: "error",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("提交失败:", error);
      Taro.showToast({
        title: "提交失败，请重试",
        icon: "error",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      selectedOrderId: "",
      selectedOrder: null,
      orderNo: "",
      allocatedQuantity: "",
      unitPrice: "",
      employeeId: "",
      employeeName: "",
      notes: "",
    });
    setUploadedUrls([]);
    setOrderIndex(0);
    setEmployeeIndex(0);
    setErrors({});
  };

  // 加载状态
  if (isLoadingData) {
    return (
      <View
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: "14px", color: "#94A3B8" }}>
          数据加载中...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "16px 16px 100px 16px", // 底部增加padding避免被固定按钮覆盖
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 表单区域 */}
      <View
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
          width: "90%",
          maxWidth: "400px",
        }}
      >
        {/* 选择订单 */}
        <View style={{ marginBottom: "20px" }}>
          <Text
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            选择订单 <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <Picker
            mode="selector"
            range={orderRange}
            value={orderIndex}
            onChange={handleOrderChange}
          >
            <View
              style={{
                width: "90%",
                height: "44px",
                border: `1px solid ${
                  errors.selectedOrderId ? "#ef4444" : "#d1d5db"
                }`,
                borderRadius: "8px",
                padding: "0 12px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: "14px",
                  color: formData.selectedOrder ? "#374151" : "#9ca3af",
                }}
              >
                {formData.selectedOrder
                  ? `${formData.selectedOrder.orderNo} (${formData.selectedOrder.clientName})`
                  : "请选择要分配的订单"}
              </Text>
              <Text style={{ fontSize: "12px", color: "#9ca3af" }}>▼</Text>
            </View>
          </Picker>
          {errors.selectedOrderId && (
            <Text
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.selectedOrderId}
            </Text>
          )}
        </View>

        {/* 订单信息展示 */}
        {formData.selectedOrder && (
          <View
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #0ea5e9",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#0c4a6e",
                marginBottom: "8px",
              }}
            >
              订单信息
            </Text>
            <View style={{ marginBottom: "6px" }}>
              <Text style={{ fontSize: "13px", color: "#64748B" }}>
                待分配数量: {formData.selectedOrder.pendingQuantity || 0} 件
              </Text>
            </View>
            <View style={{ marginBottom: "6px" }}>
              <Text style={{ fontSize: "13px", color: "#64748B" }}>
                单价: ¥{Number(formData.selectedOrder.unitPrice).toFixed(2)}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: "13px", color: "#64748B" }}>
                总金额: ¥{Number(formData.selectedOrder.totalAmount).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* 订单名称 */}
        <View style={{ marginBottom: "20px" }}>
          <Text
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            订单名称 <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <Input
            type="text"
            placeholder="请输入订单名称"
            value={formData.orderNo}
            onInput={(e) => handleInputChange("orderNo", e.detail.value)}
            style={{
              width: "90%",
              height: "44px",
              border: `1px solid ${errors.orderNo ? "#ef4444" : "#d1d5db"}`,
              borderRadius: "8px",
              padding: "0 12px",
              fontSize: "14px",
              backgroundColor: "#ffffff",
            }}
          />
          {errors.orderNo && (
            <Text
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.orderNo}
            </Text>
          )}
        </View>

        {/* 分配数量 */}
        <View style={{ marginBottom: "20px" }}>
          <Text
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            分配数量 <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <Input
            type="number"
            placeholder="请输入分配给员工的数量"
            value={formData.allocatedQuantity}
            onInput={(e) =>
              handleInputChange("allocatedQuantity", e.detail.value)
            }
            style={{
              width: "90%",
              height: "44px",
              border: `1px solid ${
                errors.allocatedQuantity ? "#ef4444" : "#d1d5db"
              }`,
              borderRadius: "8px",
              padding: "0 12px",
              fontSize: "14px",
              backgroundColor: "#ffffff",
            }}
          />
          {errors.allocatedQuantity && (
            <Text
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.allocatedQuantity}
            </Text>
          )}
          {formData.selectedOrder && (
            <Text
              style={{
                fontSize: "12px",
                color: "#64748B",
                marginTop: "4px",
                display: "block",
              }}
            >
              待分配数量: {formData.selectedOrder.pendingQuantity || 0} 件
            </Text>
          )}
        </View>

        {/* 负责员工 */}
        <View style={{ marginBottom: "20px" }}>
          <Text
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            负责员工 <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <Picker
            mode="selector"
            range={employeeRange}
            value={employeeIndex}
            onChange={handleEmployeeChange}
          >
            <View
              style={{
                width: "90%",
                height: "44px",
                border: `1px solid ${
                  errors.employeeId ? "#ef4444" : "#d1d5db"
                }`,
                borderRadius: "8px",
                padding: "0 12px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: "14px",
                  color: formData.employeeName ? "#374151" : "#9ca3af",
                }}
              >
                {formData.employeeName || "请选择负责员工"}
              </Text>
              <Text style={{ fontSize: "12px", color: "#9ca3af" }}>▼</Text>
            </View>
          </Picker>
          {errors.employeeId && (
            <Text
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.employeeId}
            </Text>
          )}
        </View>

        {/* 单价 */}
        <View style={{ marginBottom: "20px" }}>
          <Text
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            单价（元） <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <Input
            type="digit"
            placeholder="请输入单价"
            value={formData.unitPrice}
            onInput={(e) => handleInputChange("unitPrice", e.detail.value)}
            style={{
              width: "90%",
              height: "44px",
              border: `1px solid ${errors.unitPrice ? "#ef4444" : "#d1d5db"}`,
              borderRadius: "8px",
              padding: "0 12px",
              fontSize: "14px",
              backgroundColor: "#ffffff",
            }}
          />
          {errors.unitPrice && (
            <Text
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.unitPrice}
            </Text>
          )}
        </View>

        {/* 分配金额预览 */}
        {formData.allocatedQuantity && formData.unitPrice && (
          <View
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                color: "#166534",
                textAlign: "center",
                display: "block",
              }}
            >
              预计分配金额：¥
              {(
                Number(formData.allocatedQuantity) * Number(formData.unitPrice)
              ).toFixed(2)}
            </Text>
          </View>
        )}
        {/* 备注 */}
        <View style={{ marginBottom: "24px" }}>
          <Text
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
              display: "block",
            }}
          >
            备注信息
          </Text>
          <Textarea
            placeholder="请输入备注信息（可选）"
            value={formData.notes}
            onInput={(e) => handleInputChange("notes", e.detail.value)}
            style={{
              width: "90%",
              height: "80px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              backgroundColor: "#ffffff",
              lineHeight: "1.5",
            }}
          />
        </View>
      </View>

      {/* 固定在底部的操作按钮 */}
      <View
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#ffffff",
          padding: "16px",
          borderTop: "1px solid #e5e7eb",
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <View style={{ flex: 1 }}>
            <Button
              onClick={handleReset}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "8px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "600",
                border: "1px solid #d1d5db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              disabled={isSubmitting}
            >
              重置
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              onClick={handleSubmit}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "8px",
                backgroundColor: isSubmitting ? "#9ca3af" : "#10b981",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "提交中..." : "创建员工任务"}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AddEmployeeOrderPage;
