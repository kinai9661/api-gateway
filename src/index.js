import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import apiKeyRoutes from './routes/apiKeys.js';
import chatRoutes from './routes/chat.js';
import imageRoutes from './routes/image.js';
import adminRoutes from './routes/admin.js';
import modelsRoutes from './routes/models.js';
import { errorHandler } from './middleware/errorHandler.js';
import modelDiscovery from './services/modelDiscovery.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/models', modelsRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

// 啟動服務器
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  
  // 啟動後自動發現模型
  if (process.env.AUTO_DISCOVER_MODELS === 'true') {
    console.log('🔍 Starting automatic model discovery...');
    modelDiscovery.discoverAllModels().catch(err => {
      console.error('Model discovery failed:', err.message);
    });
  }
  
  // 設置定時自動更新（每 24 小時）
  const autoUpdateInterval = process.env.MODEL_UPDATE_INTERVAL || 24 * 60 * 60 * 1000; // 默認 24 小時
  if (process.env.AUTO_UPDATE_MODELS === 'true') {
    console.log(`⏰ Scheduled model update every ${autoUpdateInterval / 1000 / 60 / 60} hours`);
    setInterval(() => {
      console.log('🔄 Running scheduled model update...');
      modelDiscovery.discoverAllModels().catch(err => {
        console.error('Scheduled model update failed:', err.message);
      });
    }, autoUpdateInterval);
  }
});
