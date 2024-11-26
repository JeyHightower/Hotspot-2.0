import { Link } from 'react-router-dom';
import './Header-Logo.css';

const Header = () => {
    return (
        <header className="header">
            <Link to='/'>
                <img 
                    src="/src/assets/logo.svg" 
                    alt="Hotspot 2.0 Logo"
                    className="logo"
                    width="150"
                    height="40"
                />
            </Link>
        </header>
    )
}
export default Header;