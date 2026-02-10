import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ApiKeys from './pages/ApiKeys'
import Providers from './pages/Providers'
import Models from './pages/Models'
import UsageLogs from './pages/UsageLogs'
import Layout from './components/Layout'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      // 解析 token 獲取用戶信息（簡化版）
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch (e) {
        console.error('Invalid token')
        setToken(null)
        localStorage.removeItem('token')
      }
    }
  }, [token])

  const handleLogin = (newToken) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/" element={token ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="providers" element={<Providers />} />
          <Route path="models" element={<Models />} />
          <Route path="usage-logs" element={<UsageLogs />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
