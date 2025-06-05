import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

import '../css/login.css';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) navigate('/');
    else alert('Identifiants invalides');
  };

  return (
    <div style={{ padding: '2rem' }}>
    <h2 className='title-login'>Connexion</h2>
    <form className='form-login' onSubmit={handleSubmit}>
      <input
        className="login-input-username"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="login-input-password"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className='submit-login' type="submit">Login</button>
      <p className='subtext-login'>You don't have an account ? <Link to="/register">Register</Link></p>
    </form>
    </div>
  );
};

export default Login;