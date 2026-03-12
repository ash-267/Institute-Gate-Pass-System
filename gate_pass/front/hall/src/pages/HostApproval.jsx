import { useState, useEffect } from 'react'
import API_BASE from '../api'
import './HostApproval.css'

const HostApproval = () => {
    const [pendingRequests, setPendingRequests] = useState([])
    const [processedList, setProcessedList] = useState([])

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        fetchPending()
    }, [])

    const fetchPending = () => {
        fetch(`${API_BASE}/gate-passes/pending`)
            .then(res => res.json())
            .then(data => setPendingRequests(data))
            .catch(() => { })
    }

    const handleApprove = async (pass_id) => {
        try {
            await fetch(`${API_BASE}/gate-passes/${pass_id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved_by: user.user_id || null })
            })
            const approved = pendingRequests.find(r => r.pass_id === pass_id)
            setPendingRequests(pendingRequests.filter(r => r.pass_id !== pass_id))
            setProcessedList([...processedList, { ...approved, status: 'approved' }])
        } catch { }
    }

    const handleReject = async (pass_id) => {
        try {
            await fetch(`${API_BASE}/gate-passes/${pass_id}/reject`, { method: 'PUT' })
            const rejected = pendingRequests.find(r => r.pass_id === pass_id)
            setPendingRequests(pendingRequests.filter(r => r.pass_id !== pass_id))
            setProcessedList([...processedList, { ...rejected, status: 'rejected' }])
        } catch { }
    }

    return (
        <div className="host-page">
            <h1 className="host-title">Host Approval Panel</h1>
            <p className="host-subtitle">Review and manage visitor requests directed to you</p>

            <div className="host-section">
                <h2>⏳ Pending Requests ({pendingRequests.length})</h2>
                {pendingRequests.length === 0 ? (
                    <div className="empty-state">No pending requests</div>
                ) : (
                    <div className="request-list">
                        {pendingRequests.map(req => (
                            <div key={req.pass_id} className="request-card">
                                <div className="request-header">
                                    <div className="request-name-row">
                                        <strong>{req.full_name}</strong>
                                        <span className={`type-badge ${req.pass_type}`}>
                                            {req.pass_type === 'pre_registered' ? 'Pre-Registered' : 'Walk-In'}
                                        </span>
                                    </div>
                                    <span className="request-time">{new Date(req.created_at).toLocaleString()}</span>
                                </div>

                                <div className="request-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Phone:</span>
                                        <span>{req.phone}</span>
                                    </div>
                                    {req.email && (
                                        <div className="detail-row">
                                            <span className="detail-label">Email:</span>
                                            <span>{req.email}</span>
                                        </div>
                                    )}
                                    <div className="detail-row">
                                        <span className="detail-label">Reason:</span>
                                        <span>{req.reason}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Duration:</span>
                                        <span>{req.duration_days} day{req.duration_days > 1 ? 's' : ''}</span>
                                    </div>
                                    {req.id_proof_type && (
                                        <div className="detail-row">
                                            <span className="detail-label">ID Proof:</span>
                                            <span>{req.id_proof_type} ✅</span>
                                        </div>
                                    )}
                                </div>

                                <div className="request-actions">
                                    <button className="btn btn-approve" onClick={() => handleApprove(req.pass_id)}>✓ Approve</button>
                                    <button className="btn btn-reject" onClick={() => handleReject(req.pass_id)}>✕ Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {processedList.length > 0 && (
                <div className="host-section">
                    <h2>📋 Recently Processed</h2>
                    <div className="request-list">
                        {processedList.map(req => (
                            <div key={req.pass_id} className={`request-card processed ${req.status}`}>
                                <div className="request-header">
                                    <strong>{req.full_name}</strong>
                                    <span className={`status-badge ${req.status}`}>{req.status === 'approved' ? 'Approved' : 'Rejected'}</span>
                                </div>
                                <p className="processed-reason">{req.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default HostApproval
