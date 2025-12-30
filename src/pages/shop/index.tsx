import { useEffect, useMemo, useState } from "react";
import { View, Text, Input, Image } from "@tarojs/components";
import scope from "@/utils/scope";

interface MaterialItem {
  id: string;
  name: string;
  code: string;
  specification: string;
  unit: string;
  currentStock: number;
  minStock: number;
  cover: string;
  description?: string;
  createTime: string;
  updateTime: string;
  status: number;
  isNew: boolean;
}

export default function MaterialLibrary() {
  const [materialList, setMaterialList] = useState<MaterialItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("组件渲染，当前状态:", {
    materialList: materialList.length,
    keyword,
    loading,
  });

  // 页面显示时重新加载数据：从后端/数据库请求面料列表
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      // 根据你后端接口实际结构调整参数

      const res = await scope.requestWithLoadingAndPagination(
        "/api/batch",
        {
          entity: "material", // 使用 props 中的 entity
          action: "query",
        },
        {
          method: "POST",
          paramType: "body", // 参数会放在 URL 查询字符串中
        }
      );

      console.log("完整的API响应:", res);
      console.log("res.data:", res?.data);

      // 后端返回的分页数据，实际内容在 data.content 中
      const paginationData = res?.data || {};
      console.log("分页数据:", paginationData);

      const list = (paginationData.content || []) as any[];
      console.log("内容列表:", list);
      console.log("列表长度:", list.length);

      const mapped: MaterialItem[] = list.map((item) => ({
        id: item._id || item.id || "",
        name: item.name || "",
        code: item.code || "",
        specification: item.specification || "",
        unit: item.unit || "",
        currentStock: item.currentStock || 0,
        minStock: item.minStock || 0,
        cover:
          item.avatar ||
          "https://cdn.jsdelivr.net/gh/ihommani/assets/cloth-cotton.jpg",
        description: item.description || "",
        createTime: item.createTime || "",
        updateTime: item.updateTime || "",
        status: item.status || 1,
        isNew: item.new || false,
      }));

      console.log("映射后的数据:", mapped);
      console.log("映射数据长度:", mapped.length);

      setMaterialList(mapped);
      console.log("已设置 materialList");
    } catch (error) {
      console.error("加载面料列表失败", error);
      // 可以按需增加错误提示
    } finally {
      setLoading(false);
    }
  };

  // 页面首次加载时请求数据
  useEffect(() => {
    fetchMaterials();
  }, []);

  // 每次页面显示时都重新请求数据（解决tabBar页面缓存问题）
  // useDidShow(() => {
  //   fetchMaterials();
  // });

  const filteredList = useMemo(() => {
    if (!keyword.trim()) {
      console.log("无搜索关键词，返回完整列表");
      return materialList;
    }
    const searchTerm = keyword.trim().toLowerCase();
    console.log("搜索关键词:", searchTerm);
    const result = materialList.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.code.toLowerCase().includes(searchTerm) ||
        item.specification.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
    );
    return result;
  }, [keyword, materialList]);

  return (
    <View
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "20px 16px 40px",
        boxSizing: "border-box",
      }}
    >
      <View
        style={{
          marginBottom: "24px",
          backgroundColor: "#FFFFFF",
          borderRadius: "999px",
          padding: "10px 16px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Text
          style={{ fontSize: "14px", color: "#94A3B8", marginRight: "8px" }}
        >
          🔍
        </Text>
        <Input
          type="text"
          placeholder="搜索材料名称、编码、规格或描述"
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
          style={{
            flex: 1,
            height: "24px",
            fontSize: "14px",
            color: "#0F172A",
          }}
        />
      </View>

      {/* 列表区域 */}
      <View
        style={
          {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "14px",
          } as any
        }
      >
        {loading && materialList.length === 0 ? (
          <Text style={{ fontSize: "14px", color: "#94A3B8" }}>加载中...</Text>
        ) : (
          filteredList.map((item) => (
            <View
              key={item.id}
              style={{
                borderRadius: "18px",
                backgroundColor: "#FFFFFF",
                padding: "16px",
                boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
                position: "relative",
              }}
            >
              {item.isNew && (
                <View
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "#EF4444",
                    color: "#FFFFFF",
                    fontSize: "10px",
                    fontWeight: "600",
                    padding: "2px 6px",
                    borderRadius: "8px",
                    zIndex: 10,
                  }}
                >
                  新品
                </View>
              )}

              <View
                style={{
                  width: "100%",
                  height: "120px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  marginBottom: "14px",
                  backgroundColor: "#F8FAFC",
                }}
              >
                <Image
                  src={item.cover}
                  mode="aspectFill"
                  style={{ width: "100%", height: "100%" }}
                />
              </View>

              <View style={{ marginBottom: "12px" }}>
                {/* 标题区域：名称 + 编码 + 状态 */}
                <View
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#0F172A",
                      flex: 1,
                      marginRight: "8px",
                    }}
                  >
                    {item.name}
                  </Text>
                </View>

                {/* 规格和单位信息 */}
                <View
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#64748B",
                    }}
                  >
                    规格: {item.specification}
                  </Text>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: "#64748B",
                    }}
                  >
                    单位: {item.unit}
                  </Text>
                </View>

                {/* 库存信息 */}
                <View
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      marginBottom: "4px",
                    }}
                  >
                    当前库存
                  </Text>
                  <Text
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color:
                        item.currentStock < item.minStock
                          ? "#EF4444"
                          : "#10B981",
                    }}
                  >
                    {item.currentStock.toLocaleString()}
                  </Text>
                </View>
              </View>

              {item.currentStock < item.minStock && (
                <View
                  style={{
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#FEF2F2",
                    borderRadius: "8px",
                    border: "1px solid #FECACA",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#DC2626",
                      fontWeight: "600",
                    }}
                  >
                    ⚠️ 库存不足，建议补货
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}
