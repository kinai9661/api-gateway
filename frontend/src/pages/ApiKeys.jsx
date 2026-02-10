import { useState, useEffect } from 'react'
import axios from 'axios'

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKey, setNewKey] = useState({ name: '', quotaLimit: 1000000 })

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/keys', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setApiKeys(response.data)
    } catch (err) {
      setError(err.response?.data?.error || '無法載入 API Keys')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/keys', newKey, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowCreateModal(false)
      setNewKey({ name: '', quotaLimit: 1000000 })
      fetchApiKeys()
    } catch (err) {
      setError(err.response?.data?.error || '創建失敗')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此 API Key 嗎？')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/keys/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchApiKeys()
    } catch (err) {
      setError(err.response?.data?.error || '刪除失敗')
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/keys/${id}`, { status: currentStatus === 'active' ? 'inactive' : 'active' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchApiKeys()
    } catch (err) {
      setError(err.response?.data?.error || '更新失敗')
    }
  }

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key)
    alert('已複製到剪貼板')
  }

  if (loading) return <div className="loading">載入中...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>API Keys 管理</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + 創建 API Key
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {apiKeys.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔑</div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>還沒有 API Keys</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>創建您的第一個 API Key 開始使用</p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            創建 API Key
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>名稱</th>
                <th>API Key</th>
                <th>配額使用</th>
                <th>狀態</th>
                <th>創建時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id}>
                  <td>{key.name}</td>
                  <td>
                    <code style={{
                      background: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}>
                      {key.key.substring(0, 20)}...
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      style={{
                        marginLeft: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      title="複製"
                    >
                      📋
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min((key.quotaUsed / key.quotaLimit) * 100, 100)}%`,
                            height: '100%',
                            background: key.quotaUsed / key.quotaLimit > 0.8 ? '#ef4444' : '#3b82f6'
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {key.quotaUsed.toLocaleString()} / {key.quotaLimit.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${key.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {key.status === 'active' ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td style={{ fontSize: '14px', color: '#6b7280' }}>
                    {new Date(key.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(key.id, key.status)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        background: key.status === 'active' ? '#f59e0b' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {key.status === 'active' ? '停用' : '啟用'}
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>創建 API Key</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">名稱</label>
                <input
                  type="text"
                  className="input"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  required
                  placeholder="例如：我的應用程式"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="label">配額限制 (Tokens)</label>
                <input
                  type="number"
                  className="input"
                  value={newKey.quotaLimit}
                  onChange={(e) => setNewKey({ ...newKey, quotaLimit: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  創建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
