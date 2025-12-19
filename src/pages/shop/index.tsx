import { useEffect, useMemo, useState } from "react";
import { View, Text, Input, Image } from "@tarojs/components";
import scope from "@/utils/scope";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface MaterialItem {
  name: string;
  quantity: string;
  cover: string;
}

export default function MaterialLibrary() {
  useAuthGuard();
  const [materialList, setMaterialList] = useState<MaterialItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // 预加载：从后端/数据库请求面料列表
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        // 根据你后端接口实际结构调整参数
        const res = await scope.requestWithLoadingAndPagination(
          "/batch",
          {
            entity: "Material", // 示例：数据库中的实体名
            action: "query",
          },
          {
            method: "POST",
            paramType: "body",
            dataField: "list", // 假设返回结构为 { list: [...] }
          }
        );

        // res.data 即为 dataField 对应字段
        const list = (res?.data || []) as any[];
        const mapped: MaterialItem[] = list.map((item) => ({
          name: item.name || "",
          quantity: item.quantity ? String(item.quantity) : "",
          cover:
            item.cover ||
            "https://cdn.jsdelivr.net/gh/ihommani/assets/cloth-cotton.jpg",
        }));

        setMaterialList(mapped);
      } catch (error) {
        console.error("加载面料列表失败", error);
        // 可以按需增加错误提示
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const filteredList = useMemo(() => {
    if (!keyword.trim()) return materialList;
    return materialList.filter((item) =>
      item.name.toLowerCase().includes(keyword.trim().toLowerCase())
    );
  }, [keyword]);

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
          placeholder="搜索面料名称或编号"
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
              key={item.name}
              style={{
                borderRadius: "18px",
                backgroundColor: "#FFFFFF",
                padding: "12px",
                boxShadow: "0 12px 28px rgba(15, 23, 42, 0.05)",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "116px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  marginBottom: "12px",
                }}
              >
                <Image
                  src={item.cover}
                  mode="aspectFill"
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0F172A",
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#2563EB",
                    fontWeight: "600",
                  }}
                >
                  {item.quantity}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
