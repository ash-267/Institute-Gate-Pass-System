import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API_BASE from '../api'
import './Login.css'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('security')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!username || !password) {
            setError('Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            })
            const text = await res.text()
            console.log('Response status:', res.status, 'Body:', text)
            const data = text ? JSON.parse(text) : {}

            if (!res.ok) {
                setError(data.error || 'Login failed (status ' + res.status + ')')
                return
            }

            localStorage.setItem('user', JSON.stringify(data.user))

            if (role === 'security') navigate('/security')
            else if (role === 'admin') navigate('/admin')
            else if (role === 'host') navigate('/host')
        } catch (err) {
            console.error('Login error:', err)
            setError('Error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to access the dashboard</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Login as</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="security">Security Staff</option>
                            <option value="admin">Administrator</option>
                            <option value="host">Host (Faculty/Staff)</option>
                        </select>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    )
}

export default Login
