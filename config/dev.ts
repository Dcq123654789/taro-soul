import type { UserConfigExport } from "@tarojs/cli"

export default {
  mini: {},
  h5: {
    devServer: {
      proxy: {
        '/api': {
          target: 'http://localhost:8888',
          // target: 'http://115.29.225.147:8888',
          changeOrigin: true,
          // 对于 Vite 代理，若后端同样以 /api 开头则无需重写
          // 若需要改写，可启用下面一行（例：去掉前缀）
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
} satisfies UserConfigExport<'vite'>
