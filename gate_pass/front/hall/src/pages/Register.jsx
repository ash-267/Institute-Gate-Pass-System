import { useState, useEffect } from 'react'
import API_BASE from '../api'
import './Register.css'

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        id_proof_type: 'aadhar',
        id_proof_number: '',
        reason: '',
        duration_days: 1,
        host_id: ''
    })
    const [idProofFile, setIdProofFile] = useState(null)
    const [hosts, setHosts] = useState([])
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch(`${API_BASE}/hosts/active`)
            .then(res => res.json())
            .then(data => setHosts(data))
            .catch(() => console.log('Could not fetch hosts'))
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e) => {
        setIdProofFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!formData.full_name || !formData.phone || !formData.reason || !formData.host_id) {
            setError('Please fill in all required fields')
            return
        }
        if (!formData.id_proof_number || !idProofFile) {
            setError('ID proof type, number, and document upload are mandatory for pre-registration')
            return
        }

        setLoading(true)
        try {
            const body = new FormData()
            body.append('full_name', formData.full_name)
            body.append('phone', formData.phone)
            body.append('email', formData.email)
            body.append('id_proof_type', formData.id_proof_type)
            body.append('id_proof_number', formData.id_proof_number)
            body.append('reason', formData.reason)
            body.append('duration_days', formData.duration_days)
            body.append('host_id', formData.host_id)
            body.append('id_proof_file', idProofFile)

            const res = await fetch(`${API_BASE}/visitors/register`, {
                method: 'POST',
                body: body
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Registration failed')
                return
            }

            setSuccess('Your visit has been registered successfully! Awaiting host approval.')
            setFormData({
                full_name: '', phone: '', email: '', id_proof_type: 'aadhar',
                id_proof_number: '', reason: '', duration_days: 1, host_id: ''
            })
            setIdProofFile(null)
        } catch (err) {
            setError('Could not connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <h1>Register Your Visit</h1>
                    <p>Fill in the details below to pre-register your campus visit</p>
                </div>

                {error && <div className="register-error">{error}</div>}
                {success && <div className="register-success">{success}</div>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="full_name">Full Name *</label>
                            <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Enter your full name" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email (optional)" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="id_proof_type">ID Proof Type *</label>
                            <select id="id_proof_type" name="id_proof_type" value={formData.id_proof_type} onChange={handleChange}>
                                <option value="aadhar">Aadhar Card</option>
                                <option value="pan">PAN Card</option>
                                <option value="passport">Passport</option>
                                <option value="driving_license">Driving License</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="id_proof_number">ID Proof Number *</label>
                            <input type="text" id="id_proof_number" name="id_proof_number" value={formData.id_proof_number} onChange={handleChange} placeholder="Enter ID proof number" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="id_proof_file">Upload ID Proof *</label>
                        <input type="file" id="id_proof_file" accept="image/*,.pdf" onChange={handleFileChange} className="file-input" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reason">Reason for Visit *</label>
                        <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} placeholder="Describe the purpose of your visit" rows={3} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="duration_days">Duration (days) *</label>
                            <input type="number" id="duration_days" name="duration_days" value={formData.duration_days} onChange={handleChange} min="1" max="99" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="host_id">Host (Faculty/Staff) *</label>
                            <select id="host_id" name="host_id" value={formData.host_id} onChange={handleChange}>
                                <option value="">-- Select Host --</option>
                                {hosts.map(h => (
                                    <option key={h.host_id} value={h.host_id}>
                                        {h.full_name} ({h.department})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Registration'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Register
