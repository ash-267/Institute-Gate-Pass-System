import { useState, useEffect } from 'react'
import API_BASE from '../api'
import './SecurityDashboard.css'

const SecurityDashboard = () => {
    const [approvedPasses, setApprovedPasses] = useState([])
    const [insideCampus, setInsideCampus] = useState([])
    const [hosts, setHosts] = useState([])

    const [walkInData, setWalkInData] = useState({
        full_name: '', phone: '', reason: '', host_id: '', duration_days: 1
    })
    const [walkInSuccess, setWalkInSuccess] = useState('')
    const [walkInError, setWalkInError] = useState('')

    useEffect(() => {
        fetchApproved()
        fetchInside()
        fetch(`${API_BASE}/hosts/active`)
            .then(res => res.json())
            .then(data => setHosts(data))
            .catch(() => { })
    }, [])

    const fetchApproved = () => {
        fetch(`${API_BASE}/gate-passes/approved`)
            .then(res => res.json())
            .then(data => setApprovedPasses(data))
            .catch(() => { })
    }

    const fetchInside = () => {
        fetch(`${API_BASE}/gate-passes/inside`)
            .then(res => res.json())
            .then(data => setInsideCampus(data))
            .catch(() => { })
    }

    const handleWalkInChange = (e) => {
        setWalkInData({ ...walkInData, [e.target.name]: e.target.value })
    }

    const handleWalkInSubmit = async (e) => {
        e.preventDefault()
        setWalkInError('')
        setWalkInSuccess('')

        if (!walkInData.full_name || !walkInData.phone || !walkInData.reason || !walkInData.host_id) {
            setWalkInError('Please fill in all required fields')
            return
        }

        try {
            const res = await fetch(`${API_BASE}/visitors/walkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(walkInData)
            })
            const data = await res.json()
            if (!res.ok) { setWalkInError(data.error); return }
            setWalkInSuccess('Walk-in visitor registered! Awaiting host approval.')
            setWalkInData({ full_name: '', phone: '', reason: '', host_id: '', duration_days: 1 })
        } catch {
            setWalkInError('Could not connect to server')
        }
    }

    const handleMarkEntry = async (pass_id) => {
        try {
            await fetch(`${API_BASE}/gate-passes/${pass_id}/entry`, { method: 'PUT' })
            fetchApproved()
            fetchInside()
        } catch { }
    }

    const handleMarkExit = async (pass_id) => {
        try {
            await fetch(`${API_BASE}/gate-passes/${pass_id}/exit`, { method: 'PUT' })
            fetchInside()
        } catch { }
    }

    return (
        <div className="security-page">
            <h1 className="security-title">Security Dashboard</h1>

            <div className="dashboard-grid">
                <div className="dashboard-section">
                    <h2>✅ Approved Passes</h2>
                    <p className="section-desc">Visitors with approved passes — mark their entry</p>
                    {approvedPasses.length === 0 ? (
                        <div className="empty-state">No approved passes at the moment</div>
                    ) : (
                        <div className="pass-list">
                            {approvedPasses.map(pass => (
                                <div key={pass.pass_id} className="pass-card">
                                    <div className="pass-info">
                                        <strong>{pass.full_name}</strong>
                                        <span className="pass-phone">{pass.phone}</span>
                                        <span className="pass-detail">Host: {pass.host_name}</span>
                                        <span className="pass-detail">Reason: {pass.reason}</span>
                                        <span className={`pass-type ${pass.pass_type}`}>
                                            {pass.pass_type === 'pre_registered' ? 'Pre-Registered' : 'Walk-In'}
                                        </span>
                                    </div>
                                    <button className="btn btn-entry" onClick={() => handleMarkEntry(pass.pass_id)}>Mark Entry</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard-section">
                    <h2>🏫 Currently Inside Campus</h2>
                    <p className="section-desc">Visitors currently on premises — mark their exit</p>
                    {insideCampus.length === 0 ? (
                        <div className="empty-state">No visitors inside campus</div>
                    ) : (
                        <div className="pass-list">
                            {insideCampus.map(visitor => (
                                <div key={visitor.pass_id} className="pass-card inside">
                                    <div className="pass-info">
                                        <strong>{visitor.full_name}</strong>
                                        <span className="pass-phone">{visitor.phone}</span>
                                        <span className="pass-detail">Host: {visitor.host_name}</span>
                                        <span className="pass-detail">Entry: {new Date(visitor.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <button className="btn btn-exit" onClick={() => handleMarkExit(visitor.pass_id)}>Mark Exit</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard-section walkin-section">
                    <h2>🚶 Walk-in Registration</h2>
                    <p className="section-desc">Register a visitor who arrived without a pass</p>

                    {walkInError && <div className="walkin-error">{walkInError}</div>}
                    {walkInSuccess && <div className="walkin-success">{walkInSuccess}</div>}

                    <form onSubmit={handleWalkInSubmit} className="walkin-form">
                        <div className="walkin-row">
                            <div className="form-group">
                                <label htmlFor="wk_full_name">Full Name *</label>
                                <input type="text" id="wk_full_name" name="full_name" value={walkInData.full_name} onChange={handleWalkInChange} placeholder="Visitor's name" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="wk_phone">Phone *</label>
                                <input type="tel" id="wk_phone" name="phone" value={walkInData.phone} onChange={handleWalkInChange} placeholder="Phone number" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="wk_reason">Reason *</label>
                            <input type="text" id="wk_reason" name="reason" value={walkInData.reason} onChange={handleWalkInChange} placeholder="Purpose of visit" />
                        </div>

                        <div className="walkin-row">
                            <div className="form-group">
                                <label htmlFor="wk_host_id">Host *</label>
                                <select id="wk_host_id" name="host_id" value={walkInData.host_id} onChange={handleWalkInChange}>
                                    <option value="">-- Select Host --</option>
                                    {hosts.map(h => (
                                        <option key={h.host_id} value={h.host_id}>{h.full_name} ({h.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="wk_duration">Duration (days)</label>
                                <input type="number" id="wk_duration" name="duration_days" value={walkInData.duration_days} onChange={handleWalkInChange} min="1" max="99" />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-walkin">Register Walk-in</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SecurityDashboard
