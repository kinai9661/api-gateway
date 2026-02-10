import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Providers() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'chat',
    apiKey: '',
    endpoint: '',
    priority: 1
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/providers', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProviders(response.data)
    } catch (err) {
      setError(err.response?.data?.error || '無法載入供應商')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/admin/providers', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowCreateModal(false)
      setFormData({ name: '', type: 'chat', apiKey: '', endpoint: '', priority: 1 })
      fetchProviders()
    } catch (err) {
      setError(err.response?.data?.error || '創建失敗')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/providers/${editingProvider.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowEditModal(false)
      setEditingProvider(null)
      setFormData({ name: '', type: 'chat', apiKey: '', endpoint: '', priority: 1 })
      fetchProviders()
    } catch (err) {
      setError(err.response?.data?.error || '更新失敗')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此供應商嗎？')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/admin/providers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchProviders()
    } catch (err) {
      setError(err.response?.data?.error || '刪除失敗')
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/admin/providers/${id}`, { status: currentStatus === 'active' ? 'inactive' : 'active' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchProviders()
    } catch (err) {
      setError(err.response?.data?.error || '更新失敗')
    }
  }

  const openEditModal = (provider) => {
    setEditingProvider(provider)
    setFormData({
      name: provider.name,
      type: provider.type,
      apiKey: provider.apiKey,
      endpoint: provider.endpoint,
      priority: provider.priority
    })
    setShowEditModal(true)
  }

  if (loading) return <div className="loading">載入中...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>供應商管理</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + 添加供應商
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {providers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏢</div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>還沒有供應商</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>添加您的第一個 API 供應商</p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            添加供應商
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>名稱</th>
                <th>類型</th>
                <th>端點</th>
                <th>優先級</th>
                <th>狀態</th>
                <th>創建時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id}>
                  <td style={{ fontWeight: '500' }}>{provider.name}</td>
                  <td>
                    <span className={`badge ${provider.type === 'chat' ? 'badge-success' : 'badge-warning'}`}>
                      {provider.type === 'chat' ? '💬 聊天' : '🎨 圖片'}
                    </span>
                  </td>
                  <td>
                    <code style={{
                      background: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}>
                      {provider.endpoint}
                    </code>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      lineHeight: '24px',
                      textAlign: 'center',
                      background: '#e5e7eb',
                      borderRadius: '50%',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {provider.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${provider.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {provider.status === 'active' ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td style={{ fontSize: '14px', color: '#6b7280' }}>
                    {new Date(provider.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                  <td>
                    <button
                      onClick={() => openEditModal(provider)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleToggleStatus(provider.id, provider.status)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        background: provider.status === 'active' ? '#f59e0b' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {provider.status === 'active' ? '停用' : '啟用'}
                    </button>
                    <button
                      onClick={() => handleDelete(provider.id)}
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

      {/* Create Modal */}
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
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '450px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>添加供應商</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">名稱</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="例如：OpenAI"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">類型</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="chat">💬 聊天</option>
                  <option value="image">🎨 圖片</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">API Key</label>
                <input
                  type="password"
                  className="input"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  required
                  placeholder="sk-..."
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">端點 URL</label>
                <input
                  type="url"
                  className="input"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  required
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="label">優先級 (數字越大優先級越高)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  required
                  min="1"
                  max="100"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
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
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '450px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>編輯供應商</h2>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">名稱</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">類型</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="chat">💬 聊天</option>
                  <option value="image">🎨 圖片</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">API Key</label>
                <input
                  type="password"
                  className="input"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">端點 URL</label>
                <input
                  type="url"
                  className="input"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="label">優先級</label>
                <input
                  type="number"
                  className="input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  required
                  min="1"
                  max="100"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
