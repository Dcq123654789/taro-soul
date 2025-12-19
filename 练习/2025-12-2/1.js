// 创建样式表并定义所需类名
const styleTag = document.createElement("style");
styleTag.textContent = `
  #app {
    padding: 16px;
    background-color: #f4f4f5;
  }

  .demo-title {
    margin-bottom: 8px;
    font-size: 20px;
  }

  .feature-list {
    list-style: none;
    padding-left: 0;
  }

  .list-item {
    margin: 4px 0;
  }
`;
document.head.appendChild(styleTag);

// 创建一个 div 容器
const container = document.createElement("div");
// 设置容器 id 以绑定 CSS
container.id = "app";

// 创建一个 h2 标题
const title = document.createElement("h2");
// 设置标题文本
title.textContent = "DOM API 学习 Demo";
title.className = "demo-title";

// 创建一个 ul 列表
const list = document.createElement("ul");
list.className = "feature-list";

const items = ["节点类型", "节点选择", "节点遍历", "属性更新"];
items.forEach((text, index) => {
  const li = document.createElement("li"); // 元素节点
  li.textContent = `${index + 1}. ${text}`; // 文本
  li.className = "list-item";
  list.appendChild(li); // 插入子节点
});
// 将标题和列表添加到容器中
container.appendChild(title);
container.appendChild(list);

// 将容器添加到 body 中
document.body.appendChild(container);
// 代码生成逻辑说明：
// 1. 通过 document.createElement 创建真实 DOM 节点并设置 className。
// 2. 使用 style 标签集中定义 CSS，体现结构与样式分离的原理。
// 3. 依赖浏览器 DOM API 与 CSS 选择器渲染页面。
