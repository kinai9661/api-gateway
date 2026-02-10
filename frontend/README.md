# API Gateway - 前端介面

React + Vite 前端管理介面，用於管理 API Gateway 系統。

## 功能特性

- 🔐 用戶登入/註冊
- 📊 儀表板 - 統計數據概覽
- 🔑 API Key 管理 - 創建、查看、刪除、啟用/停用
- 🏢 供應商管理 - 添加、編輯、刪除 API 供應商
- 📝 使用記錄 - 查看 API 調用歷史和統計

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發服務器

```bash
npm run dev
```

前端將在 `http://localhost:5173` 運行，並自動代理 API 請求到後端 `http://localhost:3000`。

### 3. 構建生產版本

```bash
npm run build
```

構建後的文件將在 `dist` 目錄中。

### 4. 預覽生產構建

```bash
npm run preview
```

## 專案結構

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx       # 主佈局組件（側邊欄）
│   ├── pages/
│   │   ├── Login.jsx        # 登入頁面
│   │   ├── Register.jsx     # 註冊頁面
│   │   ├── Dashboard.jsx    # 儀表板
│   │   ├── ApiKeys.jsx      # API Key 管理
│   │   ├── Providers.jsx    # 供應商管理
│   │   └── UsageLogs.jsx    # 使用記錄
│   ├── App.jsx              # 主應用組件
│   ├── main.jsx             # 入口文件
│   └── index.css            # 全局樣式
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置
└── package.json             # 依賴配置
```

## 部署到 Zeabur

### 方法 1: 使用 Zeabur 靜態網站服務

1. 構建前端：
```bash
npm run build
```

2. 在 Zeabur 創建新的 Prebuilt Service
3. 上傳 `dist` 目錄或連接 GitHub 倉庫
4. 配置環境變量（如需要）

### 方法 2: 與後端一起部署

修改後端的 `src/index.js` 添加靜態文件服務：

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 在路由之前添加
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 在所有路由之後添加 SPA 支持
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

## 環境變量

開發環境通過 Vite 代理自動處理 API 請求。生產環境需要配置 API 基礎 URL：

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

## 技術棧

- **React 18** - UI 框架
- **Vite** - 構建工具
- **React Router** - 路由管理
- **Axios** - HTTP 客戶端
- **CSS Modules** - 樣式管理

## 開發說明

### 添加新頁面

1. 在 `src/pages/` 創建新組件
2. 在 `src/App.jsx` 添加路由
3. 在 `src/components/Layout.jsx` 添加導航項目

### API 調用

使用 Axios 並自動添加認證 token：

```javascript
import axios from 'axios'

const token = localStorage.getItem('token')
const response = await axios.get('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` }
})
```

## 瀏覽器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
