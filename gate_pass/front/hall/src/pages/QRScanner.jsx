import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import './QRScanner.css'

const QRScanner = ({ onScanSuccess, onScanError }) => {
    const scannerRef = useRef(null)
    const html5QrCodeRef = useRef(null)
    const [isScanning, setIsScanning] = useState(false)
    const [manualPassId, setManualPassId] = useState('')

    const startScanner = async () => {
        if (html5QrCodeRef.current) return

        try {
            const html5QrCode = new Html5Qrcode("qr-reader")
            html5QrCodeRef.current = html5QrCode

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    try {
                        const data = JSON.parse(decodedText)
                        onScanSuccess(data)
                        stopScanner()
                    } catch {
                        onScanSuccess({ raw: decodedText })
                        stopScanner()
                    }
                },
                () => { }
            )
            setIsScanning(true)
        } catch (err) {
            if (onScanError) onScanError(err.message || 'Could not start camera')
        }
    }

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop()
                html5QrCodeRef.current.clear()
            } catch { }
            html5QrCodeRef.current = null
        }
        setIsScanning(false)
    }

    useEffect(() => {
        return () => {
            stopScanner()
        }
    }, [])

    const toggleScanner = () => {
        if (isScanning) {
            stopScanner()
        } else {
            startScanner()
        }
    }

    const handleManualLookup = (e) => {
        e.preventDefault()
        if (!manualPassId.trim()) return
        onScanSuccess({ pass_id: parseInt(manualPassId) })
        setManualPassId('')
    }

    return (
        <div className="qr-scanner-section">
            <h2>🔍 Lookup Visitor Pass</h2>

            <div className="manual-lookup">
                <p className="section-desc">Enter a Pass ID to look up visitor details</p>
                <form className="manual-lookup-form" onSubmit={handleManualLookup}>
                    <input
                        type="number"
                        placeholder="Enter Pass ID (e.g. 12)"
                        value={manualPassId}
                        onChange={e => setManualPassId(e.target.value)}
                        min="1"
                    />
                    <button type="submit" className="btn btn-entry">Look Up</button>
                </form>
            </div>

            <div className="scanner-divider">
                <span>or scan QR code</span>
            </div>

            <button
                className={`scanner-toggle-btn ${isScanning ? 'active' : ''}`}
                onClick={toggleScanner}
            >
                {isScanning ? '⏹ Stop Scanner' : '📷 Start Camera Scanner'}
            </button>
            <div className="scanner-container" style={{ display: isScanning ? 'block' : 'none' }}>
                <div id="qr-reader" ref={scannerRef}></div>
            </div>
        </div>
    )
}

export default QRScanner
