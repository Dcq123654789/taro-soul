// ========== 1. 事件捕获/冒泡演示 ==========
// 事件流（Event Flow）包含三个阶段：
// 1. 捕获阶段（Capture Phase）：从 window 到目标元素的路径
// 2. 目标阶段（Target Phase）：事件到达目标元素
// 3. 冒泡阶段（Bubble Phase）：从目标元素回到 window 的路径
// addEventListener 的第三个参数：
// - true：在捕获阶段触发
// - false 或省略：在冒泡阶段触发（默认）
console.log("=== 捕获/冒泡演示 ===");

// 创建容器元素，用于演示事件传播
const container = document.createElement("div");
container.id = "event-demo";
// cssText 属性可以一次性设置多个 CSS 样式，比逐个设置 style.xxx 更高效
container.style.cssText =
  "padding: 20px; background: #f0f0f0; border: 2px solid #333;";

// 创建按钮元素，作为事件的目标元素
const button = document.createElement("button");
button.textContent = "点击我（查看控制台）";
button.style.cssText = "padding: 10px 20px; font-size: 16px;";

// 构建 DOM 结构：document.body -> container -> button
container.appendChild(button);
document.body.appendChild(container);

// 在 document 上注册捕获阶段的事件监听器
// 第三个参数为 true，表示在捕获阶段触发
// 捕获阶段：事件从外层向内层传播，所以 document 会最先捕获到事件
document.addEventListener(
  "click",
  (e) => {
    console.log("1. [捕获] document 捕获到点击");
  },
  true
);

// 在 container 上注册捕获阶段的事件监听器
// 在捕获阶段，container 会在 button 之前接收到事件
container.addEventListener(
  "click",
  (e) => {
    console.log("2. [捕获] container 捕获到点击");
  },
  true
);

// 在 button 上注册事件监听器（默认冒泡阶段）
// 这是目标阶段，事件到达实际被点击的元素
button.addEventListener("click", (e) => {
  console.log("3. [目标] button 被点击（目标阶段）");
});

// 在 container 上注册冒泡阶段的事件监听器
// 第三个参数省略，默认为 false（冒泡阶段）
// 冒泡阶段：事件从内层向外层传播，所以 container 会在 button 之后接收到事件
container.addEventListener("click", (e) => {
  console.log("4. [冒泡] container 冒泡阶段");
});

// 在 document 上注册冒泡阶段的事件监听器
// 第三个参数为 false，明确指定在冒泡阶段触发
// 冒泡阶段的最后一步，document 最后接收到事件
document.addEventListener(
  "click",
  (e) => {
    console.log("5. [冒泡] document 冒泡阶段");
  },
  false
);

// 点击 button 时，控制台输出顺序：
// 1. [捕获] document 捕获到点击
// 2. [捕获] container 捕获到点击
// 3. [目标] button 被点击（目标阶段）
// 4. [冒泡] container 冒泡阶段
// 5. [冒泡] document 冒泡阶段

// ========== 2. 事件委托演示 ==========
// 事件委托（Event Delegation）原理：
// 将事件监听器绑定到父元素上，利用事件冒泡机制，通过 e.target 判断实际触发事件的子元素
// 优势：
// 1. 减少内存占用：只需要一个事件监听器，而不是为每个子元素都绑定
// 2. 动态元素支持：后添加的元素自动拥有事件处理能力，无需重新绑定
// 3. 性能优化：减少事件监听器的数量，提升性能
console.log("\n=== 事件委托演示 ===");

// 创建列表容器
const listContainer = document.createElement("div");
listContainer.id = "delegation-demo";
listContainer.style.cssText =
  "margin-top: 20px; padding: 20px; background: #e8f4f8; border: 2px solid #0ea5e9;";

// 创建无序列表元素
const list = document.createElement("ul");
list.style.cssText = "list-style: none; padding: 0;";

// 循环创建 3 个列表项
// 注意：这里没有为每个 li 单独绑定事件监听器
for (let i = 1; i <= 3; i++) {
  const li = document.createElement("li");
  li.textContent = `列表项 ${i}`;
  li.style.cssText =
    "padding: 10px; margin: 5px 0; background: white; cursor: pointer; border-radius: 4px;";
  // 使用 data-id 属性存储列表项的标识，方便后续识别
  li.setAttribute("data-id", i);
  list.appendChild(li);
}

listContainer.appendChild(list);
document.body.appendChild(listContainer);

// 事件委托的核心实现：
// 只在父元素 list 上绑定一个事件监听器，而不是为每个 li 都绑定
list.addEventListener("click", (e) => {
  // e.target 是实际被点击的元素（可能是 li 或其内部的子元素）
  // closest('li') 方法向上查找最近的 li 祖先元素
  // 这样可以确保即使点击的是 li 内部的元素（如文本节点），也能找到对应的 li
  const li = e.target.closest("li");
  if (li) {
    // 获取列表项的标识
    const id = li.getAttribute("data-id");
    console.log(
      `✅ 事件委托：点击了列表项 ${id}（实际点击的是：${e.target.tagName}）`
    );
    // 修改被点击的列表项样式，提供视觉反馈
    li.style.background = "#10b981";
    li.style.color = "white";
  }
});

// 演示事件委托的优势：动态添加的元素自动拥有事件处理能力
// 2 秒后动态添加一个新的列表项
// 由于使用了事件委托，这个新元素不需要单独绑定事件，就能响应点击
setTimeout(() => {
  const newLi = document.createElement("li");
  newLi.textContent = "列表项 4（动态添加）";
  newLi.style.cssText =
    "padding: 10px; margin: 5px 0; background: white; cursor: pointer; border-radius: 4px;";
  newLi.setAttribute("data-id", "4");
  list.appendChild(newLi);
  console.log("✅ 动态添加了新列表项，它自动有事件处理（因为事件委托）");
}, 2000);

// ========== 3. 防抖函数实现 ==========
// 防抖（Debounce）原理：
// 在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，则重新计时
// 应用场景：搜索框输入、窗口 resize、按钮提交等
// 实现原理：
// 1. 使用闭包保存 timeoutId
// 2. 每次调用时清除之前的定时器
// 3. 重新设置新的定时器
// 4. 只有在指定时间内没有新的调用时，才会执行函数
function debounce(func, delay) {
  // 使用闭包保存定时器 ID，避免被外部访问
  let timeoutId;
  // 返回一个新的函数，这个函数会在调用时执行防抖逻辑
  return function (...args) {
    // 清除之前的定时器，取消之前未执行的函数调用
    clearTimeout(timeoutId);
    // 设置新的定时器，延迟执行函数
    timeoutId = setTimeout(() => {
      // 使用 apply 确保 this 指向正确，并传递所有参数
      func.apply(this, args);
    }, delay);
  };
}

// ========== 4. 节流函数实现 ==========
// 节流（Throttle）原理：
// 规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
// 应用场景：滚动事件、鼠标移动、窗口 resize 等高频事件
// 实现原理：
// 1. 使用闭包保存上次执行的时间
// 2. 每次调用时检查距离上次执行的时间间隔
// 3. 如果间隔大于等于指定时间，则执行函数并更新执行时间
// 4. 如果间隔小于指定时间，则忽略本次调用
function throttle(func, delay) {
  // 使用闭包保存上次执行的时间戳
  let lastTime = 0;
  // 返回一个新的函数，这个函数会在调用时执行节流逻辑
  return function (...args) {
    // 获取当前时间戳
    const now = Date.now();
    // 如果距离上次执行的时间间隔大于等于指定延迟时间，则执行函数
    if (now - lastTime >= delay) {
      // 执行函数，使用 apply 确保 this 指向正确
      func.apply(this, args);
      // 更新上次执行的时间戳
      lastTime = now;
    }
    // 如果时间间隔小于指定延迟，则不执行函数（节流效果）
  };
}

// ========== 5. 防抖/节流实际应用演示 ==========
console.log("\n=== 防抖/节流演示 ===");

// 创建输入框容器
const inputContainer = document.createElement("div");
inputContainer.style.cssText =
  "margin-top: 20px; padding: 20px; background: #fef3c7; border: 2px solid #f59e0b;";

// 创建输入框，用于演示防抖效果
const input = document.createElement("input");
input.type = "text";
input.placeholder = "输入文字测试防抖（延迟500ms）";
input.style.cssText =
  "width: 300px; padding: 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 4px;";

// 创建用于显示防抖执行信息的元素
const debounceInfo = document.createElement("div");
debounceInfo.style.cssText =
  "margin-top: 10px; font-size: 12px; color: #92400e;";

// 创建用于显示节流执行信息的元素
const throttleInfo = document.createElement("div");
throttleInfo.style.cssText =
  "margin-top: 10px; font-size: 12px; color: #92400e;";

inputContainer.appendChild(input);
inputContainer.appendChild(debounceInfo);
inputContainer.appendChild(throttleInfo);
document.body.appendChild(inputContainer);

// 防抖应用：搜索框输入
// 用户快速输入时，不会每次都触发搜索，而是等待用户停止输入 500ms 后才执行
// 这样可以减少不必要的 API 调用，提升性能和用户体验
let debounceCount = 0;
// 使用 debounce 包装搜索函数，延迟 500ms 执行
const debouncedSearch = debounce((value) => {
  debounceCount++;
  // 更新显示信息，展示防抖执行次数和当前输入值
  debounceInfo.textContent = `防抖执行了 ${debounceCount} 次，当前值：${value}`;
  console.log(`🔵 防抖执行：${value}`);
}, 500);

// 监听输入框的 input 事件
// 每次输入都会触发，但 debouncedSearch 会延迟执行
input.addEventListener("input", (e) => {
  // 调用防抖函数，传入当前输入值
  debouncedSearch(e.target.value);
});

// 节流应用：滚动事件
// 滚动时，每 200ms 最多执行一次，避免频繁触发导致性能问题
let throttleCount = 0;
// 使用 throttle 包装滚动处理函数，每 200ms 最多执行一次
const throttledScroll = throttle(() => {
  throttleCount++;
  // 更新显示信息，展示节流执行次数
  throttleInfo.textContent = `节流执行了 ${throttleCount} 次（滚动时每200ms最多一次）`;
  console.log(`🟢 节流执行：${throttleCount}`);
}, 200);

// 监听窗口滚动事件
// 滚动时会频繁触发，但 throttledScroll 会被节流限制
window.addEventListener("scroll", throttledScroll);

// ========== 6. 函数可组合性演示 ==========
// 函数组合（Function Composition）：
// 将多个小函数组合成更复杂的功能，提高代码的可复用性和可维护性
// 在这个例子中，我们将防抖、验证、提交三个功能组合在一起
console.log("\n=== 可组合性演示 ===");

// 创建组合功能演示的容器
const composeContainer = document.createElement("div");
composeContainer.style.cssText =
  "margin-top: 20px; padding: 20px; background: #f3e8ff; border: 2px solid #a855f7;";

// 创建测试按钮
const composeButton = document.createElement("button");
composeButton.textContent = "点击测试可组合性（防抖 + 验证 + 提交）";
composeButton.style.cssText =
  "padding: 10px 20px; font-size: 14px; background: #a855f7; color: white; border: none; border-radius: 4px; cursor: pointer;";

// 创建用于显示组合执行结果的元素
const composeInfo = document.createElement("div");
composeInfo.style.cssText =
  "margin-top: 10px; font-size: 12px; color: #6b21a8;";

composeContainer.appendChild(composeButton);
composeContainer.appendChild(composeInfo);
document.body.appendChild(composeContainer);

// 验证函数：检查数据是否有效
// 这是一个独立的、可复用的函数
const validate = (data) => {
  console.log("✅ 验证通过");
  // 简单验证：数据长度大于 0
  return data.length > 0;
};

// 提交函数：处理数据提交
// 这也是一个独立的、可复用的函数
const submit = (data) => {
  console.log("📤 提交数据：", data);
  // 更新页面显示，模拟提交成功
  composeInfo.textContent = `提交成功：${data}`;
};

// 组合函数：将防抖、验证、提交组合在一起
// 使用 debounce 包装整个处理流程，实现防抖效果
// 在防抖函数内部，先验证数据，验证通过后再提交
// 这种组合方式使得代码更加模块化和可维护
const handleComposed = debounce((value) => {
  // 先验证数据
  if (validate(value)) {
    // 验证通过，执行提交
    submit(value);
  } else {
    // 验证失败，输出错误信息
    console.log("❌ 验证失败");
  }
}, 300);

// 绑定按钮点击事件
composeButton.addEventListener("click", () => {
  // 调用组合函数，传入测试数据
  // 由于使用了防抖，快速连续点击时，只有最后一次点击会在 300ms 后执行
  handleComposed("组合函数测试数据");
});

// ========== 代码生成逻辑与技术原理总结 ==========
// 1. 事件模型：
//    - 依赖技术：DOM 事件流（捕获、目标、冒泡三个阶段）
//    - 原理：事件从 window 开始，经过捕获阶段到达目标元素，再经过冒泡阶段回到 window
//    - 应用：理解事件传播机制，合理使用捕获和冒泡阶段
//
// 2. 事件委托：
//    - 依赖技术：事件冒泡机制、e.target 属性、closest() 方法
//    - 原理：利用事件冒泡，在父元素上统一处理子元素的事件
//    - 优势：减少内存占用、支持动态元素、提升性能
//
// 3. 防抖（Debounce）：
//    - 依赖技术：闭包、setTimeout、clearTimeout
//    - 原理：延迟执行，在指定时间内如果再次触发则重新计时
//    - 应用：搜索框、提交按钮、窗口 resize
//
// 4. 节流（Throttle）：
//    - 依赖技术：闭包、Date.now() 时间戳
//    - 原理：限制执行频率，在指定时间内最多执行一次
//    - 应用：滚动事件、鼠标移动、窗口 resize
//
// 5. 函数组合：
//    - 依赖技术：高阶函数、函数式编程思想
//    - 原理：将多个小函数组合成更复杂的功能
//    - 优势：代码模块化、可复用、易维护

console.log("\n✅ Demo 创建完成！");
console.log("📝 操作提示：");
console.log("1. 点击第一个按钮，查看捕获/冒泡顺序");
console.log("2. 点击列表项，体验事件委托");
console.log("3. 在输入框快速输入，观察防抖效果");
console.log("4. 滚动页面，观察节流效果");
console.log("5. 点击最后一个按钮，体验可组合性");
