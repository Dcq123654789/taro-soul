export default defineAppConfig({
  pages: [
    "pages/login/index",
    "pages/index/index",
    "pages/shop/index",
    "pages/hall/index",
    "pages/profile/index",
    "pages/order-detail/index",
    "pages/profile/agreement/index",
    "pages/profile/privacy/index",
    "pages/profile/personal-info/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#666666",
    selectedColor: "#07C160",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "assets/images/tabbar/home.png",
        selectedIconPath: "assets/images/tabbar/home-active.png",
      },
      {
        pagePath: "pages/hall/index",
        text: "数据列表",
        iconPath: "assets/images/tabbar/home.png",
        selectedIconPath: "assets/images/tabbar/home-active.png",
      },
      {
        pagePath: "pages/shop/index",
        text: "材料库",
        iconPath: "assets/images/tabbar/home.png",
        selectedIconPath: "assets/images/tabbar/home-active.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "个人中心",
        iconPath: "assets/images/tabbar/home.png",
        selectedIconPath: "assets/images/tabbar/home-active.png",
      },
    ],
  },
});
