    # 衣服加工厂业务逻辑梳理

## 一、核心业务流程

### 1.1 业务流程总览

```
甲方提供材料 → 材料接收 → 材料入库 → 材料分发 → 工人加工 → 成品提交 → 成品入库 → 交付甲方
```

### 1.2 详细流程说明

#### 阶段一：材料接收（从甲方获取材料）

**操作角色**：仓库管理员 / 管理员

**流程步骤**：
1. 创建材料接收单
   - 记录甲方信息（客户/供应商）
   - 记录材料清单（材料名称、数量、单位、规格）
   - 记录接收时间、接收人
   - 可上传材料照片/单据

2. 材料入库
   - 将接收的材料添加到库存
   - 更新库存数量
   - 记录入库位置

**数据记录**：
- 材料接收单（MaterialReceipt）
- 库存记录（Inventory）
- 入库记录（InventoryRecord）

---

#### 阶段二：材料分发（分发给各工人）

**操作角色**：生产主管 / 管理员

**流程步骤**：
1. 创建生产任务
   - 关联订单（如果有）
   - 确定生产产品
   - 确定生产数量
   - 确定负责工人

2. 材料领用/分发
   - 根据产品BOM（物料清单）计算所需材料
   - 从库存中领用材料
   - 分配给具体工人
   - 记录分发数量、分发时间、分发人

**数据记录**：
- 生产任务（ProductionTask）
- 材料分发单（MaterialDistribution）
- 库存出库记录（InventoryRecord）

---

#### 阶段三：工人加工（工人进行加工）

**操作角色**：工人

**流程步骤**：
1. 查看分配的任务
   - 查看任务详情
   - 查看所需材料
   - 查看加工要求

2. 开始加工
   - 确认接收材料
   - 开始生产任务

3. 上报进度
   - 定期上报完成数量
   - 可上传加工照片
   - 记录加工时间

**数据记录**：
- 生产进度（ProductionProgress）
- 任务状态更新（ProductionTask）

---

#### 阶段四：成品提交（工人把成品提交）

**操作角色**：工人

**流程步骤**：
1. 完成加工
   - 工人确认加工完成
   - 提交完成数量
   - 提交成品

2. 成品入库
   - 将成品添加到成品库存
   - 记录入库数量、位置
   - 关联生产任务

**数据记录**：
- 成品入库单（ProductReceipt）
- 成品库存（ProductInventory）
- 任务状态更新为"已完成"

---

#### 阶段五：交付甲方（提交之后交给甲方）

**操作角色**：仓库管理员 / 管理员

**流程步骤**：
1. 创建交付单
   - 关联订单（如果有）
   - 记录交付给甲方的成品清单
   - 记录交付数量、交付时间
   - 记录交付人、接收人（甲方）

2. 成品出库
   - 从成品库存中出库
   - 更新成品库存数量
   - 记录出库原因

3. 交付确认
   - 甲方确认收货
   - 更新订单状态为"已交付"
   - 完成整个流程

**数据记录**：
- 交付单（DeliveryOrder）
- 成品出库记录（ProductInventoryRecord）
- 订单状态更新

---

## 二、数据模型设计

### 2.1 材料接收单（MaterialReceipt）

```typescript
interface MaterialReceipt {
  id: string                    // 接收单ID
  receiptNo: string            // 接收单编号
  customerId: string           // 甲方ID（客户/供应商）
  customerName: string         // 甲方名称
  receiptDate: string          // 接收日期
  receiptBy: string            // 接收人ID
  receiptByName: string        // 接收人姓名
  materials: MaterialItem[]    // 材料清单
  totalAmount?: number         // 总金额（如果有）
  remark?: string             // 备注
  images?: string[]           // 相关照片
  status: 'draft' | 'confirmed' | 'completed'  // 状态
  createTime: string
  updateTime: string
}

interface MaterialItem {
  materialId: string          // 材料ID
  materialName: string        // 材料名称
  materialNo: string         // 材料编号
  quantity: number           // 数量
  unit: string               // 单位
  specifications?: string    // 规格
  location?: string          // 存放位置
}
```

### 2.2 材料分发单（MaterialDistribution）

```typescript
interface MaterialDistribution {
  id: string                  // 分发单ID
  distributionNo: string     // 分发单编号
  taskId: string             // 关联生产任务ID
  taskNo: string             // 任务编号
  orderId?: string           // 关联订单ID
  orderNo?: string           // 订单编号
  workerId: string           // 工人ID
  workerName: string          // 工人姓名
  distributeBy: string       // 分发人ID
  distributeByName: string   // 分发人姓名
  distributeDate: string     // 分发日期
  materials: MaterialItem[]  // 分发材料清单
  status: 'pending' | 'received' | 'completed'  // 状态
  remark?: string
  createTime: string
  updateTime: string
}
```

### 2.3 成品入库单（ProductReceipt）

```typescript
interface ProductReceipt {
  id: string                  // 入库单ID
  receiptNo: string          // 入库单编号
  taskId: string             // 关联生产任务ID
  taskNo: string             // 任务编号
  orderId?: string           // 关联订单ID
  orderNo?: string           // 订单编号
  workerId: string           // 工人ID
  workerName: string         // 工人姓名
  productId: string          // 产品ID
  productName: string        // 产品名称
  quantity: number           // 入库数量
  unit: string              // 单位
  receiptDate: string        // 入库日期
  receiptBy: string         // 入库人ID
  receiptByName: string      // 入库人姓名
  location?: string          // 存放位置
  qualityLevel?: 'excellent' | 'good' | 'qualified' | 'unqualified'  // 质量等级
  images?: string[]         // 成品照片
  remark?: string
  status: 'draft' | 'confirmed' | 'completed'
  createTime: string
  updateTime: string
}
```

### 2.4 交付单（DeliveryOrder）

```typescript
interface DeliveryOrder {
  id: string                  // 交付单ID
  deliveryNo: string         // 交付单编号
  orderId?: string          // 关联订单ID
  orderNo?: string          // 订单编号
  customerId: string        // 甲方ID
  customerName: string       // 甲方名称
  deliveryDate: string      // 交付日期
  deliveryBy: string        // 交付人ID
  deliveryByName: string     // 交付人姓名
  receiver?: string         // 甲方接收人
  receiverPhone?: string    // 接收人电话
  products: ProductItem[]   // 交付成品清单
  totalQuantity: number     // 总数量
  deliveryAddress?: string // 交付地址
  images?: string[]        // 交付照片/签收单
  status: 'pending' | 'delivered' | 'confirmed' | 'completed'  // 状态
  remark?: string
  createTime: string
  updateTime: string
}

interface ProductItem {
  productId: string         // 产品ID
  productName: string       // 产品名称
  quantity: number          // 数量
  unit: string             // 单位
}
```

### 2.5 成品库存（ProductInventory）

```typescript
interface ProductInventory {
  id: string
  productId: string         // 产品ID
  productName: string       // 产品名称
  productNo: string        // 产品编号
  orderId?: string         // 关联订单ID
  currentStock: number      // 当前库存
  unit: string            // 单位
  location?: string       // 存放位置
  updateTime: string
}
```

---

## 三、状态流转图

### 3.1 材料接收流程

```
草稿 → 确认接收 → 材料入库 → 完成
```

### 3.2 材料分发流程

```
待分发 → 已分发 → 工人确认接收 → 完成
```

### 3.3 生产任务流程

```
待分配 → 已分配 → 材料已分发 → 进行中 → 已完成 → 成品已入库
```

### 3.4 成品交付流程

```
待交付 → 已出库 → 已交付 → 甲方确认 → 完成
```

---

## 四、关键功能点

### 4.1 材料管理

1. **材料接收**
   - 创建材料接收单
   - 批量接收材料
   - 材料入库
   - 接收单查询

2. **材料分发**
   - 根据生产任务自动计算所需材料
   - 材料领用/分发
   - 分发记录查询
   - 材料使用统计

3. **库存管理**
   - 材料库存查询
   - 库存预警
   - 出入库记录
   - 库存盘点

### 4.2 生产管理

1. **任务分配**
   - 创建生产任务
   - 分配给工人
   - 材料自动计算和分发

2. **进度跟踪**
   - 工人上报进度
   - 实时查看生产进度
   - 进度统计分析

3. **成品管理**
   - 成品入库
   - 成品库存管理
   - 成品质量记录

### 4.3 交付管理

1. **交付单管理**
   - 创建交付单
   - 成品出库
   - 交付确认
   - 交付记录查询

2. **订单关联**
   - 交付单关联订单
   - 订单状态自动更新
   - 交付进度跟踪

---

## 五、统计功能

### 5.1 材料统计

- 材料接收统计（按时间、按甲方）
- 材料使用统计（按产品、按工人）
- 材料库存统计
- 材料成本统计

### 5.2 生产统计

- 生产任务统计（按工人、按产品、按时间）
- 生产效率统计
- 成品产量统计
- 质量合格率统计

### 5.3 交付统计

- 交付数量统计（按甲方、按产品、按时间）
- 交付及时率统计
- 订单完成率统计

---

## 六、页面设计

### 6.1 材料管理页面

- `pages/material/receive` - 材料接收
- `pages/material/distribute` - 材料分发
- `pages/material/list` - 材料列表
- `pages/material/records` - 接收/分发记录

### 6.2 成品管理页面

- `pages/product/receive` - 成品入库
- `pages/product/inventory` - 成品库存
- `pages/product/delivery` - 成品交付
- `pages/product/records` - 交付记录

### 6.3 统计页面

- `pages/statistics/material` - 材料统计
- `pages/statistics/production` - 生产统计
- `pages/statistics/delivery` - 交付统计

---

## 七、权限设计

| 功能 | 管理员 | 主管 | 工人 | 仓库管理员 |
|------|--------|------|------|-----------|
| 材料接收 | ✅ | ✅ | ❌ | ✅ |
| 材料分发 | ✅ | ✅ | ❌ | ✅ |
| 查看材料库存 | ✅ | ✅ | ✅ | ✅ |
| 生产任务分配 | ✅ | ✅ | ❌ | ❌ |
| 上报生产进度 | ✅ | ✅ | ✅ | ❌ |
| 成品入库 | ✅ | ✅ | ✅ | ✅ |
| 成品交付 | ✅ | ✅ | ❌ | ✅ |
| 查看统计 | ✅ | ✅ | ❌ | ❌ |

---

## 八、开发优先级

### 第一阶段：核心流程（MVP）
1. ✅ 材料接收功能
2. ✅ 材料分发功能
3. ✅ 生产任务分配
4. ✅ 工人进度上报
5. ✅ 成品入库
6. ✅ 成品交付

### 第二阶段：完善功能
1. 库存管理
2. 统计报表
3. 消息通知
4. 权限管理

### 第三阶段：高级功能
1. 数据分析
2. 预测分析
3. 移动端优化
4. 数据导出

