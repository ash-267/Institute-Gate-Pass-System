import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE from '../api'
import './Signup.css'

const Signup = () => {
    const navigate = useNavigate()
    const [role, setRole] = useState('host')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const [hostForm, setHostForm] = useState({ full_name: '', department: '', designation: 'faculty', phone: '', email: '' })

    const [userForm, setUserForm] = useState({ username: '', full_name: '', password: '', confirmPassword: '', phone: '' })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            if (role === 'host') {
                if (!hostForm.full_name || !hostForm.department || !hostForm.phone) {
                    setError('Please fill all required fields')
                    setLoading(false)
                    return
                }

                const res = await fetch(`${API_BASE}/signup/host`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(hostForm)
                })
                const text = await res.text()
                const data = text ? JSON.parse(text) : {}

                if (!res.ok) {
                    setError(data.error || 'Signup failed')
                    return
                }
                setSuccess('Host account created! You can now receive visitor requests.')
                setHostForm({ full_name: '', department: '', designation: 'faculty', phone: '', email: '' })

            } else {
                if (!userForm.username || !userForm.full_name || !userForm.password) {
                    setError('Please fill all required fields')
                    setLoading(false)
                    return
                }
                if (userForm.password !== userForm.confirmPassword) {
                    setError('Passwords do not match')
                    setLoading(false)
                    return
                }

                const res = await fetch(`${API_BASE}/signup/user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: userForm.username,
                        full_name: userForm.full_name,
                        password: userForm.password,
                        role: 'security',
                        phone: userForm.phone
                    })
                })
                const text = await res.text()
                const data = text ? JSON.parse(text) : {}

                if (!res.ok) {
                    setError(data.error || 'Signup failed')
                    return
                }
                setSuccess('Security account created! You can now log in.')
                setUserForm({ username: '', full_name: '', password: '', confirmPassword: '', phone: '' })
            }
        } catch (err) {
            setError('Error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="signup-page">
            <div className="signup-card">
                <div className="signup-header">
                    <h1>Create Account</h1>
                    <p>Sign up as Host or Security Staff</p>
                </div>

                {error && <div className="signup-error">{error}</div>}
                {success && <div className="signup-success">{success}</div>}

                <div className="role-selector">
                    <button className={`role-btn ${role === 'host' ? 'active' : ''}`} onClick={() => setRole('host')} type="button">
                        Host (Faculty / Staff)
                    </button>
                    <button className={`role-btn ${role === 'security' ? 'active' : ''}`} onClick={() => setRole('security')} type="button">
                        Security Staff
                    </button>
                </div>

                <form className="signup-form" onSubmit={handleSubmit}>
                    {role === 'host' ? (
                        <>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input type="text" value={hostForm.full_name} onChange={e => setHostForm({ ...hostForm, full_name: e.target.value })} placeholder="Dr. Sharma" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Department *</label>
                                    <input type="text" value={hostForm.department} onChange={e => setHostForm({ ...hostForm, department: e.target.value })} placeholder="CSE" />
                                </div>
                                <div className="form-group">
                                    <label>Designation</label>
                                    <select value={hostForm.designation} onChange={e => setHostForm({ ...hostForm, designation: e.target.value })}>
                                        <option value="faculty">Faculty</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone *</label>
                                    <input type="tel" value={hostForm.phone} onChange={e => setHostForm({ ...hostForm, phone: e.target.value })} placeholder="9876543210" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={hostForm.email} onChange={e => setHostForm({ ...hostForm, email: e.target.value })} placeholder="faculty@mmcoe.edu.in" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username *</label>
                                    <input type="text" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} placeholder="security1" />
                                </div>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input type="text" value={userForm.full_name} onChange={e => setUserForm({ ...userForm, full_name: e.target.value })} placeholder="Ramesh Kumar" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password *</label>
                                    <input type="password" value={userForm.confirmPassword} onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })} placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="tel" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} placeholder="9876543210" />
                            </div>
                        </>
                    )}

                    <button type="submit" className="signup-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="signup-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    )
}

export default Signup
