import { useState, useEffect } from 'react'
import API_BASE from '../api'
import './AdminPanel.css'

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('hosts')

    const [hosts, setHosts] = useState([])
    const [hostForm, setHostForm] = useState({ full_name: '', department: '', designation: 'faculty', phone: '', email: '' })
    const [showHostForm, setShowHostForm] = useState(false)

    const [users, setUsers] = useState([])
    const [userForm, setUserForm] = useState({ username: '', full_name: '', password: '', role: 'security', phone: '' })
    const [showUserForm, setShowUserForm] = useState(false)

    const [reportData, setReportData] = useState([])

    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])

    useEffect(() => {
        if (activeTab === 'hosts') fetchHosts()
        if (activeTab === 'users') fetchUsers()
        if (activeTab === 'reports') fetchReports()
    }, [activeTab])

    const fetchHosts = () => {
        fetch(`${API_BASE}/hosts`)
            .then(res => res.json())
            .then(data => setHosts(data))
            .catch(() => { })
    }

    const fetchUsers = () => {
        fetch(`${API_BASE}/users`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(() => { })
    }

    const fetchReports = () => {
        fetch(`${API_BASE}/reports`)
            .then(res => res.json())
            .then(data => setReportData(data))
            .catch(() => { })
    }

    const handleAddHost = async (e) => {
        e.preventDefault()
        if (!hostForm.full_name || !hostForm.department || !hostForm.phone) return
        try {
            await fetch(`${API_BASE}/hosts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hostForm)
            })
            setHostForm({ full_name: '', department: '', designation: 'faculty', phone: '', email: '' })
            setShowHostForm(false)
            fetchHosts()
        } catch { }
    }

    const handleToggleHost = async (host_id) => {
        try {
            await fetch(`${API_BASE}/hosts/${host_id}/toggle`, { method: 'PUT' })
            fetchHosts()
        } catch { }
    }

    const handleAddUser = async (e) => {
        e.preventDefault()
        if (!userForm.username || !userForm.full_name || !userForm.password) return
        try {
            await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userForm)
            })
            setUserForm({ username: '', full_name: '', password: '', role: 'security', phone: '' })
            setShowUserForm(false)
            fetchUsers()
        } catch { }
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        try {
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`)
            const data = await res.json()
            setSearchResults(data)
        } catch { }
    }

    const formatDateTime = (dt) => {
        if (!dt) return '-'
        return new Date(dt).toLocaleString()
    }

    return (
        <div className="admin-page">
            <h1 className="admin-title">Admin Panel</h1>

            <div className="admin-tabs">
                <button className={`tab ${activeTab === 'hosts' ? 'active' : ''}`} onClick={() => setActiveTab('hosts')}>Manage Hosts</button>
                <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Manage Users</button>
                <button className={`tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Reports</button>
                <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>Search</button>
            </div>

            {activeTab === 'hosts' && (
                <div className="tab-content">
                    <div className="tab-header">
                        <h2>Faculty & Staff Hosts</h2>
                        <button className="btn btn-add" onClick={() => setShowHostForm(!showHostForm)}>
                            {showHostForm ? '✕ Cancel' : '+ Add Host'}
                        </button>
                    </div>

                    {showHostForm && (
                        <form className="add-form" onSubmit={handleAddHost}>
                            <div className="add-form-row">
                                <input type="text" placeholder="Full Name *" value={hostForm.full_name} onChange={e => setHostForm({ ...hostForm, full_name: e.target.value })} />
                                <input type="text" placeholder="Department *" value={hostForm.department} onChange={e => setHostForm({ ...hostForm, department: e.target.value })} />
                            </div>
                            <div className="add-form-row">
                                <select value={hostForm.designation} onChange={e => setHostForm({ ...hostForm, designation: e.target.value })}>
                                    <option value="faculty">Faculty</option>
                                    <option value="staff">Staff</option>
                                </select>
                                <input type="tel" placeholder="Phone *" value={hostForm.phone} onChange={e => setHostForm({ ...hostForm, phone: e.target.value })} />
                                <input type="email" placeholder="Email" value={hostForm.email} onChange={e => setHostForm({ ...hostForm, email: e.target.value })} />
                            </div>
                            <button type="submit" className="btn btn-save">Save Host</button>
                        </form>
                    )}

                    <table className="admin-table">
                        <thead>
                            <tr><th>Name</th><th>Department</th><th>Designation</th><th>Phone</th><th>Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {hosts.map(host => (
                                <tr key={host.host_id} className={!host.is_active ? 'inactive-row' : ''}>
                                    <td>{host.full_name}</td>
                                    <td>{host.department}</td>
                                    <td className="capitalize">{host.designation}</td>
                                    <td>{host.phone}</td>
                                    <td><span className={`status-dot ${host.is_active ? 'active' : 'inactive'}`}>{host.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td><button className={`btn btn-sm ${host.is_active ? 'btn-deactivate' : 'btn-activate'}`} onClick={() => handleToggleHost(host.host_id)}>{host.is_active ? 'Deactivate' : 'Activate'}</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="tab-content">
                    <div className="tab-header">
                        <h2>System Users</h2>
                        <button className="btn btn-add" onClick={() => setShowUserForm(!showUserForm)}>
                            {showUserForm ? '✕ Cancel' : '+ Add User'}
                        </button>
                    </div>

                    {showUserForm && (
                        <form className="add-form" onSubmit={handleAddUser}>
                            <div className="add-form-row">
                                <input type="text" placeholder="Username *" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} />
                                <input type="text" placeholder="Full Name *" value={userForm.full_name} onChange={e => setUserForm({ ...userForm, full_name: e.target.value })} />
                            </div>
                            <div className="add-form-row">
                                <input type="password" placeholder="Password *" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                    <option value="security">Security Staff</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                <input type="tel" placeholder="Phone" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} />
                            </div>
                            <button type="submit" className="btn btn-save">Save User</button>
                        </form>
                    )}

                    <table className="admin-table">
                        <thead>
                            <tr><th>Username</th><th>Full Name</th><th>Role</th><th>Phone</th></tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.user_id}>
                                    <td><code>{user.username}</code></td>
                                    <td>{user.full_name}</td>
                                    <td className="capitalize">{user.role}</td>
                                    <td>{user.phone || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            {activeTab === 'reports' && (
                <div className="tab-content">
                    <h2>Visitor Reports</h2>

                    <div className="report-stats">
                        <div className="stat-card">
                            <span className="stat-number">{reportData.length}</span>
                            <span className="stat-label">Total Passes</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{reportData.filter(r => r.entry_time && !r.exit_time).length}</span>
                            <span className="stat-label">Currently Inside</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{reportData.filter(r => r.status === 'completed').length}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{reportData.filter(r => r.status === 'pending').length}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>

                    <table className="admin-table">
                        <thead>
                            <tr><th>Date</th><th>Visitor</th><th>Phone</th><th>Host</th><th>Entry</th><th>Exit</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {reportData.map(r => (
                                <tr key={r.pass_id}>
                                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                    <td>{r.visitor_name}</td>
                                    <td>{r.phone}</td>
                                    <td>{r.host_name}</td>
                                    <td>{formatDateTime(r.entry_time)}</td>
                                    <td>{formatDateTime(r.exit_time)}</td>
                                    <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'search' && (
                <div className="tab-content">
                    <h2>Search Visitors</h2>
                    <form className="search-bar" onSubmit={handleSearch}>
                        <input type="text" placeholder="Search by visitor name, phone, or host..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <button type="submit" className="btn btn-search">Search</button>
                    </form>

                    {searchResults.length > 0 ? (
                        <table className="admin-table">
                            <thead>
                                <tr><th>Date</th><th>Visitor</th><th>Phone</th><th>Host</th><th>Entry</th><th>Exit</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {searchResults.map(r => (
                                    <tr key={r.pass_id}>
                                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td>{r.visitor_name}</td>
                                        <td>{r.phone}</td>
                                        <td>{r.host_name}</td>
                                        <td>{formatDateTime(r.entry_time)}</td>
                                        <td>{formatDateTime(r.exit_time)}</td>
                                        <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        searchQuery && <div className="empty-state">No results found for "{searchQuery}"</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminPanel
