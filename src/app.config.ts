export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/shop/index',
    'pages/hall/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666666',
    selectedColor: '#07C160',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/hall/index',
        text: '大厅'
      },
      {
        pagePath: 'pages/shop/index',
        text: '商店'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
