import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import scope from './utils/scope'

import './app.scss'
import '@nutui/nutui-react-taro/dist/style.css'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
    // 挂载全局工具
    // 不改变渲染，仅提供全局访问方式：globalThis.scope.xxx
    ;(globalThis as any).scope = scope
  })

  // children 是将要会渲染的页面
  return children
}
  


export default App
