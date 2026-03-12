import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from '../common/navbar'
import Actual from '../1stUI/actual'
import Login from './pages/Login'
import Register from './pages/Register'
import SecurityDashboard from './pages/SecurityDashboard'
import HostApproval from './pages/HostApproval'
import AdminPanel from './pages/AdminPanel'
import Signup from './pages/Signup'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Actual />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/security" element={<SecurityDashboard />} />
        <Route path="/host" element={<HostApproval />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  )
}

export default App
