import React, { useState } from "react";
import { View, Text, Input, Textarea, Button, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import scope from "@/utils/scope";

/**
 * 新增订单页面组件
 * 实现订单信息录入功能，包含表单验证和提交逻辑
 */
const AddOrderPage: React.FC = () => {
  // 表单状态管理
  const [formData, setFormData] = useState({
    orderNo: "", // 订单名称
    clientName: "",
    product: "", // 关联产品
    totalQuantity: "",
    unitPrice: "",
    remark: "",
  });

  // 图片状态管理
  const [images, setImages] = useState<string[]>([]); // 本地临时图片路径（用于预览）
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set()
  ); // 正在上传的图片索引
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]); // 已上传的OSS URL

  // 表单验证状态
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 表单验证
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.orderNo.trim()) {
      newErrors.orderNo = "请输入订单名称";
    }

    if (!formData.clientName.trim()) {
      newErrors.clientName = "请输入客户名称";
    }

    // if (!formData.product.trim()) {
    //   newErrors.product = "请选择关联产品";
    // }

    if (!formData.totalQuantity.trim()) {
      newErrors.totalQuantity = "请输入订单数量";
    } else if (
      isNaN(Number(formData.totalQuantity)) ||
      Number(formData.totalQuantity) <= 0
    ) {
      newErrors.totalQuantity = "请输入有效的数量";
    }

    if (!formData.unitPrice.trim()) {
      newErrors.unitPrice = "请输入单价";
    } else if (
      isNaN(Number(formData.unitPrice)) ||
      Number(formData.unitPrice) <= 0
    ) {
      newErrors.unitPrice = "请输入有效的单价";
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
        ...formData,
        productId: 123,
        statusCode: "进行中",
        pendingQuantity: formData.totalQuantity,
        totalAmount: (
          Number(formData.totalQuantity) * Number(formData.unitPrice)
        ).toFixed(2),
        orderImages: uploadedUrls, // 上传成功的OSS图片URL
      };
      console.log("提交订单数据:", submitData);

      // 使用 scope.post 方法提交订单，更简洁
      const result = await scope.post("/api/batch", {
        entity: "order",
        action: "create",
        data: submitData,
      });

      // 检查响应是否成功
      if (result.code === 200 || result.success) {
        // 提交成功后跳转回上一页
        Taro.showToast({
          title: "订单创建成功",
          icon: "success",
          duration: 2000,
        });

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          // 发送刷新信号给列表页面 - 通过全局事件中心
          Taro.eventCenter.trigger("hall:list:refresh");
          Taro.navigateBack();
        }, 2000);
      } else {
        // 业务逻辑错误
        throw new Error(result.message || "提交失败");
      }
    } catch (error) {
      console.error("提交失败:", error);
      // scope.requestWithLoadingAndPagination 已经显示了错误提示，这里可以不重复显示
      // 如果需要自定义错误提示，可以在这里添加
    } finally {
      setIsSubmitting(false);
    }
  };

  // 上传单张图片到服务器
  const uploadImage = async (filePath: string, index: number) => {
    try {
      console.log("开始上传图片:", filePath);
      const result = (await scope.uploadImage(filePath, {
        showLoading: false, // 不显示全局loading，由页面自己控制
      })) as { code: number; data: { url: string }; message?: string };

      console.log("图片上传成功:", result);

      // 保存OSS URL
      setUploadedUrls((prev) => {
        const newUrls = [...prev];
        newUrls[index] = result.data.url;
        return newUrls;
      });

      return result.data.url;
    } catch (error) {
      console.error("上传图片失败:", error);
      throw error;
    } finally {
      // 移除上传状态
      setUploadingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // 选择图片
  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 9 - images.length, // 最多9张图片
      sourceType: ["album", "camera"], // 可以选择相册或拍照
      success: async (res) => {
        const newImages = res.tempFilePaths;
        const startIndex = images.length;

        // 先添加到预览列表
        setImages((prev) => [...prev, ...newImages]);

        // 依次上传每张图片
        for (let i = 0; i < newImages.length; i++) {
          const globalIndex = startIndex + i;
          setUploadingImages((prev) => new Set(prev).add(globalIndex));

          try {
            await uploadImage(newImages[i], globalIndex);
            Taro.showToast({
              title: ` 图片上传成功`,
              icon: "success",
              duration: 1500,
            });
          } catch (error) {
            // 上传失败，移除这张图片
            setImages((prev) => prev.filter((_, idx) => idx !== globalIndex));
            setUploadedUrls((prev) =>
              prev.filter((_, idx) => idx !== globalIndex)
            );
            Taro.showToast({
              title: ` 图片上传失败`,
              icon: "error",
              duration: 2000,
            });
          }
        }
      },
      fail: (err) => {
        console.log("选择图片失败:", err);
        Taro.showToast({
          title: "选择图片失败",
          icon: "error",
          duration: 2000,
        });
      },
    });
  };

  // 删除图片
  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    setUploadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      orderNo: "",
      clientName: "",
      product: "",
      totalQuantity: "",
      unitPrice: "",
      remark: "",
    });
    setImages([]);
    setUploadedUrls([]);
    setUploadingImages(new Set());
    setErrors({});
  };

  return (
    <View
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "16px 16px 100px 16px", // 底部增加padding避免被固定按钮覆盖
        display: "flex",
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

        {/* 客户名称 */}
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
            客户名称 <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <Input
            type="text"
            placeholder="请输入客户名称"
            value={formData.clientName}
            onInput={(e) => handleInputChange("clientName", e.detail.value)}
            style={{
              width: "90%",
              height: "44px",
              border: `1px solid ${errors.clientName ? "#ef4444" : "#d1d5db"}`,
              borderRadius: "8px",
              padding: "0 12px",
              fontSize: "14px",
              backgroundColor: "#ffffff",
            }}
          />
          {errors.clientName && (
            <Text
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.clientName}
            </Text>
          )}
        </View>

        {/* 关联产品 */}
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
            关联产品 <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <View
            style={{
              width: "90%",
              height: "44px",
              border: `1px solid ${errors.product ? "#ef4444" : "#d1d5db"}`,
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              cursor: "pointer",
            }}
            onClick={() => {
              // 这里可以添加产品选择逻辑
              Taro.showToast({
                title: "产品选择功能开发中",
                icon: "none",
                duration: 2000,
              });
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                color: formData.product ? "#374151" : "#9ca3af",
                flex: 1,
              }}
            >
              {formData.product || "请选择关联产品"}
            </Text>
            <Text
              style={{
                fontSize: "14px",
                color: "#9ca3af",
              }}
            >
              ▼
            </Text>
          </View>
          {errors.product && (
            <Text
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.product}
            </Text>
          )}
        </View>

        {/* 订单数量 */}
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
            订单数量 <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
          <Input
            type="number"
            placeholder="请输入订单数量"
            value={formData.totalQuantity}
            onInput={(e) => handleInputChange("totalQuantity", e.detail.value)}
            style={{
              width: "90%",
              height: "44px",
              border: `1px solid ${
                errors.totalQuantity ? "#ef4444" : "#d1d5db"
              }`,
              borderRadius: "8px",
              padding: "0 12px",
              fontSize: "14px",
              backgroundColor: "#ffffff",
            }}
          />
          {errors.totalQuantity && (
            <Text
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.totalQuantity}
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

        {/* 总金额预览 */}
        {formData.totalQuantity && formData.unitPrice && (
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
              预计总金额：¥
              {(
                Number(formData.totalQuantity) * Number(formData.unitPrice)
              ).toFixed(2)}
            </Text>
          </View>
        )}

        {/* 图片上传 */}
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
            相关图片
          </Text>

          {/* 已选择的图片 */}
          {images.length > 0 && (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              {images.map((image, index) => (
                <View
                  key={index}
                  style={{
                    position: "relative",
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Image
                    src={image}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {/* 上传状态指示器 */}
                  {uploadingImages.has(index) && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: "10px",
                        }}
                      >
                        上传中...
                      </Text>
                    </View>
                  )}

                  {/* 上传成功指示器 */}
                  {uploadedUrls[index] && !uploadingImages.has(index) && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: "4px",
                        right: "4px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        ✓
                      </Text>
                    </View>
                  )}

                  <View
                    onClick={() => handleDeleteImage(index)}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      ×
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 上传按钮 */}
          {images.length < 9 && (
            <View
              onClick={handleChooseImage}
              style={{
                width: "80px",
                height: "80px",
                border: "2px dashed #d1d5db",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9fafb",
                cursor: "pointer",
              }}
            >
              <Text
                style={{
                  fontSize: "24px",
                  color: "#9ca3af",
                  marginBottom: "4px",
                }}
              >
                +
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  color: "#9ca3af",
                  textAlign: "center",
                }}
              >
                添加图片
              </Text>
            </View>
          )}

          <Text
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "8px",
              display: "block",
            }}
          >
            支持拍照和从相册选择，最多9张图片
          </Text>
        </View>

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
            value={formData.remark}
            onInput={(e) => handleInputChange("remark", e.detail.value)}
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
              {isSubmitting ? "提交中..." : "创建订单"}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AddOrderPage;
