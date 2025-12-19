# React 前端开发常见面试题

## 📝 一、React 基础题

### 1. React 组件通信方式有哪些？

**答案：**
1. **Props**：父组件向子组件传递数据
2. **回调函数**：子组件向父组件传递数据
3. **Context API**：跨层级组件通信
4. **状态管理库**：Redux、Zustand、MobX 等
5. **事件总线**：EventEmitter（不推荐）
6. **Ref**：父组件直接调用子组件方法

**示例代码：**
```tsx
// 1. Props 传递
function Parent() {
  const [data, setData] = useState('hello');
  return <Child data={data} />;
}

// 2. 回调函数
function Parent() {
  const handleChildData = (data) => {
    console.log(data);
  };
  return <Child onDataChange={handleChildData} />;
}

// 3. Context API
const MyContext = createContext();
function Parent() {
  return (
    <MyContext.Provider value={{ data: 'hello' }}>
      <Child />
    </MyContext.Provider>
  );
}
```

---

### 2. useState 和 useReducer 的区别？

**答案：**
- **useState**：适合简单的状态管理，单个状态值
- **useReducer**：适合复杂的状态逻辑，多个相关状态，状态更新逻辑复杂

**示例代码：**
```tsx
// useState
const [count, setCount] = useState(0);

// useReducer
const initialState = { count: 0 };
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}
const [state, dispatch] = useReducer(reducer, initialState);
```

---

### 3. useEffect 的依赖项数组的作用？

**答案：**
- **空数组 []**：只在组件挂载和卸载时执行一次
- **有依赖项 [dep1, dep2]**：依赖项变化时执行
- **无依赖项**：每次渲染都执行
- **注意**：依赖项应该是稳定的引用，避免使用对象字面量

**示例代码：**
```tsx
// 只在挂载时执行
useEffect(() => {
  console.log('组件挂载');
  return () => {
    console.log('组件卸载');
  };
}, []);

// 依赖项变化时执行
useEffect(() => {
  console.log('count 变化了', count);
}, [count]);

// 错误示例：依赖项不稳定
useEffect(() => {
  // 每次渲染都会执行，因为 {} 每次都是新对象
}, [{ name: 'test' }]);
```

---

### 4. 什么是虚拟 DOM？为什么需要虚拟 DOM？

**答案：**
虚拟 DOM 是 React 用 JavaScript 对象模拟真实 DOM 的树形结构。

**优势：**
1. **性能优化**：通过 diff 算法找出最小变更，批量更新 DOM
2. **跨平台**：可以渲染到不同平台（Web、Native、Canvas）
3. **声明式编程**：开发者只需关注数据，不需要手动操作 DOM

**工作原理：**
1. 状态变化时，创建新的虚拟 DOM 树
2. 对比新旧虚拟 DOM 树（diff 算法）
3. 找出差异，批量更新真实 DOM

---

### 5. React 的 diff 算法原理？

**答案：**
React 的 diff 算法基于三个假设：
1. **不同类型的元素会产生不同的树**：如果根节点类型不同，直接替换整个树
2. **可以通过 key 来标识哪些子元素是稳定的**：key 帮助识别哪些元素改变了
3. **同级比较**：只比较同一层级的节点，不跨层级比较

**优化策略：**
- 只比较同层节点
- 使用 key 标识稳定元素
- 组件类型相同时，只更新变化的属性

---

### 6. 受控组件和非受控组件的区别？

**答案：**
- **受控组件**：表单数据由 React 组件状态管理，通过 `value` 和 `onChange` 控制
- **非受控组件**：表单数据由 DOM 自身管理，通过 `ref` 获取值

**示例代码：**
```tsx
// 受控组件
function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// 非受控组件
function UncontrolledInput() {
  const inputRef = useRef(null);
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  return <input ref={inputRef} />;
}
```

---

### 7. React 性能优化的方法？

**答案：**
1. **使用 React.memo**：避免不必要的组件重渲染
2. **useMemo**：缓存计算结果
3. **useCallback**：缓存函数引用
4. **代码分割**：React.lazy 和 Suspense
5. **虚拟滚动**：处理长列表
6. **避免在 render 中创建新对象/函数**
7. **使用 key 优化列表渲染**

**示例代码：**
```tsx
// React.memo
const MemoizedComponent = React.memo(function MyComponent({ name }) {
  return <div>{name}</div>;
});

// useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 代码分割
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

---

## 🎣 二、React Hooks 相关

### 1. 为什么不能在条件语句中使用 Hooks？

**答案：**
React Hooks 依赖于调用顺序来维护状态。如果在条件语句中使用，会导致：
1. Hooks 调用顺序不一致
2. 状态对应关系错乱
3. 可能导致 bug

**错误示例：**
```tsx
// ❌ 错误
function MyComponent() {
  if (condition) {
    const [state, setState] = useState(0); // 违反规则
  }
  return <div>...</div>;
}

// ✅ 正确
function MyComponent() {
  const [state, setState] = useState(0);
  if (condition) {
    // 可以使用 state
  }
  return <div>...</div>;
}
```

---

### 2. useEffect 和 useLayoutEffect 的区别？

**答案：**
- **useEffect**：异步执行，不会阻塞浏览器绘制
- **useLayoutEffect**：同步执行，在 DOM 更新后、浏览器绘制前执行，会阻塞绘制

**使用场景：**
- **useEffect**：大多数场景，如数据获取、订阅
- **useLayoutEffect**：需要同步读取 DOM 布局的场景，如测量元素尺寸

**示例代码：**
```tsx
// useEffect：异步，不阻塞绘制
useEffect(() => {
  // 在浏览器绘制后执行
  document.title = 'New Title';
}, []);

// useLayoutEffect：同步，阻塞绘制
useLayoutEffect(() => {
  // 在浏览器绘制前执行
  const height = elementRef.current.offsetHeight;
  setHeight(height);
}, []);
```

---

### 3. 如何自定义 Hooks？

**答案：**
自定义 Hooks 是以 `use` 开头的函数，可以调用其他 Hooks。

**示例代码：**
```tsx
// 自定义 Hook：获取窗口大小
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// 使用
function MyComponent() {
  const { width, height } = useWindowSize();
  return <div>窗口大小: {width} x {height}</div>;
}
```

---

### 4. useMemo 和 useCallback 的使用场景？

**答案：**
- **useMemo**：缓存计算结果，避免重复计算
- **useCallback**：缓存函数引用，避免子组件不必要的重渲染

**示例代码：**
```tsx
// useMemo：缓存计算结果
function ExpensiveComponent({ a, b }) {
  const result = useMemo(() => {
    // 只有 a 或 b 变化时才重新计算
    return expensiveCalculation(a, b);
  }, [a, b]);

  return <div>{result}</div>;
}

// useCallback：缓存函数引用
function Parent({ items }) {
  const handleClick = useCallback((id) => {
    console.log('点击了', id);
  }, []); // 依赖项为空，函数引用不变

  return (
    <div>
      {items.map(item => (
        <Child key={item.id} onClick={handleClick} />
      ))}
    </div>
  );
}
```

---

## 💻 三、JavaScript 基础题

### 1. 闭包的应用场景？

**答案：**
1. **模块化**：创建私有变量
2. **函数柯里化**
3. **防抖和节流**
4. **事件处理中的状态保存**

**示例代码：**
```javascript
// 1. 模块化
function createCounter() {
  let count = 0; // 私有变量
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

// 2. 防抖
function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// 3. 节流
function throttle(func, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      func.apply(this, args);
      lastTime = now;
    }
  };
}
```

---

### 2. this 指向问题？

**答案：**
`this` 的指向取决于函数的调用方式：
1. **普通函数调用**：`this` 指向全局对象（严格模式下为 undefined）
2. **对象方法调用**：`this` 指向调用该方法的对象
3. **构造函数调用**：`this` 指向新创建的对象
4. **call/apply/bind**：`this` 指向第一个参数
5. **箭头函数**：`this` 指向定义时的上下文

**示例代码：**
```javascript
// 普通函数
function test() {
  console.log(this); // 全局对象或 undefined（严格模式）
}

// 对象方法
const obj = {
  name: 'test',
  getName() {
    console.log(this.name); // 'test'
  }
};

// 箭头函数
const obj2 = {
  name: 'test',
  getName: () => {
    console.log(this.name); // undefined（指向外层作用域）
  }
};
```

---

### 3. Promise 的实现原理？

**答案：**
Promise 是一个状态机，有三种状态：pending、fulfilled、rejected。

**简单实现：**
```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    }
    if (this.state === 'rejected') {
      onRejected(this.reason);
    }
    if (this.state === 'pending') {
      this.onFulfilledCallbacks.push(() => onFulfilled(this.value));
      this.onRejectedCallbacks.push(() => onRejected(this.reason));
    }
  }
}
```

---

### 4. 事件循环机制（Event Loop）？

**答案：**
JavaScript 是单线程的，通过事件循环实现异步。

**执行顺序：**
1. 同步代码执行
2. 微任务队列（Promise.then、queueMicrotask）
3. 宏任务队列（setTimeout、setInterval、I/O）

**示例代码：**
```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 输出：1, 4, 3, 2
```

---

## 🛠️ 四、手写代码题

### 1. 手写防抖（debounce）

```javascript
function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 使用
const handleSearch = debounce((keyword) => {
  console.log('搜索:', keyword);
}, 300);
```

---

### 2. 手写节流（throttle）

```javascript
function throttle(func, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      func.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用
const handleScroll = throttle(() => {
  console.log('滚动事件');
}, 200);
```

---

### 3. 手写深拷贝

```javascript
function deepClone(obj, map = new WeakMap()) {
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }

  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 处理数组和对象
  const cloneObj = Array.isArray(obj) ? [] : {};
  map.set(obj, cloneObj);

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], map);
    }
  }

  return cloneObj;
}
```

---

### 4. 手写数组扁平化

```javascript
// 方法1：递归
function flatten(arr) {
  return arr.reduce((prev, curr) => {
    return prev.concat(Array.isArray(curr) ? flatten(curr) : curr);
  }, []);
}

// 方法2：使用 flat
function flatten(arr) {
  return arr.flat(Infinity);
}

// 方法3：迭代
function flatten(arr) {
  while (arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
  return arr;
}
```

---

### 5. 手写 Promise.all

```javascript
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('参数必须是数组'));
    }

    const results = [];
    let count = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          count++;
          if (count === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
};
```

---

### 6. 手写 call/apply/bind

```javascript
// call
Function.prototype.myCall = function(context, ...args) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// apply
Function.prototype.myApply = function(context, args) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// bind
Function.prototype.myBind = function(context, ...args) {
  const fn = this;
  return function(...newArgs) {
    return fn.apply(context, [...args, ...newArgs]);
  };
};
```

---

## 🎯 五、性能优化相关

### 1. 如何优化首屏加载时间？

**答案：**
1. **代码分割**：使用 React.lazy 和 Suspense
2. **资源压缩**：Gzip、Brotli
3. **CDN 加速**：静态资源使用 CDN
4. **图片优化**：WebP、懒加载、压缩
5. **减少 HTTP 请求**：合并文件、使用雪碧图
6. **预加载**：preload、prefetch
7. **服务端渲染**：SSR（Next.js）

---

### 2. 如何优化长列表渲染？

**答案：**
1. **虚拟滚动**：只渲染可见区域
2. **分页加载**：分批加载数据
3. **使用 React.memo**：避免不必要的重渲染
4. **使用稳定的 key**：避免列表重排

**示例代码：**
```tsx
// 使用 react-window 实现虚拟滚动
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

---

### 3. 防抖和节流的区别和应用？

**答案：**
- **防抖（debounce）**：在事件触发 n 秒后才执行，如果 n 秒内再次触发，则重新计时
  - 应用：搜索框输入、窗口 resize
- **节流（throttle）**：在 n 秒内只执行一次，无论触发多少次
  - 应用：滚动事件、鼠标移动

---

## 📚 六、工程化相关

### 1. Webpack 的构建流程？

**答案：**
1. **初始化**：读取配置，创建 Compiler 对象
2. **编译**：从入口文件开始，递归解析依赖
3. **输出**：将编译后的文件输出到指定目录

**核心概念：**
- Entry：入口
- Output：输出
- Loader：处理非 JS 文件
- Plugin：扩展功能

---

### 2. 如何优化打包体积？

**答案：**
1. **代码分割**：splitChunks
2. **Tree Shaking**：移除未使用的代码
3. **压缩代码**：TerserPlugin
4. **按需加载**：动态 import
5. **外部化依赖**：externals
6. **分析打包结果**：webpack-bundle-analyzer

---

## 💡 七、面试技巧

### 回答问题的思路

1. **理解问题**：确认理解面试官的问题
2. **分析问题**：分析问题的核心和关键点
3. **给出答案**：先给出核心答案，再展开说明
4. **举例说明**：用代码或实际场景说明
5. **总结**：简要总结要点

### 不会的问题怎么办？

1. **诚实回答**：直接说不会，不要猜测
2. **尝试分析**：可以尝试分析问题的思路
3. **展示学习能力**：说明如何学习和解决类似问题
4. **记录问题**：面试后学习补充

---

## 🎓 总结

准备面试需要：
1. **扎实的基础**：理解核心概念
2. **实践能力**：能够手写代码
3. **项目经验**：能够讲解项目
4. **持续学习**：关注新技术

**记住**：面试是双向选择，保持自信，展示真实的自己！





