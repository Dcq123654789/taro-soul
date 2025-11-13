# 衣服加工厂小程序设计方案

## 一、业务场景分析

### 核心业务角色
1. **工厂管理员**：管理订单、生产、库存、员工
2. **生产主管**：分配任务、跟踪进度、质检
3. **车间工人**：接收任务、上报进度、提交质检
4. **客户**：下单、查看进度、收货确认

### 核心业务流程
```
客户下单 → 订单审核 → 生产计划 → 任务分配 → 生产执行 → 质检 → 发货 → 完成
```

---

## 二、页面结构设计

### 2.1 TabBar 页面（底部导航）

#### 1. 首页（工作台）
- **路径**: `pages/index/index`
- **功能**:
  - 数据概览（昨日/今日订单、产量、销售额）
  - 待处理事项（待审核订单、待分配任务、待质检）
  - 快捷入口（新建订单、生产计划、库存查询）
  - 生产进度看板（各车间实时状态）

#### 2. 订单管理
- **路径**: `pages/order/index`
- **功能**:
  - 订单列表（全部/待审核/生产中/待发货/已完成）
  - 订单详情（客户信息、产品规格、数量、交期）
  - 订单创建/编辑
  - 订单状态流转

#### 3. 生产管理
- **路径**: `pages/production/index`
- **功能**:
  - 生产任务列表（待分配/进行中/已完成）
  - 生产计划（按车间、按日期）
  - 任务分配（分配给工人/班组）
  - 进度上报（工人提交进度）
  - 生产看板（实时产量、效率）

#### 4. 我的
- **路径**: `pages/profile/index`
- **功能**:
  - 个人信息（角色、权限）
  - 我的任务（工人查看分配的任务）
  - 我的订单（客户查看自己的订单）
  - 设置（通知、密码、退出）

---

### 2.2 功能页面（非 TabBar）

#### 订单相关
- `pages/order/create` - 创建订单
- `pages/order/detail` - 订单详情
- `pages/order/edit` - 编辑订单

#### 生产相关
- `pages/production/plan` - 生产计划     
- `pages/production/task` - 任务详情
- `pages/production/progress` - 进度上报
- `pages/production/quality` - 质检管理

#### 产品相关
- `pages/product/list` - 产品列表
- `pages/product/detail` - 产品详情
- `pages/product/create` - 创建产品

#### 客户相关
- `pages/customer/list` - 客户列表
- `pages/customer/detail` - 客户详情
- `pages/customer/create` - 新增客户

#### 库存相关
- `pages/inventory/list` - 库存列表
- `pages/inventory/in-out` - 出入库记录
- `pages/inventory/check` - 库存盘点

#### 员工相关
- `pages/employee/list` - 员工列表
- `pages/employee/detail` - 员工详情
- `pages/employee/task` - 员工任务

#### 统计报表
- `pages/report/dashboard` - 数据看板
- `pages/report/order` - 订单统计
- `pages/report/production` - 生产统计
- `pages/report/finance` - 财务报表

---

## 三、数据模型设计

### 3.1 订单（Order）

```typescript
interface Order {
  id: string                    // 订单ID
  orderNo: string              // 订单编号
  customerId: string           // 客户ID
  customerName: string         // 客户名称
  productId: string            // 产品ID
  productName: string          // 产品名称
  specifications: string       // 规格要求
  quantity: number             // 数量
  unit: string                 // 单位（件/套）
  unitPrice: number            // 单价
  totalAmount: number          // 总金额
  deliveryDate: string         // 交期
  status: OrderStatus          // 订单状态
  priority: 'low' | 'normal' | 'high' | 'urgent'  // 优先级
  remark?: string              // 备注
  createTime: string           // 创建时间
  updateTime: string           // 更新时间
  createBy: string             // 创建人
}

enum OrderStatus {
  DRAFT = 'draft',           // 草稿
  PENDING = 'pending',       // 待审核
  APPROVED = 'approved',     // 已审核
  PLANNED = 'planned',       // 已排产
  PRODUCING = 'producing',   // 生产中
  QUALITY_CHECK = 'quality_check',  // 质检中
  READY_SHIP = 'ready_ship', // 待发货
  SHIPPED = 'shipped',       // 已发货
  COMPLETED = 'completed',   // 已完成
  CANCELLED = 'cancelled'    // 已取消
}
```

### 3.2 生产任务（ProductionTask）

```typescript
interface ProductionTask {
  id: string                  // 任务ID
  taskNo: string             // 任务编号
  orderId: string            // 关联订单ID
  orderNo: string            // 订单编号
  workshopId: string         // 车间ID
  workshopName: string        // 车间名称
  productId: string          // 产品ID
  productName: string         // 产品名称
  quantity: number           // 生产数量
  assignedQuantity: number   // 已分配数量
  completedQuantity: number  // 已完成数量
  status: TaskStatus         // 任务状态
  planStartDate: string      // 计划开始日期
  planEndDate: string        // 计划结束日期
  actualStartDate?: string   // 实际开始日期
  actualEndDate?: string     // 实际结束日期
  assignedTo?: string        // 分配给（员工ID）
  assignedToName?: string    // 分配给（员工姓名）
  createTime: string
  updateTime: string
}

enum TaskStatus {
  PENDING = 'pending',       // 待分配
  ASSIGNED = 'assigned',     // 已分配
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed',   // 已完成
  QUALITY_CHECK = 'quality_check', // 质检中
  QUALITY_PASSED = 'quality_passed', // 质检通过
  QUALITY_FAILED = 'quality_failed'  // 质检不通过
}
```

### 3.3 产品（Product）

```typescript
interface Product {
  id: string                  // 产品ID
  productNo: string           // 产品编号
  name: string                // 产品名称
  category: string            // 产品分类
  specifications: string      // 规格说明
  unit: string                // 单位
  standardPrice: number       // 标准单价
  materials: Material[]       // 所需材料清单
  processFlow: ProcessStep[]  // 工艺流程
  imageUrl?: string           // 产品图片
  remark?: string
  createTime: string
  updateTime: string
}

interface Material {
  materialId: string
  materialName: string
  quantity: number
  unit: string
}

interface ProcessStep {
  stepNo: number              // 工序序号
  stepName: string            // 工序名称
  workshopId: string          // 所属车间
  standardTime: number        // 标准工时（分钟）
}
```

### 3.4 客户（Customer）

```typescript
interface Customer {
  id: string
  customerNo: string         // 客户编号
  name: string               // 客户名称
  contact: string            // 联系人
  phone: string              // 联系电话
  address?: string           // 地址
  email?: string             // 邮箱
  creditLevel: 'A' | 'B' | 'C' | 'D'  // 信用等级
  remark?: string
  createTime: string
  updateTime: string
}
```

### 3.5 库存（Inventory）

```typescript
interface Inventory {
  id: string
  materialId: string         // 材料ID
  materialName: string       // 材料名称
  materialNo: string         // 材料编号
  category: string           // 材料分类
  unit: string               // 单位
  currentStock: number       // 当前库存
  minStock: number           // 最低库存（预警线）
  maxStock: number           // 最高库存
  location?: string          // 存放位置
  updateTime: string
}

interface InventoryRecord {
  id: string
  materialId: string
  materialName: string
  type: 'in' | 'out'         // 入库/出库
  quantity: number           // 数量
  unit: string
  reason: string             // 原因（采购入库/生产领用/退货等）
  relatedOrderId?: string   // 关联订单ID
  operator: string           // 操作人
  operateTime: string        // 操作时间
  remark?: string
}
```

### 3.6 员工（Employee）

```typescript
interface Employee {
  id: string
  employeeNo: string         // 工号
  name: string              // 姓名
  phone: string             // 手机号
  role: EmployeeRole        // 角色
  department: string        // 部门
  workshopId?: string       // 所属车间
  workshopName?: string     // 车间名称
  position: string          // 职位
  status: 'active' | 'inactive'  // 状态
  createTime: string
}

enum EmployeeRole {
  ADMIN = 'admin',          // 管理员
  MANAGER = 'manager',      // 主管
  WORKER = 'worker',        // 工人
  QUALITY = 'quality',      // 质检员
  CUSTOMER = 'customer'     // 客户
}
```

### 3.7 生产进度（ProductionProgress）

```typescript
interface ProductionProgress {
  id: string
  taskId: string            // 任务ID
  orderId: string           // 订单ID
  completedQuantity: number // 完成数量
  progress: number          // 进度百分比
  reportTime: string        // 上报时间
  reporter: string          // 上报人
  images?: string[]         // 进度照片
  remark?: string
}
```

### 3.8 质检记录（QualityCheck）

```typescript
interface QualityCheck {
  id: string
  taskId: string            // 任务ID
  orderId: string           // 订单ID
  checkedQuantity: number   // 检验数量
  passedQuantity: number    // 合格数量
  failedQuantity: number    // 不合格数量
  qualityLevel: 'excellent' | 'good' | 'qualified' | 'unqualified'
  checker: string           // 检验员
  checkTime: string         // 检验时间
  images?: string[]         // 检验照片
  remark?: string
}
```

---

## 四、页面功能详细设计

### 4.1 首页（工作台）

**数据展示**:
- 今日订单数、今日产量、今日销售额
- 待处理订单数、待分配任务数、待质检数
- 各车间生产状态（进行中/待开始/已完成）

**快捷操作**:
- 新建订单
- 创建生产计划
- 库存查询
- 员工管理

### 4.2 订单管理

**列表筛选**:
- 按状态筛选（全部/待审核/生产中/待发货/已完成）
- 按时间范围筛选
- 按客户筛选
- 搜索（订单号/客户名/产品名）

**订单操作**:
- 创建订单（选择客户、产品、填写数量、交期）
- 审核订单（通过/驳回）
- 排产（将订单转为生产任务）
- 查看详情（订单信息、生产进度、质检记录）

### 4.3 生产管理

**任务列表**:
- 待分配任务（需要分配给工人）
- 进行中任务（显示进度）
- 已完成任务

**任务操作**:
- 分配任务（选择工人、设置数量、计划时间）
- 查看进度（实时进度、历史记录）
- 进度上报（工人提交完成数量）
- 质检（质检员检验质量）

### 4.4 我的

**角色区分**:
- **管理员/主管**: 查看所有数据、管理权限
- **工人**: 查看分配的任务、上报进度
- **客户**: 查看自己的订单、跟踪进度

---

## 五、API 接口设计

### 5.1 订单接口
- `POST /api/order/create` - 创建订单
- `GET /api/order/list` - 订单列表
- `GET /api/order/detail/:id` - 订单详情
- `PUT /api/order/update/:id` - 更新订单
- `POST /api/order/approve/:id` - 审核订单
- `POST /api/order/cancel/:id` - 取消订单

### 5.2 生产接口
- `POST /api/production/task/create` - 创建生产任务
- `GET /api/production/task/list` - 任务列表
- `POST /api/production/task/assign` - 分配任务
- `POST /api/production/progress/report` - 上报进度
- `GET /api/production/progress/:taskId` - 查看进度

### 5.3 产品接口
- `GET /api/product/list` - 产品列表
- `GET /api/product/detail/:id` - 产品详情
- `POST /api/product/create` - 创建产品

### 5.4 库存接口
- `GET /api/inventory/list` - 库存列表
- `POST /api/inventory/in` - 入库
- `POST /api/inventory/out` - 出库
- `GET /api/inventory/records` - 出入库记录

---

## 六、权限设计

### 角色权限矩阵

| 功能 | 管理员 | 主管 | 工人 | 质检员 | 客户 |
|------|--------|------|------|--------|------|
| 查看订单 | ✅ | ✅ | ❌ | ✅ | 仅自己 |
| 创建订单 | ✅ | ✅ | ❌ | ❌ | ✅ |
| 审核订单 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 分配任务 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 上报进度 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 质检 | ✅ | ✅ | ❌ | ✅ | ❌ |
| 库存管理 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 员工管理 | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 七、技术实现建议

### 7.1 状态管理
- 使用 Taro 的 Context API 或 Redux 管理全局状态
- 订单状态、任务状态使用枚举类型

### 7.2 数据缓存
- 使用 Taro 的 Storage API 缓存常用数据
- 客户列表、产品列表等可缓存

### 7.3 图片上传
- 使用 Taro.chooseImage 选择图片
- 上传到云存储或服务器

### 7.4 实时更新
- 使用 WebSocket 或轮询更新生产进度
- 首页数据定时刷新

---

## 八、开发优先级

### 第一阶段（MVP）
1. ✅ 首页数据概览
2. ✅ 订单列表和详情
3. ✅ 订单创建
4. ✅ 生产任务列表
5. ✅ 任务分配

### 第二阶段
1. 进度上报
2. 质检管理
3. 库存管理
4. 客户管理

### 第三阶段
1. 数据统计报表
2. 消息通知
3. 权限管理
4. 高级功能




