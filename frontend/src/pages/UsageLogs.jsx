import { useState, useEffect } from 'react'
import axios from 'axios'

export default function UsageLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ type: 'all', dateFrom: '', dateTo: '' })

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/usage-logs', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLogs(response.data)
    } catch (err) {
      setError(err.response?.data?.error || '無法載入使用記錄')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filter.type !== 'all' && log.serviceType !== filter.type) return false
    if (filter.dateFrom && new Date(log.createdAt) < new Date(filter.dateFrom)) return false
    if (filter.dateTo && new Date(log.createdAt) > new Date(filter.dateTo)) return false
    return true
  })

  const getServiceTypeIcon = (type) => {
    return type === 'chat' ? '💬' : '🎨'
  }

  const getServiceTypeName = (type) => {
    return type === 'chat' ? '聊天' : '圖片生成'
  }

  if (loading) return <div className="loading">載入中...</div>

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>使用記錄</h1>

      {error && <div className="error">{error}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label className="label">服務類型</label>
            <select
              className="input"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="all">全部</option>
              <option value="chat">💬 聊天</option>
              <option value="image">🎨 圖片生成</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label className="label">開始日期</label>
            <input
              type="date"
              className="input"
              value={filter.dateFrom}
              onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
            />
          </div>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label className="label">結束日期</label>
            <input
              type="date"
              className="input"
              value={filter.dateTo}
              onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => setFilter({ type: 'all', dateFrom: '', dateTo: '' })}>
            清除篩選
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
            {filteredLogs.length}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>總請求數</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            {filteredLogs.reduce((sum, log) => sum + log.tokensUsed, 0).toLocaleString()}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>總 Tokens</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            ${filteredLogs.reduce((sum, log) => sum + (log.cost || 0), 0).toFixed(4)}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>總成本</div>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>沒有使用記錄</h3>
          <p style={{ color: '#6b7280' }}>開始使用 API 後，記錄將顯示在這裡</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>時間</th>
                <th>服務類型</th>
                <th>Tokens</th>
                <th>成本</th>
                <th>供應商</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '14px', color: '#6b7280' }}>
                    {new Date(log.createdAt).toLocaleString('zh-TW')}
                  </td>
                  <td>
                    <span className={`badge ${log.serviceType === 'chat' ? 'badge-success' : 'badge-warning'}`}>
                      {getServiceTypeIcon(log.serviceType)} {getServiceTypeName(log.serviceType)}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {log.tokensUsed.toLocaleString()}
                  </td>
                  <td style={{ fontWeight: '500', color: '#f59e0b' }}>
                    ${(log.cost || 0).toFixed(4)}
                  </td>
                  <td style={{ fontSize: '14px', color: '#6b7280' }}>
                    {log.provider?.name || 'Unknown'}
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
