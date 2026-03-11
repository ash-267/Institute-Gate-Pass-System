import '../common/navbar.css'
import {Link} from 'react-router-dom'

const Navbar = ()=>{
    return <>
    <div className="navbar">
        <Link to={"/App"}>
            <h2>Home</h2>
        </Link>
            
        
        <Link to={"/search"}>
            Search
        </Link>
    </div>
    </>
}

export default Navbar;