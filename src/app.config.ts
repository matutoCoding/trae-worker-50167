export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/course/index',
    'pages/booking/index',
    'pages/queue/index',
    'pages/profile/index',
    'pages/course-detail/index',
    'pages/booking-detail/index',
    'pages/cycle-edit/index',
    'pages/take-number/index',
    'pages/caddie/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2E7D32',
    navigationBarTitleText: '高尔夫球会',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F1F8E9'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2E7D32',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/course/index',
        text: '球道'
      },
      {
        pagePath: 'pages/booking/index',
        text: '预订'
      },
      {
        pagePath: 'pages/queue/index',
        text: '叫号'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
