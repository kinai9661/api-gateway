import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticateApiKey } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// 圖片生成API
router.post('/generations', authenticateApiKey, async (req, res) => {
  try {
    const { prompt, n = 1, size = '1024x1024', model = 'dall-e-3' } = req.body;

    // 獲取可用的供應商
    const provider = await prisma.provider.findFirst({
      where: { type: 'image', status: 'active' },
      orderBy: { priority: 'desc' }
    });

    if (!provider) {
      return res.status(503).json({ error: 'No provider available' });
    }

    // 調用供應商API
    const response = await axios.post(
      `${provider.endpoint}/images/generations`,
      { prompt, n, size, model },
      {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 計算使用量（圖片生成按次數計費）
    const tokensUsed = n * 1000; // 每張圖片算1000 tokens
    const cost = n * 0.02; // 每張圖片$0.02

    // 更新配額和記錄
    await prisma.$transaction([
      prisma.apiKey.update({
        where: { id: req.apiKey.id },
        data: { quotaUsed: { increment: tokensUsed } }
      }),
      prisma.usageLog.create({
        data: {
          apiKeyId: req.apiKey.id,
          providerId: provider.id,
          serviceType: 'image',
          tokensUsed,
          cost
        }
      })
    ]);

    res.json(response.data);
  } catch (error) {
    console.error('Image API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message
    });
  }
});

export default router;
