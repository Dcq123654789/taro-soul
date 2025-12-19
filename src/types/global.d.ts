declare global {
  var scope: typeof import("../utils/scope").default;
}

export {};

/*
  生成逻辑：通过声明合并扩展 global，令 TS 识别 globalThis.scope，方便各页面直接访问全局工具。
  依赖技术：TypeScript 声明文件、declare global 语法、模块导入类型引用。
*/

