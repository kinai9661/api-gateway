import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import modelDiscovery from '../services/modelDiscovery.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 獲取所有可用模型
 */
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const models = await modelDiscovery.getAvailableModels(type);
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 獲取指定供應商的模型
 */
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const models = await prisma.model.findMany({
      where: {
        providerId,
        status: 'active'
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 獲取單個模型詳情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            endpoint: true
          }
        }
      }
    });

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json(model);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 刷新所有供應商的模型（需要管理員權限）
 */
router.post('/refresh', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const models = await modelDiscovery.discoverAllModels();
    res.json({
      message: 'Models refreshed successfully',
      count: models.length,
      models
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 刷新指定供應商的模型（需要管理員權限）
 */
router.post('/refresh/:providerId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { providerId } = req.params;
    const models = await modelDiscovery.refreshProviderModels(providerId);
    res.json({
      message: 'Provider models refreshed successfully',
      count: models.length,
      models
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 更新模型狀態（需要管理員權限）
 */
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const model = await prisma.model.update({
      where: { id },
      data: { status }
    });

    res.json(model);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 刪除模型（需要管理員權限）
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.model.delete({ where: { id } });
    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 獲取模型統計（需要管理員權限）
 */
router.get('/stats/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [totalModels, activeModels, byType, byProvider] = await Promise.all([
      prisma.model.count(),
      prisma.model.count({ where: { status: 'active' } }),
      prisma.model.groupBy({
        by: ['type'],
        _count: true
      }),
      prisma.model.groupBy({
        by: ['providerId'],
        _count: true,
        include: {
          provider: true
        }
      })
    ]);

    // 獲取供應商名稱
    const providerIds = byProvider.map(p => p.providerId);
    const providers = await prisma.provider.findMany({
      where: { id: { in: providerIds } },
      select: { id: true, name: true }
    });

    const providerStats = byProvider.map(p => ({
      providerId: p.providerId,
      providerName: providers.find(pr => pr.id === p.providerId)?.name || 'Unknown',
      count: p._count
    }));

    res.json({
      totalModels,
      activeModels,
      byType: byType.map(t => ({
        type: t.type,
        count: t._count
      })),
      byProvider: providerStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
