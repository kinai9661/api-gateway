import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 管理員登入（使用環境變量密碼）
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(500).json({ error: 'Admin password not configured' });
    }

    // 直接比較明文密碼
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { role: 'admin', email: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: 'admin',
        email: 'admin',
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
