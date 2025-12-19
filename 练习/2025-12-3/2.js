// ========== 消息总线实现 ==========
class EventBus {
  constructor() {
    // 存储所有事件监听器：{ eventName: [listener1, listener2, ...] }
    this.events = {};
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // 返回取消订阅的函数（方便使用）
    return () => this.off(eventName, callback);
  }

  // 取消订阅
  off(eventName, callback) {
    if (!this.events[eventName]) return;

    this.events[eventName] = this.events[eventName].filter(
      (cb) => cb !== callback
    );

    // 如果没有监听器了，删除这个事件
    if (this.events[eventName].length === 0) {
      delete this.events[eventName];
    }
  }

  // 发布事件（触发所有监听器）
  emit(eventName, data) {
    if (!this.events[eventName]) {
      console.warn(`事件 "${eventName}" 没有监听器`);
      return;
    }

    // 调用所有监听器
    this.events[eventName].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件 "${eventName}" 的监听器执行出错:`, error);
      }
    });
  }

  // 只订阅一次（触发后自动取消）
  once(eventName, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }

  // 清除所有事件
  clear() {
    this.events = {};
  }

  // 获取所有事件名
  getEventNames() {
    return Object.keys(this.events);
  }
}

// 创建全局消息总线实例
const eventBus = new EventBus();

// ========== Demo 1: 跨组件通信 ==========
console.log("=== Demo 1: 跨组件通信 ===");

// 模拟组件 A（发布者）
const ComponentA = {
  sendMessage: () => {
    eventBus.emit("user:login", {
      userId: "123",
      username: "张三",
    });
    console.log("✅ 组件A：发送了登录消息");
  },
};

// 模拟组件 B（订阅者）
const ComponentB = {
  init: () => {
    eventBus.on("user:login", (data) => {
      console.log("📨 组件B：收到登录消息", data);
    });
    console.log("✅ 组件B：已订阅登录消息");
  },
};

// 模拟组件 C（订阅者）
const ComponentC = {
  init: () => {
    eventBus.on("user:login", (data) => {
      console.log("📨 组件C：收到登录消息，更新用户信息", data);
    });
    console.log("✅ 组件C：已订阅登录消息");
  },
};

// 初始化组件
ComponentB.init();
ComponentC.init();

// 组件 A 发送消息
setTimeout(() => {
  ComponentA.sendMessage();
}, 1000);

// ========== Demo 2: 一次性订阅 ==========
console.log("\n=== Demo 2: 一次性订阅 ===");

eventBus.once("app:init", (data) => {
  console.log("📨 应用初始化完成（只执行一次）", data);
});

// 第一次触发
eventBus.emit("app:init", { version: "1.0.0" });

// 第二次触发（不会执行，因为已经自动取消订阅）
setTimeout(() => {
  eventBus.emit("app:init", { version: "1.0.0" });
  console.log("⏭️ 第二次触发不会执行（已自动取消订阅）");
}, 500);

// ========== Demo 3: 取消订阅 ==========
console.log("\n=== Demo 3: 取消订阅 ===");

const handler1 = (data) => console.log("📨 处理器1:", data);
const handler2 = (data) => console.log("📨 处理器2:", data);

eventBus.on("test:event", handler1);
eventBus.on("test:event", handler2);

console.log("✅ 订阅了两个处理器");

// 触发事件（两个处理器都会执行）
eventBus.emit("test:event", { message: "第一次触发" });

// 取消 handler1
eventBus.off("test:event", handler1);
console.log("✅ 已取消处理器1");

// 再次触发（只有 handler2 执行）
eventBus.emit("test:event", { message: "第二次触发" });

// ========== Demo 4: 使用返回的取消函数 ==========
console.log("\n=== Demo 4: 使用返回的取消函数 ===");

const unsubscribe = eventBus.on("cleanup:test", (data) => {
  console.log("📨 收到消息:", data);
});

eventBus.emit("cleanup:test", { message: "第一次" });

// 使用返回的函数取消订阅
unsubscribe();
console.log("✅ 已取消订阅");

eventBus.emit("cleanup:test", { message: "第二次（不会执行）" });

// ========== Demo 5: 浏览器原生自定义事件 ==========
console.log("\n=== Demo 5: 浏览器原生自定义事件 ===");

const container = document.createElement("div");
container.id = "custom-event-demo";
container.style.cssText =
  "padding: 20px; background: #f0f0f0; border: 2px solid #333; margin-top: 20px;";

const button = document.createElement("button");
button.textContent = "触发自定义事件";
button.style.cssText = "padding: 10px 20px; font-size: 16px;";

const info = document.createElement("div");
info.style.cssText = "margin-top: 10px; font-size: 14px; color: #333;";

container.appendChild(button);
container.appendChild(info);
document.body.appendChild(container);

// 监听自定义事件
container.addEventListener("myCustomEvent", (e) => {
  info.textContent = `收到自定义事件: ${e.detail.message}`;
  console.log("📨 原生自定义事件:", e.detail);
});

// 点击按钮触发自定义事件
button.addEventListener("click", () => {
  const customEvent = new CustomEvent("myCustomEvent", {
    detail: { message: "Hello from CustomEvent!" },
  });
  container.dispatchEvent(customEvent);
});

// ========== Demo 6: 微前端通信场景 ==========
console.log("\n=== Demo 6: 微前端通信场景 ===");

// 模拟主应用
const MainApp = {
  init: () => {
    // 监听子应用的消息
    eventBus.on("subapp:ready", (data) => {
      console.log("📨 主应用：收到子应用就绪消息", data);
    });

    eventBus.on("subapp:data", (data) => {
      console.log("📨 主应用：收到子应用数据", data);
    });
  },

  sendToSubApp: () => {
    eventBus.emit("mainapp:config", {
      theme: "dark",
      apiUrl: "https://api.example.com",
    });
    console.log("✅ 主应用：向子应用发送配置");
  },
};

// 模拟子应用
const SubApp = {
  init: () => {
    // 监听主应用的消息
    eventBus.on("mainapp:config", (config) => {
      console.log("📨 子应用：收到主应用配置", config);
      // 应用配置后，通知主应用
      eventBus.emit("subapp:ready", {
        appId: "subapp-1",
        status: "ready",
      });
    });

    // 子应用发送数据
    setTimeout(() => {
      eventBus.emit("subapp:data", {
        userId: "123",
        data: { count: 100 },
      });
    }, 1000);
  },
};

MainApp.init();
SubApp.init();

// 主应用发送配置
setTimeout(() => {
  MainApp.sendToSubApp();
}, 500);

console.log("\n✅ 所有 Demo 已创建！");
console.log("📝 操作提示：");
console.log("1. 查看控制台，观察消息传递");
console.log('2. 点击"触发自定义事件"按钮，体验原生自定义事件');
console.log("3. 观察不同组件之间的解耦通信");
