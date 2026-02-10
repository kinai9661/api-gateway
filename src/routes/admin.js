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
    const [totalUsers, totalKeys, totalUsage, recentLogs] = await Promise.all([
      prisma.user.count(),
      prisma.apiKey.count(),
      prisma.usageLog.aggregate({
        _sum: { tokensUsed: true, cost: true }
      }),
      prisma.usageLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          apiKey: { select: { name: true, user: { select: { email: true } } } },
          provider: { select: { name: true } }
        }
      })
    ]);

    res.json({
      totalUsers,
      totalKeys,
      totalTokensUsed: totalUsage._sum.tokensUsed || 0,
      totalCost: totalUsage._sum.cost || 0,
      recentLogs
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

export default router;
