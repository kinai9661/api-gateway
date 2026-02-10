import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Models() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ type: 'all', provider: 'all' })
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchModels()
    fetchStats()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/models')
      setModels(response.data)
    } catch (err) {
      setError(err.response?.data?.error || '無法載入模型列表')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/models/stats/summary', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err.message)
    }
  }

  const handleRefreshAll = async () => {
    setRefreshing(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/models/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setModels(response.data.models)
      await fetchStats()
    } catch (err) {
      setError(err.response?.data?.error || '刷新失敗')
    } finally {
      setRefreshing(false)
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/models/${id}`, { status: currentStatus === 'active' ? 'inactive' : 'active' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchModels()
    } catch (err) {
      setError(err.response?.data?.error || '更新失敗')
    }
  }

  const filteredModels = models.filter(model => {
    if (filter.type !== 'all' && model.type !== filter.type) return false
    if (filter.provider !== 'all' && model.providerId !== filter.provider) return false
    return true
  })

  const providers = [...new Set(models.map(m => m.provider))]

  const getModelTypeIcon = (type) => {
    const icons = {
      chat: '💬',
      image: '🎨',
      embedding: '📊',
      audio: '🎵'
    }
    return icons[type] || '🤖'
  }

  const getModelTypeName = (type) => {
    const names = {
      chat: '聊天',
      image: '圖片生成',
      embedding: '嵌入',
      audio: '音頻'
    }
    return names[type] || type
  }

  if (loading) return <div className="loading">載入中...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>模型管理</h1>
        <button
          className="btn btn-primary"
          onClick={handleRefreshAll}
          disabled={refreshing}
        >
          {refreshing ? '🔄 刷新中...' : '🔄 刷新所有模型'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {stats.totalModels}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>總模型數</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {stats.activeModels}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>啟用模型</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {providers.length}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>供應商數</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label className="label">模型類型</label>
            <select
              className="input"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="all">全部</option>
              <option value="chat">💬 聊天</option>
              <option value="image">🎨 圖片生成</option>
              <option value="embedding">📊 嵌入</option>
              <option value="audio">🎵 音頻</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label className="label">供應商</label>
            <select
              className="input"
              value={filter.provider}
              onChange={(e) => setFilter({ ...filter, provider: e.target.value })}
            >
              <option value="all">全部</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={() => setFilter({ type: 'all', provider: 'all' })}>
            清除篩選
          </button>
        </div>
      </div>

      {/* Models List */}
      {filteredModels.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>沒有找到模型</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {models.length === 0 
              ? '點擊「刷新所有模型」按鈕從供應商獲取模型列表' 
              : '嘗試調整篩選條件'}
          </p>
          {models.length === 0 && (
            <button className="btn btn-primary" onClick={handleRefreshAll}>
              刷新所有模型
            </button>
          )}
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>模型名稱</th>
                <th>類型</th>
                <th>供應商</th>
                <th>上下文大小</th>
                <th>最後同步</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((model) => (
                <tr key={model.id}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{model.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{model.modelId}</div>
                  </td>
                  <td>
                    <span className={`badge ${
                      model.type === 'chat' ? 'badge-success' : 
                      model.type === 'image' ? 'badge-warning' : 
                      model.type === 'embedding' ? 'badge-info' : 'badge-secondary'
                    }`}>
                      {getModelTypeIcon(model.type)} {getModelTypeName(model.type)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '14px' }}>{model.provider?.name || 'Unknown'}</div>
                  </td>
                  <td>
                    {model.contextSize ? (
                      <span style={{ fontSize: '14px' }}>
                        {model.contextSize.toLocaleString()} tokens
                      </span>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={{ fontSize: '14px', color: '#6b7280' }}>
                    {new Date(model.lastSynced).toLocaleString('zh-TW')}
                  </td>
                  <td>
                    <span className={`badge ${model.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {model.status === 'active' ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(model.id, model.status)}
                      style={{
                        padding: '6px 12px',
                        background: model.status === 'active' ? '#f59e0b' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {model.status === 'active' ? '停用' : '啟用'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
