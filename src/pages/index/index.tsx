import { useMemo, useState } from "react";
import scope from "@/utils/scope";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { View, Text } from "@tarojs/components";

export default function Index() {
  useAuthGuard();
  const [activeRange, setActiveRange] = useState<"week" | "month" | "year">(
    "week"
  );

  const todayLabel = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}年${month}月${day}日`;
  }, []);

  const summaryData = useMemo(
    () => ({
      week: [
        { label: "完成数", value: 286, suffix: "" },
        { label: "待完成数", value: 42, suffix: "" },
      ],
      month: [
        { label: "完成数", value: 1310, suffix: "" },
        { label: "待完成数", value: 188, suffix: "" },
      ],
      year: [
        { label: "完成数", value: 15680, suffix: "" },
        { label: "待完成数", value: 1920, suffix: "" },
      ],
    }),
    []
  );

  const chartSeries = useMemo(
    () => ({
      week: [
        { label: "周一", value: 42 },
        { label: "周二", value: 58 },
        { label: "周三", value: 64 },
        { label: "周四", value: 50 },
        { label: "周五", value: 72 },
        { label: "周六", value: 38 },
        { label: "周日", value: 48 },
      ],
      month: [
        { label: "第1周", value: 210 },
        { label: "第2周", value: 256 },
        { label: "第3周", value: 288 },
        { label: "第4周", value: 312 },
      ],
      year: [
        { label: "1月", value: 820 },
        { label: "2月", value: 760 },
        { label: "3月", value: 880 },
        { label: "4月", value: 940 },
        { label: "5月", value: 1010 },
        { label: "6月", value: 980 },
        { label: "7月", value: 1050 },
        { label: "8月", value: 1080 },
        { label: "9月", value: 990 },
        { label: "10月", value: 1120 },
        { label: "11月", value: 1180 },
        { label: "12月", value: 1240 },
      ],
    }),
    []
  );

  const summaryList = summaryData[activeRange];
  const series = chartSeries[activeRange];
  const maxValue = Math.max(...series.map((item) => item.value), 1);

  const rangeOptions: Array<{ key: typeof activeRange; label: string }> = [
    { key: "week", label: "周" },
    { key: "month", label: "月" },
    { key: "year", label: "年" },
  ];

  const handleViewDetail = async () => {
    console.log("dada");

    const res = await scope.requestWithLoadingAndPagination(
      "http://localhost:8888/batch",
      {
        entity: "User", // 使用 props 中的 entity
        action: "query",
      },
      {
        method: "POST",
        paramType: "body", // 参数会放在 URL 查询字符串中
      }
    );
    console.log("res", res);
  };
  return (
    <View
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 60%)",
        padding: "24px 16px 0",
        boxSizing: "border-box",
      }}
    >
      <View
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Text
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: scope.themeColor,
          }}
        >
          数据总览
        </Text>
        <Text style={{ fontSize: "14px", color: "#475569" }}>{todayLabel}</Text>
      </View>

      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.06)",
        }}
      >
        <View
          style={
            {
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "12px",
              marginBottom: "18px",
            } as any
          }
        >
          {summaryList.map((item) => (
            <View
              key={item.label}
              style={{
                backgroundColor: "#F1F5F9",
                borderRadius: "12px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  color: "#64748B",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#0F172A",
                  display: "block",
                }}
              >
                {item.suffix === "%"
                  ? `${item.value}${item.suffix}`
                  : item.suffix === "¥"
                  ? `¥${item.value.toLocaleString()}`
                  : item.value.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
        <View
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <View>
            <Text
              style={{ fontSize: "18px", fontWeight: "600", color: "#0F172A" }}
            >
              产能走势
            </Text>
          </View>
          <View style={{ display: "flex", gap: "8px" }}>
            {rangeOptions.map((option) => {
              const isActive = option.key === activeRange;
              return (
                <View
                  key={option.key}
                  onClick={() => setActiveRange(option.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    backgroundColor: isActive ? scope.themeColor : "#E2E8F0",
                    color: isActive ? "#FFFFFF" : "#475569",
                    fontSize: "14px",
                    fontWeight: isActive ? "600" : "500",
                  }}
                >
                  {option.label}
                </View>
              );
            })}
          </View>
        </View>
        <View
          style={
            {
              display: "grid",
              gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))`,
              gap: "12px",
              alignItems: "end",
            } as any
          }
        >
          {series.map((item) => {
            const relativeHeight = item.value / maxValue;
            const barHeight = Math.max(relativeHeight * 140, 12);
            return (
              <View
                key={item.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  minHeight: "180px",
                }}
              >
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#0F172A",
                    marginBottom: "6px",
                  }}
                >
                  {item.value}
                </Text>
                <View
                  style={{
                    width: "100%",
                    height: `${barHeight}px`,
                    background:
                      "linear-gradient(180deg, #38BDF8 0%, #0EA5E9 100%)",
                    borderRadius: "12px 12px 6px 6px",
                  }}
                />
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    marginTop: "8px",
                  }}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={{ marginBottom: "12px" }}>
        <Text style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A" }}>
          员工列表
        </Text>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {[
          {
            name: "张三",
            gender: "男",
            todayCompleted: 15,
            totalReceived: 120,
            uncompleted: 8,
            completed: 112,
          },
          {
            name: "李四",
            gender: "女",
            todayCompleted: 18,
            totalReceived: 135,
            uncompleted: 5,
            completed: 130,
          },
          {
            name: "王五",
            gender: "男",
            todayCompleted: 12,
            totalReceived: 98,
            uncompleted: 12,
            completed: 86,
          },
          {
            name: "赵六",
            gender: "女",
            todayCompleted: 20,
            totalReceived: 150,
            uncompleted: 3,
            completed: 147,
          },
        ].map((employee) => (
          <View
            key={employee.name}
            onClick={() => handleViewDetail()}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.06)",
            }}
          >
            <View
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <View
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <View
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor:
                      employee.gender === "男" ? "#DBEAFE" : "#FCE7F3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: employee.gender === "男" ? "#3B82F6" : "#EC4899",
                    }}
                  >
                    {employee.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#0F172A",
                    }}
                  >
                    {employee.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      marginTop: "2px",
                    }}
                  >
                    {employee.gender}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: "#F0F9FF",
                  borderRadius: "8px",
                  padding: "6px 12px",
                }}
              >
                <Text
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0EA5E9",
                  }}
                >
                  今日完成: {employee.todayCompleted}
                </Text>
              </View>
            </View>
            <View
              style={
                {
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #F1F5F9",
                } as any
              }
            >
              <View style={{ textAlign: "center" } as any}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  领取总数
                </Text>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#0F172A",
                    display: "block",
                  }}
                >
                  {employee.totalReceived}
                </Text>
              </View>
              <View style={{ textAlign: "center" } as any}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  未完成数
                </Text>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#EF4444",
                    display: "block",
                  }}
                >
                  {employee.uncompleted}
                </Text>
              </View>
              <View style={{ textAlign: "center" } as any}>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  已完成数
                </Text>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#10B981",
                    display: "block",
                  }}
                >
                  {employee.completed}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
