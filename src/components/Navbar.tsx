import '../css/navbar_component.css';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

function Navbar() {

    const { logout } = useAuth();

  return (
    <header className="navbar">
      <div className="title-navbar">Holistic</div>
      <div className="profile-dropdown-navbar">
        <div className="profile-navbar">
          <FaUserCircle className="icon-navbar" />
          <span className="profile-navbar">Profil</span>
        </div>
        <div className="dropdown-content-navbar">
          <a href="#">My account</a>
          <a href="#">Settings</a>
          <a href="#" onClick={logout}>Logout</a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
