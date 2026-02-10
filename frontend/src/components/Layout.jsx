import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout({ user, onLogout }) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '儀表板', icon: '📊' },
    { path: '/api-keys', label: 'API Keys', icon: '🔑' },
    { path: '/providers', label: '供應商管理', icon: '🏢' },
    { path: '/models', label: '模型管理', icon: '🤖' },
    { path: '/usage-logs', label: '使用記錄', icon: '📝' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        background: '#1f2937',
        color: 'white',
        padding: '20px 0',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0
      }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>API Gateway</h2>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>管理後台</p>
        </div>

        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: location.pathname === item.path ? '#3b82f6' : '#d1d5db',
                textDecoration: 'none',
                background: location.pathname === item.path ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderLeft: location.pathname === item.path ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', padding: '0 20px' }}>
          <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>登入用戶</p>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>{user?.email || 'Unknown'}</p>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '5px' }}>角色: {user?.role || 'user'}</p>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            登出
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '250px', padding: '30px' }}>
        <Outlet />
      </main>
    </div>
  )
}
