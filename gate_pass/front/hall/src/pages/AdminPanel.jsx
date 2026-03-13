import { useState, useEffect } from 'react'
import API_BASE from '../api'
import DEPARTMENTS from '../departmentData'
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
    const [reportFrom, setReportFrom] = useState('')
    const [reportTo, setReportTo] = useState('')

    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])

    const [pendingPasses, setPendingPasses] = useState([])

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        if (activeTab === 'hosts') fetchHosts()
        if (activeTab === 'users') fetchUsers()
        if (activeTab === 'reports') fetchReports()
        if (activeTab === 'approvals') fetchPending()
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
        let url = `${API_BASE}/reports`
        const params = []
        if (reportFrom) params.push(`from=${reportFrom}`)
        if (reportTo) params.push(`to=${reportTo}`)
        if (params.length > 0) url += '?' + params.join('&')

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const visits = buildVisitRows(data)
                setReportData(visits)
            })
            .catch(() => { })
    }

    const buildVisitRows = (rawData) => {
        const passMap = {}
        rawData.forEach(row => {
            if (!passMap[row.pass_id]) {
                passMap[row.pass_id] = {
                    pass_id: row.pass_id,
                    visitor_name: row.visitor_name,
                    phone: row.phone,
                    visiting_department: row.visiting_department,
                    num_persons: row.num_persons,
                    status: row.status,
                    created_at: row.created_at,
                    legacy_entry: row.entry_time,
                    legacy_exit: row.exit_time,
                    events: []
                }
            }
            if (row.event_type) {
                passMap[row.pass_id].events.push({ type: row.event_type, time: row.event_time })
            }
        })

        const visitRows = []
        Object.values(passMap).forEach(pass => {
            const entries = pass.events.filter(e => e.type === 'entry').sort((a, b) => new Date(a.time) - new Date(b.time))
            const exits = pass.events.filter(e => e.type === 'exit').sort((a, b) => new Date(a.time) - new Date(b.time))

            if (entries.length === 0 && exits.length === 0) {
                visitRows.push({
                    ...pass,
                    visit_num: 1,
                    total_visits: 1,
                    entry_time: pass.legacy_entry || null,
                    exit_time: pass.legacy_exit || null
                })
            } else {
                const totalVisits = Math.max(entries.length, 1)
                for (let i = 0; i < totalVisits; i++) {
                    visitRows.push({
                        ...pass,
                        visit_num: i + 1,
                        total_visits: totalVisits,
                        entry_time: entries[i]?.time || null,
                        exit_time: exits[i]?.time || null
                    })
                }
            }
        })
        return visitRows
    }

    const fetchPending = () => {
        fetch(`${API_BASE}/gate-passes/pending`)
            .then(res => res.json())
            .then(data => setPendingPasses(data))
            .catch(() => { })
    }

    const handleApprovePass = async (pass_id) => {
        try {
            await fetch(`${API_BASE}/gate-passes/${pass_id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved_by: user.user_id || null })
            })
            fetchPending()
        } catch { }
    }

    const handleRejectPass = async (pass_id) => {
        try {
            await fetch(`${API_BASE}/gate-passes/${pass_id}/reject`, { method: 'PUT' })
            fetchPending()
        } catch { }
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

    const handleGenerateReport = (e) => {
        e.preventDefault()
        fetchReports()
    }

    const downloadExcel = () => {
        if (reportData.length === 0) return

        const headers = ['Pass ID', 'Visit #', 'Visitor Name', 'Phone', 'Department', 'No. of Persons', 'Entry Time', 'Exit Time', 'Pass Status']
        const rows = reportData.map(r => [
            r.pass_id,
            r.total_visits > 1 ? `Visit ${r.visit_num}` : '1',
            r.visitor_name,
            r.phone,
            r.visiting_department || '-',
            r.num_persons || 1,
            r.entry_time ? new Date(r.entry_time).toLocaleString() : '-',
            r.exit_time ? new Date(r.exit_time).toLocaleString() : '-',
            r.status
        ])

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const BOM = '\uFEFF'
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const dateStr = reportFrom && reportTo ? `_${reportFrom}_to_${reportTo}` : ''
        link.download = `visitor_report${dateStr}.csv`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
    }

    const formatDateTime = (dt) => {
        if (!dt) return '-'
        return new Date(dt).toLocaleString()
    }

    const getDeptFloor = (deptName) => {
        const dept = DEPARTMENTS.find(d => d.name === deptName)
        return dept ? dept.floor : ''
    }

    return (
        <div className="admin-page">
            <h1 className="admin-title">Admin Panel</h1>

            <div className="admin-tabs">
                <button className={`tab ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>Approvals</button>
                <button className={`tab ${activeTab === 'hosts' ? 'active' : ''}`} onClick={() => setActiveTab('hosts')}>Manage Hosts</button>
                <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Manage Users</button>
                <button className={`tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Reports</button>
                <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>Search</button>
            </div>

            {activeTab === 'approvals' && (
                <div className="tab-content">
                    <h2>Pending Visitor Passes ({pendingPasses.length})</h2>
                    {pendingPasses.length === 0 ? (
                        <div className="empty-state"></div>
                    ) : (
                        <div className="approval-list">
                            {pendingPasses.map(req => (
                                <div key={req.pass_id} className="approval-card">
                                    <div className="approval-header">
                                        <strong>{req.full_name}</strong>
                                        <span className={`type-badge ${req.pass_type}`}>
                                            {req.pass_type === 'pre_registered' ? 'Pre-Registered' : 'Walk-In'}
                                        </span>
                                    </div>
                                    <div className="approval-details">
                                        <span>ph: {req.phone}</span>
                                        {req.visiting_department && <span>dept: {req.visiting_department} ({getDeptFloor(req.visiting_department)})</span>}
                                        <span>reason: {req.reason}</span>
                                        <span>duration: {req.duration_days} day{req.duration_days > 1 ? 's' : ''}</span>
                                        {req.num_persons > 1 && <span>persons: {req.num_persons}</span>}
                                    </div>
                                    <div className="approval-actions">
                                        <button className="btn btn-approve" onClick={() => handleApprovePass(req.pass_id)}>✓ Approve</button>
                                        <button className="btn btn-reject" onClick={() => handleRejectPass(req.pass_id)}>✕ Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

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

                    <form className="report-date-form" onSubmit={handleGenerateReport}>
                        <div className="date-range-row">
                            <div className="date-field">
                                <label htmlFor="report-from">From Date</label>
                                <input type="date" id="report-from" value={reportFrom} onChange={e => setReportFrom(e.target.value)} />
                            </div>
                            <div className="date-field">
                                <label htmlFor="report-to">To Date</label>
                                <input type="date" id="report-to" value={reportTo} onChange={e => setReportTo(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-generate">Generate Report</button>
                            {reportData.length > 0 && (
                                <button type="button" className="btn btn-export" onClick={downloadExcel}>⬇ Download Excel</button>
                            )}
                        </div>
                    </form>

                    <div className="report-stats">
                        <div className="stat-card">
                            <span className="stat-number">{reportData.length}</span>
                            <span className="stat-label">Total Visits</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{reportData.filter(r => r.entry_time).length}</span>
                            <span className="stat-label">Entries</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{reportData.filter(r => r.exit_time).length}</span>
                            <span className="stat-label">Exits</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{new Set(reportData.map(r => r.pass_id)).size}</span>
                            <span className="stat-label">Unique Passes</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{[...new Set(reportData.map(r => r.pass_id))].reduce((sum, pid) => { const r = reportData.find(x => x.pass_id === pid); return sum + (r?.num_persons || 1) }, 0)}</span>
                            <span className="stat-label">Total Persons</span>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Pass ID</th>
                                    <th>Visitor</th>
                                    <th>Phone</th>
                                    <th>Department</th>
                                    <th>Persons</th>
                                    <th>Entry Time</th>
                                    <th>Exit Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((r, i) => (
                                    <tr key={`${r.pass_id}-v${r.visit_num}`}>
                                        <td>#{r.pass_id}{r.total_visits > 1 ? <span className="visit-num"> (Visit {r.visit_num})</span> : ''}</td>
                                        <td>{r.visitor_name}</td>
                                        <td>{r.phone}</td>
                                        <td>{r.visiting_department || '-'}</td>
                                        <td>{r.num_persons || 1}</td>
                                        <td>{r.entry_time ? <span className="event-badge entry">{formatDateTime(r.entry_time)}</span> : <span className="event-badge registered">Not entered</span>}</td>
                                        <td>{r.exit_time ? <span className="event-badge exit">{formatDateTime(r.exit_time)}</span> : (r.entry_time ? <span className="event-badge entry">Still inside</span> : '-')}</td>
                                        <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'search' && (
                <div className="tab-content">
                    <h2>Search Visitors</h2>
                    <form className="search-bar" onSubmit={handleSearch}>
                        <input type="text" placeholder="Search by visitor name, phone, or department..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <button type="submit" className="btn btn-search">Search</button>
                    </form>

                    {searchResults.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Visitor</th>
                                        <th>Phone</th>
                                        <th>Department</th>
                                        <th>Persons</th>
                                        <th>Entry</th>
                                        <th>Exit</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.map(r => (
                                        <tr key={r.pass_id}>
                                            <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                            <td>{r.visitor_name}</td>
                                            <td>{r.phone}</td>
                                            <td>{r.visiting_department || r.host_name || '-'}</td>
                                            <td>{r.num_persons || 1}</td>
                                            <td>{formatDateTime(r.entry_time)}</td>
                                            <td>{formatDateTime(r.exit_time)}</td>
                                            <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        searchQuery && <div className="empty-state">No results found for "{searchQuery}"</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminPanel
