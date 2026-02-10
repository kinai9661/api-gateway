import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (err) {
      setError(err.response?.data?.error || '無法載入統計數據')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>儀表板</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '5px' }}>
            {stats?.totalUsers || 0}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>總用戶數</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔑</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>
            {stats?.totalApiKeys || 0}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>API Keys</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏢</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '5px' }}>
            {stats?.totalProviders || 0}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>供應商</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '5px' }}>
            {stats?.totalRequests || 0}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>總請求數</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>使用量概覽</h3>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#6b7280' }}>總 Tokens 使用</span>
              <span style={{ fontWeight: 'bold' }}>{stats?.totalTokens || 0}</span>
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '65%', height: '100%', background: '#3b82f6' }}></div>
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#6b7280' }}>聊天請求</span>
              <span style={{ fontWeight: 'bold' }}>{stats?.chatRequests || 0}</span>
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', background: '#10b981' }}></div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#6b7280' }}>圖片生成</span>
              <span style={{ fontWeight: 'bold' }}>{stats?.imageRequests || 0}</span>
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '30%', height: '100%', background: '#f59e0b' }}></div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>成本概覽</h3>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#6b7280' }}>總成本</span>
              <span style={{ fontWeight: 'bold', color: '#ef4444' }}>${stats?.totalCost || 0}</span>
            </div>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#6b7280' }}>平均每次請求</span>
              <span style={{ fontWeight: 'bold' }}>${stats?.avgCostPerRequest || 0}</span>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#6b7280' }}>本月成本</span>
              <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>${stats?.monthlyCost || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>快速操作</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">創建 API Key</button>
          <button className="btn btn-success">添加供應商</button>
          <button className="btn btn-secondary">查看報告</button>
        </div>
      </div>
    </div>
  )
}
