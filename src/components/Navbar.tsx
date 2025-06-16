import '../css/navbar_component.css';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

function Navbar() {
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-title">Holistic</span>
      </div>
      
      <nav className="navbar-nav">
        <div className="profile-dropdown">
          <div className="profile-trigger">
            <FaUserCircle className="profile-icon" />
            <span className="profile-text">Profile</span>
          </div>
          
          <div className="dropdown-menu">
            <a href="#" className="dropdown-item">
              My Account
            </a>
            <a href="#" className="dropdown-item">
              Settings
            </a>
            <div className="dropdown-divider"></div>
            <a href="#" className="dropdown-item logout-item" onClick={handleLogout}>
              Logout
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;