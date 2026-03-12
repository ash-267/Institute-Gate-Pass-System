import '../common/navbar.css'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/" className="nav-home">HOME</Link>
            </div>

            <div className="nav-right">
                <Link to="/login" className="nav-link">Login</Link>
                {/* MMCOE Logo */}
                <img src="https://mmcoe.edu.in/wp-content/uploads/2024/09/mmcoe_newlogo-3.png" alt="MMCOE Logo" className="nav-logo" />
            </div>
        </nav>
    )
}

export default Navbar;
