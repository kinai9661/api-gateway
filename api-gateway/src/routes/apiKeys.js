import express from 'express';
import { nanoid } from 'nanoid';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// 獲取用戶的API Keys
router.get('/', authenticateToken, async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        key: true,
        name: true,
        quotaLimit: true,
        quotaUsed: true,
        status: true,
        createdAt: true
      }
    });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 創建新的API Key
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, quotaLimit } = req.body;
    const key = `sk-${nanoid(48)}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: req.user.userId,
        key,
        name: name || 'Default Key',
        quotaLimit: quotaLimit || 1000000
      }
    });

    res.json(apiKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 刪除API Key
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.apiKey.delete({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });
    res.json({ message: 'API key deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新API Key狀態
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { status, quotaLimit } = req.body;
    const apiKey = await prisma.apiKey.update({
      where: {
        id: req.params.id,
        userId: req.user.userId
      },
      data: { status, quotaLimit }
    });
    res.json(apiKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
