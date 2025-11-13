/**
 * 衣服加工厂小程序 - 模拟数据
 * 用于开发和测试
 */

import type {
  Order,
  OrderStatus,
  ProductionTask,
  TaskStatus,
  Product,
  Customer,
  Employee,
  EmployeeRole,
  DashboardStats,
  Inventory
} from '@/types/business'

// ===================== 模拟订单数据 =====================
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNo: 'ORD20240101001',
    customerId: '1',
    customerName: '时尚服装有限公司',
    productId: '1',
    productName: '男士T恤',
    specifications: '白色，XL码，纯棉',
    quantity: 500,
    unit: '件',
    unitPrice: 25.00,
    totalAmount: 12500.00,
    deliveryDate: '2024-01-15',
    status: OrderStatus.PRODUCING,
    priority: 'high',
    remark: '加急订单，优先处理',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-05 14:30:00',
    createBy: 'admin'
  },
  {
    id: '2',
    orderNo: 'ORD20240102001',
    customerId: '2',
    customerName: '潮流服饰店',
    productId: '2',
    productName: '女士连衣裙',
    specifications: '蓝色，M码，雪纺',
    quantity: 300,
    unit: '件',
    unitPrice: 45.00,
    totalAmount: 13500.00,
    deliveryDate: '2024-01-20',
    status: OrderStatus.APPROVED,
    priority: 'normal',
    createTime: '2024-01-02 09:30:00',
    updateTime: '2024-01-02 15:20:00',
    createBy: 'admin'
  },
  {
    id: '3',
    orderNo: 'ORD20240103001',
    customerId: '3',
    customerName: '精品服装批发',
    productId: '3',
    productName: '牛仔裤',
    specifications: '深蓝色，32码，弹力',
    quantity: 800,
    unit: '条',
    unitPrice: 35.00,
    totalAmount: 28000.00,
    deliveryDate: '2024-01-25',
    status: OrderStatus.PENDING,
    priority: 'normal',
    createTime: '2024-01-03 11:00:00',
    updateTime: '2024-01-03 11:00:00',
    createBy: 'admin'
  }
]

// ===================== 模拟生产任务数据 =====================
export const mockTasks: ProductionTask[] = [
  {
    id: '1',
    taskNo: 'TASK20240101001',
    orderId: '1',
    orderNo: 'ORD20240101001',
    workshopId: '1',
    workshopName: '裁剪车间',
    productId: '1',
    productName: '男士T恤',
    quantity: 500,
    assignedQuantity: 500,
    completedQuantity: 320,
    status: TaskStatus.IN_PROGRESS,
    planStartDate: '2024-01-05',
    planEndDate: '2024-01-12',
    actualStartDate: '2024-01-05',
    assignedTo: '3',
    assignedToName: '张三',
    createTime: '2024-01-05 08:00:00',
    updateTime: '2024-01-08 16:30:00'
  },
  {
    id: '2',
    taskNo: 'TASK20240101002',
    orderId: '1',
    orderNo: 'ORD20240101001',
    workshopId: '2',
    workshopName: '缝纫车间',
    productId: '1',
    productName: '男士T恤',
    quantity: 500,
    assignedQuantity: 500,
    completedQuantity: 180,
    status: TaskStatus.IN_PROGRESS,
    planStartDate: '2024-01-08',
    planEndDate: '2024-01-14',
    actualStartDate: '2024-01-08',
    assignedTo: '4',
    assignedToName: '李四',
    createTime: '2024-01-08 08:00:00',
    updateTime: '2024-01-08 17:00:00'
  },
  {
    id: '3',
    taskNo: 'TASK20240102001',
    orderId: '2',
    orderNo: 'ORD20240102001',
    workshopId: '1',
    workshopName: '裁剪车间',
    productId: '2',
    productName: '女士连衣裙',
    quantity: 300,
    assignedQuantity: 0,
    completedQuantity: 0,
    status: TaskStatus.PENDING,
    planStartDate: '2024-01-10',
    planEndDate: '2024-01-18',
    createTime: '2024-01-09 10:00:00',
    updateTime: '2024-01-09 10:00:00'
  }
]

// ===================== 模拟产品数据 =====================
export const mockProducts: Product[] = [
  {
    id: '1',
    productNo: 'PRD001',
    name: '男士T恤',
    category: '上装',
    specifications: '纯棉材质，多色可选',
    unit: '件',
    standardPrice: 25.00,
    materials: [
      { materialId: '1', materialName: '纯棉布料', quantity: 1.2, unit: '米' },
      { materialId: '2', materialName: '纽扣', quantity: 4, unit: '个' }
    ],
    processFlow: [
      { stepNo: 1, stepName: '裁剪', workshopId: '1', standardTime: 5 },
      { stepNo: 2, stepName: '缝纫', workshopId: '2', standardTime: 15 },
      { stepNo: 3, stepName: '质检', workshopId: '3', standardTime: 3 }
    ],
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '2',
    productNo: 'PRD002',
    name: '女士连衣裙',
    category: '连衣裙',
    specifications: '雪纺材质，优雅设计',
    unit: '件',
    standardPrice: 45.00,
    materials: [
      { materialId: '3', materialName: '雪纺布料', quantity: 2.5, unit: '米' },
      { materialId: '4', materialName: '拉链', quantity: 1, unit: '条' }
    ],
    processFlow: [
      { stepNo: 1, stepName: '裁剪', workshopId: '1', standardTime: 8 },
      { stepNo: 2, stepName: '缝纫', workshopId: '2', standardTime: 25 },
      { stepNo: 3, stepName: '质检', workshopId: '3', standardTime: 5 }
    ],
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    id: '3',
    productNo: 'PRD003',
    name: '牛仔裤',
    category: '下装',
    specifications: '弹力牛仔，多码可选',
    unit: '条',
    standardPrice: 35.00,
    materials: [
      { materialId: '5', materialName: '牛仔布料', quantity: 1.5, unit: '米' },
      { materialId: '6', materialName: '拉链', quantity: 1, unit: '条' },
      { materialId: '7', materialName: '纽扣', quantity: 1, unit: '个' }
    ],
    processFlow: [
      { stepNo: 1, stepName: '裁剪', workshopId: '1', standardTime: 6 },
      { stepNo: 2, stepName: '缝纫', workshopId: '2', standardTime: 20 },
      { stepNo: 3, stepName: '质检', workshopId: '3', standardTime: 4 }
    ],
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  }
]

// ===================== 模拟客户数据 =====================
export const mockCustomers: Customer[] = [
  {
    id: '1',
    customerNo: 'CUS001',
    name: '时尚服装有限公司',
    contact: '王总',
    phone: '13800138001',
    address: '北京市朝阳区xxx路xxx号',
    email: 'wang@fashion.com',
    creditLevel: 'A',
    createTime: '2023-12-01 00:00:00',
    updateTime: '2023-12-01 00:00:00'
  },
  {
    id: '2',
    customerNo: 'CUS002',
    name: '潮流服饰店',
    contact: '李经理',
    phone: '13800138002',
    address: '上海市浦东新区xxx路xxx号',
    creditLevel: 'B',
    createTime: '2023-12-05 00:00:00',
    updateTime: '2023-12-05 00:00:00'
  },
  {
    id: '3',
    customerNo: 'CUS003',
    name: '精品服装批发',
    contact: '张老板',
    phone: '13800138003',
    address: '广州市天河区xxx路xxx号',
    creditLevel: 'A',
    createTime: '2023-12-10 00:00:00',
    updateTime: '2023-12-10 00:00:00'
  }
]

// ===================== 模拟员工数据 =====================
export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeNo: 'EMP001',
    name: '管理员',
    phone: '13800000001',
    role: EmployeeRole.ADMIN,
    department: '管理部',
    position: '系统管理员',
    status: 'active',
    createTime: '2023-01-01 00:00:00'
  },
  {
    id: '2',
    employeeNo: 'EMP002',
    name: '生产主管',
    phone: '13800000002',
    role: EmployeeRole.MANAGER,
    department: '生产部',
    workshopId: '1',
    workshopName: '裁剪车间',
    position: '生产主管',
    status: 'active',
    createTime: '2023-01-01 00:00:00'
  },
  {
    id: '3',
    employeeNo: 'EMP003',
    name: '张三',
    phone: '13800000003',
    role: EmployeeRole.WORKER,
    department: '生产部',
    workshopId: '1',
    workshopName: '裁剪车间',
    position: '裁剪工',
    status: 'active',
    createTime: '2023-01-01 00:00:00'
  },
  {
    id: '4',
    employeeNo: 'EMP004',
    name: '李四',
    phone: '13800000004',
    role: EmployeeRole.WORKER,
    department: '生产部',
    workshopId: '2',
    workshopName: '缝纫车间',
    position: '缝纫工',
    status: 'active',
    createTime: '2023-01-01 00:00:00'
  },
  {
    id: '5',
    employeeNo: 'EMP005',
    name: '王五',
    phone: '13800000005',
    role: EmployeeRole.QUALITY,
    department: '质检部',
    workshopId: '3',
    workshopName: '质检车间',
    position: '质检员',
    status: 'active',
    createTime: '2023-01-01 00:00:00'
  }
]

// ===================== 模拟库存数据 =====================
export const mockInventory: Inventory[] = [
  {
    id: '1',
    materialId: '1',
    materialName: '纯棉布料',
    materialNo: 'MAT001',
    category: '布料',
    unit: '米',
    currentStock: 5000,
    minStock: 1000,
    maxStock: 10000,
    location: 'A区-1号仓库',
    updateTime: '2024-01-08 10:00:00'
  },
  {
    id: '2',
    materialId: '2',
    materialName: '纽扣',
    materialNo: 'MAT002',
    category: '辅料',
    unit: '个',
    currentStock: 50000,
    minStock: 10000,
    maxStock: 100000,
    location: 'B区-2号仓库',
    updateTime: '2024-01-08 10:00:00'
  },
  {
    id: '3',
    materialId: '3',
    materialName: '雪纺布料',
    materialNo: 'MAT003',
    category: '布料',
    unit: '米',
    currentStock: 3000,
    minStock: 500,
    maxStock: 5000,
    location: 'A区-1号仓库',
    updateTime: '2024-01-08 10:00:00'
  }
]

// ===================== 模拟首页统计数据 =====================
export const mockDashboardStats: DashboardStats = {
  todayOrders: 15,
  todayProduction: 850,
  todaySales: 28500,
  pendingOrders: 3,
  pendingTasks: 2,
  pendingQuality: 1,
  workshopStatus: [
    {
      workshopId: '1',
      workshopName: '裁剪车间',
      status: 'working',
      currentTasks: 2,
      completedToday: 320
    },
    {
      workshopId: '2',
      workshopName: '缝纫车间',
      status: 'working',
      currentTasks: 1,
      completedToday: 180
    },
    {
      workshopId: '3',
      workshopName: '质检车间',
      status: 'idle',
      currentTasks: 0,
      completedToday: 150
    }
  ]
}




