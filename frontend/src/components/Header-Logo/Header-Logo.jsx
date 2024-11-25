import { Link } from 'react-router-dom';
import './Header-Logo.css';
const Header = () => {
    return (
        <header className="header">
            <Link to='/'>
            <img src="/favicon.ico" alt="Logo" className="logo"/>
            </Link>
        </header>
    )
}

export default Header;