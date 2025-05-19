import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // すべてのIPアドレスからの接続を許可
    port: 5173, // 任意（省略可）
  },
});
