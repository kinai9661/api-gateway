# API Gateway - API輸出站系統

一個完整的API網關系統，支持聊天和圖片生成功能，包含API Key管理和供應商管理。

## 功能特性

- 🔐 用戶認證系統（註冊/登入）
- 🔑 API Key管理（生成、配額控制）
- 💬 聊天API（兼容OpenAI格式）
- 🎨 圖片生成API
- 🏢 多供應商管理
- 📊 使用統計和記錄
- 👨‍💼 後台管理系統
- 🖥️ **React 前端管理介面**

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置環境變量

複製 `.env.example` 到 `.env` 並填寫配置：

```bash
cp .env.example .env
```

### 3. 初始化數據庫

```bash
npm run db:push
```

### 4. 構建前端並啟動服務

**生產模式（推薦）：**
```bash
npm run build:start
```

這會自動構建前端並啟動後端服務器，前端和後端在同一個端口運行。

**分步驟：**
```bash
# 構建前端
npm run build

# 啟動服務器
npm start
```

**開發模式（前端和後端分開）：**
```bash
# 終端 1 - 啟動後端
npm run dev

# 終端 2 - 啟動前端開發服務器
cd frontend
npm install
npm run dev
```

### 5. 訪問應用

- **生產模式：** http://localhost:3000
- **開發模式：** http://localhost:5173

## API端點

### 認證
- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入

### API Key管理
- `GET /api/keys` - 獲取API Keys
- `POST /api/keys` - 創建API Key
- `DELETE /api/keys/:id` - 刪除API Key
- `PATCH /api/keys/:id` - 更新API Key

### AI服務（需要API Key）
- `POST /api/v1/chat/completions` - 聊天完成
- `POST /api/v1/images/generations` - 圖片生成

### 管理後台（需要管理員權限）
- `GET /api/admin/providers` - 獲取供應商列表
- `POST /api/admin/providers` - 添加供應商
- `PATCH /api/admin/providers/:id` - 更新供應商
- `DELETE /api/admin/providers/:id` - 刪除供應商
- `GET /api/admin/stats` - 統計數據
- `GET /api/admin/users` - 用戶列表
- `GET /api/admin/usage-logs` - 使用記錄

## 使用示例

### 1. 註冊並獲取Token

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 2. 創建API Key

```bash
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My API Key","quotaLimit":1000000}'
```

### 3. 使用聊天API

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"Hello!"}],
    "model": "gpt-3.5-turbo"
  }'
```

### 4. 使用圖片生成API

```bash
curl -X POST http://localhost:3000/api/v1/images/generations \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset",
    "n": 1,
    "size": "1024x1024"
  }'
```

## 前端介面

本專案包含完整的 React + Vite 前端管理介面，已整合到後端服務器中。

### 訪問前端

**生產模式：**
- 前端和後端在同一個端口運行
- 訪問：http://localhost:3000

**開發模式：**
```bash
cd frontend
npm install
npm run dev
```
前端將在 `http://localhost:5173` 運行（僅用於開發）

### 前端功能

- 📊 儀表板 - 統計數據概覽
- 🔑 API Key 管理 - 創建、查看、刪除、啟用/停用
- 🏢 供應商管理 - 添加、編輯、刪除 API 供應商
- 🤖 模型管理 - 自動發現和刷新模型列表
- 📝 使用記錄 - 查看 API 調用歷史和統計

詳細說明請參考 [`frontend/README.md`](frontend/README.md)

## Zeabur部署

### 1. 準備工作

1. 將代碼推送到GitHub
2. 註冊Zeabur賬號

### 2. 部署步驟

1. 在Zeabur創建新項目
2. 連接GitHub倉庫
3. 添加PostgreSQL服務
4. 配置環境變量（從.env.example複製）
5. 部署完成

### 3. 環境變量配置

在Zeabur中設置以下環境變量：
- `DATABASE_URL` - 自動生成
- `JWT_SECRET` - 隨機字符串
- `OPENAI_API_KEY` - 你的OpenAI API Key
- `OPENAI_BASE_URL` - https://api.openai.com/v1

### 4. 初始化數據庫

部署後，在Zeabur控制台執行：
```bash
npm run db:push
```

### 5. 創建管理員賬號

註冊後，手動在數據庫中將用戶角色改為 `admin`。

## 數據庫管理

查看數據庫：
```bash
npm run db:studio
```

## 技術棧

### 後端
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT認證
- bcryptjs加密

### 前端
- React 18
- Vite
- React Router
- Axios

## 免費方案優化

- 使用Zeabur免費PostgreSQL（512MB）
- 無服務器架構，按需計費
- 實現請求緩存減少數據庫查詢
- API配額限制控制成本

## 安全建議

1. 修改 `JWT_SECRET` 為強隨機字符串
2. 使用HTTPS（Zeabur自動提供）
3. 定期輪換API Keys
4. 設置合理的配額限制
5. 監控異常使用

## 授權

MIT
