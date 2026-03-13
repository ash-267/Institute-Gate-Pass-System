import { useState, useEffect, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import API_BASE from '../api'
import DEPARTMENTS from '../departmentData'
import QRScanner from './QRScanner'
import './SecurityDashboard.css'

const SecurityDashboard = () => {
    const [approvedPasses, setApprovedPasses] = useState([])
    const [insideCampus, setInsideCampus] = useState([])

    const [walkInData, setWalkInData] = useState({
        full_name: '', phone: '', reason: '', visiting_department: '', duration_days: 1, num_persons: 1
    })
    const [walkInSuccess, setWalkInSuccess] = useState('')
    const [walkInError, setWalkInError] = useState('')
    const [walkInQR, setWalkInQR] = useState(null)
    const walkInQrRef = useRef(null)

    const [scannedData, setScannedData] = useState(null)
    const [scanMessage, setScanMessage] = useState('')
    const [scanError, setScanError] = useState('')

    useEffect(() => {
        fetchApproved()
        fetchInside()
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

    const handleDownloadWalkInQR = () => {
        const canvas = walkInQrRef.current?.querySelector('canvas')
        if (!canvas) return
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `gate-pass-walkin-${walkInQR.pass_id}.png`
        link.href = url
        link.click()
    }

    const handleWalkInSubmit = async (e) => {
        e.preventDefault()
        setWalkInError('')
        setWalkInSuccess('')
        setWalkInQR(null)

        if (!walkInData.full_name || !walkInData.phone || !walkInData.reason || !walkInData.visiting_department) {
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

            const dept = DEPARTMENTS.find(d => d.name === walkInData.visiting_department)
            const qrPayload = {
                pass_id: data.pass_id,
                full_name: walkInData.full_name,
                phone: walkInData.phone,
                num_persons: parseInt(walkInData.num_persons),
                visiting_department: walkInData.visiting_department,
                floor: dept ? dept.floor : '',
                duration_days: parseInt(walkInData.duration_days),
                reason: walkInData.reason
            }
            setWalkInQR(qrPayload)
            setWalkInSuccess('Walk-in visitor registered! Show the QR code to the visitor.')
            setWalkInData({ full_name: '', phone: '', reason: '', visiting_department: '', duration_days: 1, num_persons: 1 })
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

    const handleMarkExit = async (pass_id, visitorName) => {
        try {
            const res = await fetch(`${API_BASE}/gate-passes/${pass_id}/exit`, { method: 'PUT' })
            const data = await res.json()
            fetchInside()
            fetchApproved()
            if (data.still_valid) {
                alert(`Exit recorded for ${visitorName || 'visitor'}. Pass is still valid for re-entry.`)
            }
        } catch { }
    }

    const handleScanSuccess = async (data) => {
        setScanError('')
        setScanMessage('')

        if (!data.pass_id) {
            setScanError('Invalid QR code — no pass ID found')
            setScannedData(null)
            return
        }

        setScannedData(data)

        try {
            const res = await fetch(`${API_BASE}/gate-passes/${data.pass_id}`)
            if (res.ok) {
                const passInfo = await res.json()
                setScannedData({ ...data, ...passInfo, _status: passInfo.status, _entry_time: passInfo.entry_time, _exit_time: passInfo.exit_time })
            }
        } catch { }
    }

    const handleScanEntry = async () => {
        if (!scannedData?.pass_id) return
        try {
            await fetch(`${API_BASE}/gate-passes/${scannedData.pass_id}/entry`, { method: 'PUT' })
            setScanMessage(`Entry recorded for ${scannedData.full_name} (Pass #${scannedData.pass_id})`)
            setScannedData(null)
            fetchApproved()
            fetchInside()
        } catch {
            setScanError('Failed to record entry')
        }
    }

    const handleScanExit = async () => {
        if (!scannedData?.pass_id) return
        try {
            const res = await fetch(`${API_BASE}/gate-passes/${scannedData.pass_id}/exit`, { method: 'PUT' })
            const data = await res.json()
            if (data.still_valid) {
                setScanMessage(`Exit recorded for ${scannedData.full_name} (Pass #${scannedData.pass_id}). ✅ Pass is still valid for re-entry.`)
            } else {
                setScanMessage(`Exit recorded for ${scannedData.full_name} (Pass #${scannedData.pass_id}). Pass has expired.`)
            }
            setScannedData(null)
            fetchInside()
            fetchApproved()
        } catch {
            setScanError('Failed to record exit')
        }
    }

    const handleScanError = (message) => {
        setScanError('Scanner error: ' + message)
    }

    const getDeptFloor = (deptName) => {
        const dept = DEPARTMENTS.find(d => d.name === deptName)
        return dept ? dept.floor : ''
    }

    return (
        <div className="security-page">
            <h1 className="security-title">Security Dashboard</h1>

            <div className="dashboard-grid">

                <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />

                {scanError && <div className="scanner-error">{scanError}</div>}
                {scanMessage && <div className="scanner-success">{scanMessage}</div>}

                {scannedData && (
                    <div className="scanned-result">
                        <h3>📋 Scanned Visitor Details</h3>
                        <div className="scanned-info">
                            <div className="info-item">
                                <span className="info-label">Name</span>
                                <span className="info-value">{scannedData.full_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Pass ID</span>
                                <span className="info-value">#{scannedData.pass_id}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Persons</span>
                                <span className="info-value">{scannedData.num_persons}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Department</span>
                                <span className="info-value">{scannedData.visiting_department}</span>
                            </div>
                            {scannedData.floor && (
                                <div className="info-item">
                                    <span className="info-label">Floor</span>
                                    <span className="info-value">{scannedData.floor}</span>
                                </div>
                            )}
                            <div className="info-item">
                                <span className="info-label">Duration</span>
                                <span className="info-value">{scannedData.duration_days} day{scannedData.duration_days > 1 ? 's' : ''}</span>
                            </div>
                            {scannedData._status && (
                                <div className="info-item">
                                    <span className="info-label">Status</span>
                                    <span className="info-value">{scannedData._status}</span>
                                </div>
                            )}
                        </div>
                        <div className="scanned-actions">
                            {(!scannedData._entry_time || scannedData._status === 'approved') && (
                                <button className="btn btn-entry" onClick={handleScanEntry}>✓ Mark Entry</button>
                            )}
                            {scannedData._entry_time && !scannedData._exit_time && (
                                <button className="btn btn-exit" onClick={handleScanExit}>↩ Mark Exit</button>
                            )}
                            <button className="btn btn-dismiss" onClick={() => setScannedData(null)}>Dismiss</button>
                        </div>
                    </div>
                )}

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
                                        <span className="pass-detail">Dept: {pass.visiting_department || pass.host_name} {pass.visiting_department ? `(${getDeptFloor(pass.visiting_department)})` : ''}</span>
                                        <span className="pass-detail">Reason: {pass.reason}</span>
                                        {pass.num_persons > 1 && <span className="pass-detail">Persons: {pass.num_persons}</span>}
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
                                        <span className="pass-detail">Dept: {visitor.visiting_department || visitor.host_name} {visitor.visiting_department ? `(${getDeptFloor(visitor.visiting_department)})` : ''}</span>
                                        <span className="pass-detail">Entry: {new Date(visitor.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {visitor.num_persons > 1 && <span className="pass-detail">Persons: {visitor.num_persons}</span>}
                                    </div>
                                    <button className="btn btn-exit" onClick={() => handleMarkExit(visitor.pass_id, visitor.full_name)}>Mark Exit</button>
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

                    {walkInQR && (
                        <div className="qr-display">
                            <h3>Walk-in Gate Pass QR Code</h3>
                            <p className="qr-subtitle">Pass ID: <strong>#{walkInQR.pass_id}</strong> &bull; {walkInQR.num_persons} person{walkInQR.num_persons > 1 ? 's' : ''}</p>
                            <div ref={walkInQrRef} className="qr-code-wrapper">
                                <QRCodeCanvas
                                    value={JSON.stringify(walkInQR)}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <button className="qr-download-btn" onClick={handleDownloadWalkInQR}>⬇ Download QR</button>
                            <p className="qr-note">Give this QR code to the visitor</p>
                        </div>
                    )}

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
                                <label htmlFor="wk_department">Visiting Department *</label>
                                <select id="wk_department" name="visiting_department" value={walkInData.visiting_department} onChange={handleWalkInChange}>
                                    <option value="">-- Select Department --</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept.name} value={dept.name}>{dept.name} ({dept.floor})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="wk_num_persons">Number of Persons *</label>
                                <input type="number" id="wk_num_persons" name="num_persons" value={walkInData.num_persons} onChange={handleWalkInChange} min="1" max="50" />
                            </div>
                        </div>

                        <div className="walkin-row">
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
