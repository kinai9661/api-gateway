import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// 獲取所有供應商
router.get('/providers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const providers = await prisma.provider.findMany();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加供應商
router.post('/providers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, type, apiKey, endpoint, priority } = req.body;
    const provider = await prisma.provider.create({
      data: { name, type, apiKey, endpoint, priority: priority || 0 }
    });
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新供應商
router.patch('/providers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const provider = await prisma.provider.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 刪除供應商
router.delete('/providers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.provider.delete({ where: { id: req.params.id } });
    res.json({ message: 'Provider deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 統計數據
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalApiKeys, totalProviders, totalUsage, chatUsage, imageUsage] = await Promise.all([
      prisma.user.count(),
      prisma.apiKey.count(),
      prisma.provider.count(),
      prisma.usageLog.aggregate({
        _sum: { tokensUsed: true, cost: true },
        _count: true
      }),
      prisma.usageLog.aggregate({
        where: { serviceType: 'chat' },
        _count: true
      }),
      prisma.usageLog.aggregate({
        where: { serviceType: 'image' },
        _count: true
      })
    ]);

    res.json({
      totalUsers,
      totalApiKeys,
      totalProviders,
      totalRequests: totalUsage._count,
      totalTokens: totalUsage._sum.tokensUsed || 0,
      totalCost: (totalUsage._sum.cost || 0).toFixed(4),
      chatRequests: chatUsage._count,
      imageRequests: imageUsage._count,
      avgCostPerRequest: totalUsage._count > 0
        ? (totalUsage._sum.cost / totalUsage._count).toFixed(4)
        : 0,
      monthlyCost: (totalUsage._sum.cost || 0).toFixed(4)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取所有用戶
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { apiKeys: true } }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取使用記錄
router.get('/usage-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const logs = await prisma.usageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        apiKey: { select: { name: true } },
        provider: { select: { name: true } }
      }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
