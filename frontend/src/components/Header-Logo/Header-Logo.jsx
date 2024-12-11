import { Link } from 'react-router-dom';
import './Header-Logo.css';

const Header = () => {
    return (
        <header className="header">
            <Link to='/'>
                <img 
                    src="/hotspot-logo.svg"
                    alt="HotSpotS"
                    className="header-logo"
                    width="150"
                    height="40"
                />
            </Link>
        </header>
    )
}
export default Header;