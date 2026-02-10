import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticateApiKey } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// 聊天完成API（兼容OpenAI格式）
router.post('/completions', authenticateApiKey, async (req, res) => {
  try {
    const { messages, model = 'gpt-3.5-turbo', stream = false } = req.body;

    // 獲取可用的供應商
    const provider = await prisma.provider.findFirst({
      where: { type: 'chat', status: 'active' },
      orderBy: { priority: 'desc' }
    });

    if (!provider) {
      return res.status(503).json({ error: 'No provider available' });
    }

    // 調用供應商API
    const response = await axios.post(
      `${provider.endpoint}/chat/completions`,
      { messages, model, stream },
      {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 計算使用量
    const tokensUsed = response.data.usage?.total_tokens || 0;
    const cost = tokensUsed * 0.000002; // 簡化計費

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
          serviceType: 'chat',
          tokensUsed,
          cost
        }
      })
    ]);

    res.json(response.data);
  } catch (error) {
    console.error('Chat API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message
    });
  }
});

export default router;
