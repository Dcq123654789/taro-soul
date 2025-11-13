# React 组件渲染和更新过程详解

## 概述

React 的渲染和更新过程可以比作**建房子的过程**：
1. **初始化** = 准备材料和设计图纸
2. **渲染** = 根据图纸搭建框架
3. **协调** = 对比新旧图纸，找出需要修改的地方
4. **提交** = 实际修改房子
5. **清理** = 收拾工具，准备下次施工

---

## 详细阶段说明

### 1. 初始化阶段（Initialization）

**什么时候发生？**
- 组件首次挂载时（如页面刚加载）
- 组件状态或属性更新时（如你点击按钮改变 `activeRange`）

**发生了什么？**
```javascript
// 你的代码中，当组件首次渲染时：
export default function Index() {
  const [activeRange, setActiveRange] = useState<'week' | 'month' | 'year'>('week')
  // ↑ React 会创建这个组件的 Fiber 节点，并初始化 Hooks 链表
}
```

**React 内部做了什么？**
- 创建 **Fiber 树**（React 内部用来表示组件树的数据结构）
- 创建 **Hooks 链表**（存储 `useState`、`useMemo` 等 Hook 的状态）
- 将更新任务加入调度队列

**类比**：就像准备建房子，先准备好所有材料和工具清单。

---

### 2. 渲染阶段（Render Phase）

**什么时候发生？**
- 调度器开始执行任务时

**发生了什么？**
```javascript
// React 会执行你的组件函数：
export default function Index() {
  // 1. 执行 useState，获取当前状态
  const [activeRange, setActiveRange] = useState('week')
  
  // 2. 执行 useMemo，计算值
  const summaryData = useMemo(() => ({ ... }), [])
  
  // 3. 执行组件函数体，生成 JSX
  return (
    <View>
      {/* 这就是新的虚拟 DOM */}
    </View>
  )
}
```

**React 内部做了什么？**
- 调用 `beginWork`，递归处理每个 Fiber 节点
- 对于函数组件，调用 `renderWithHooks`，执行组件函数
- 生成新的**虚拟 DOM**（JSX 转换后的对象结构）

**类比**：根据设计图纸，搭建房子的框架结构。

**重要特点**：
- 这个阶段是**可中断的**（React 18 的并发特性）
- 不会直接修改真实 DOM
- 可以安全地多次执行（幂等性）

---

### 3. 协调阶段（Reconciliation / Diff）

**什么时候发生？**
- 新的虚拟 DOM 生成后

**发生了什么？**
```javascript
// 假设你点击了按钮，activeRange 从 'week' 变为 'month'
onClick={() => setActiveRange('month')}

// React 会对比：
// 旧的虚拟 DOM：显示周数据
// 新的虚拟 DOM：显示月数据
// 找出哪些节点需要更新
```

**React 内部做了什么？**
- 调用 `reconcileChildren`，对比新旧 Fiber 节点
- 使用 **Diff 算法**，找出差异
- 为需要更新的节点打上标记：
  - `Placement`：需要插入新节点
  - `Update`：需要更新现有节点
  - `Deletion`：需要删除节点

**在你的代码中：**
```javascript
// 当 activeRange 改变时：
const summaryList = summaryData[activeRange]  // 数据变了
const series = chartSeries[activeRange]        // 数据变了

// React 会标记：
// - summaryList.map() 生成的 View 节点需要更新
// - series.map() 生成的图表节点需要更新
```

**类比**：对比新旧图纸，用红笔标出需要修改的地方。

**Diff 算法策略**：
- 只比较同层节点（不跨层比较）
- 通过 `key` 属性识别节点（你的代码中使用了 `key={item.label}`）
- 尽量复用节点，减少 DOM 操作

---

### 4. 提交阶段（Commit Phase）

**什么时候发生？**
- 协调阶段完成后

**发生了什么？**
```javascript
// React 会根据标记，实际修改 DOM：
// 1. 删除旧的节点
// 2. 插入新的节点
// 3. 更新现有节点的属性
```

**React 内部做了什么？**
- 调用 `commitRoot`，开始提交更新
- 调用 `commitWork`，递归处理 Fiber 节点
- 根据标记执行 DOM 操作：
  - 插入新元素
  - 更新元素属性（如 `style`、`onClick`）
  - 删除元素
- 调用生命周期钩子（如 `componentDidMount`、`componentDidUpdate`）
- 执行副作用（如 `useEffect`）

**在你的代码中：**
```javascript
// 当 activeRange 从 'week' 变为 'month' 时：
// 1. React 会更新 summaryList.map() 生成的 View 内容
// 2. 更新图表的高度和标签
// 3. 更新按钮的激活状态（backgroundColor、color）
```

**类比**：实际动手修改房子，把标记的地方改好。

**重要特点**：
- 这个阶段是**不可中断的**（必须一次性完成）
- 会直接修改真实 DOM
- 用户可以看到变化

---

### 5. 清理阶段（Cleanup Phase）

**什么时候发生？**
- 提交阶段完成后

**发生了什么？**
```javascript
// React 会清理临时变量，准备下一次更新
```

**React 内部做了什么？**
- 重置全局变量（如 `currentlyRenderingFiber`、`currentHook`）
- 清理上下文和副作用
- 准备下一次更新

**类比**：收拾工具，清理现场，准备下次施工。

---

## 完整流程示例

以你的代码为例，当用户点击"月"按钮时：

```javascript
// 1. 初始化阶段
setActiveRange('month')  // 触发更新

// 2. 渲染阶段
// React 重新执行 Index 组件函数
const [activeRange, setActiveRange] = useState('month')  // 新值
const summaryList = summaryData['month']  // 新数据
const series = chartSeries['month']       // 新数据
// 生成新的 JSX

// 3. 协调阶段
// React 对比新旧 JSX，发现：
// - summaryList.map() 的 View 内容变了
// - series.map() 的图表数据变了
// - 按钮的激活状态变了
// 标记这些节点需要更新

// 4. 提交阶段
// React 实际修改 DOM：
// - 更新统计数字（286 → 1310）
// - 更新图表高度和标签
// - 更新按钮样式（激活状态）

// 5. 清理阶段
// React 清理临时变量，准备下次更新
```

---

## 关键概念

### Fiber 树
- React 内部用来表示组件树的数据结构
- 每个组件、DOM 节点都对应一个 Fiber 节点
- 包含组件的状态、属性、子节点等信息

### 虚拟 DOM
- JSX 转换后的 JavaScript 对象
- 描述 UI 的结构，但不直接操作真实 DOM
- 通过对比虚拟 DOM 找出需要更新的部分

### Diff 算法
- React 用来对比新旧虚拟 DOM 的算法
- 通过 `key` 属性识别节点
- 尽量复用节点，提高性能

### Hooks 链表
- 函数组件中所有 Hooks 的状态存储
- 按照调用顺序排列
- 这就是为什么 Hooks 必须在顶层调用，不能放在条件语句中

---

## 性能优化建议

基于这个流程，你可以这样优化：

1. **使用 `useMemo` 和 `useCallback`**（你已经用了）
   ```javascript
   const summaryData = useMemo(() => ({ ... }), [])
   // 避免每次渲染都重新计算
   ```

2. **给列表项添加稳定的 `key`**（你已经做了）
   ```javascript
   {summaryList.map((item) => (
     <View key={item.label}>  // 稳定的 key
   ))}
   ```

3. **避免在渲染阶段做副作用**
   ```javascript
   // ❌ 不好：在渲染阶段修改 DOM
   document.title = '新标题'
   
   // ✅ 好：在 useEffect 中做
   useEffect(() => {
     document.title = '新标题'
   }, [])
   ```

---

## 总结

React 的渲染和更新过程是一个**两阶段提交**的过程：

1. **渲染阶段**（可中断）：生成新的虚拟 DOM，找出差异
2. **提交阶段**（不可中断）：实际修改 DOM，执行副作用

这种设计的好处：
- **性能优化**：可以中断渲染，优先处理高优先级任务
- **用户体验**：避免阻塞主线程，保持界面流畅
- **可预测性**：通过虚拟 DOM 和 Diff 算法，确保更新的一致性

