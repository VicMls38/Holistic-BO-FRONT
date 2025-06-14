import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

import '../css/register.css';


const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // const response = await axios.post('https://ethan-server.com:8443/api/users/register', {
      const response = await axios.post('http://localhost:3000/api/users/register', {
        username,
        password,
      });

      if (response.status === 201) {
        alert('Inscription réussie !');
        navigate('/login');
      } else {
        setError('Erreur lors de l’inscription.');
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Une erreur s'est produite.");
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 className='title-register'>Register</h2>
      <form className='form-register' onSubmit={handleRegister}>
        <input
          className='register-input-username'
          placeholder="Username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className='register-input-password'
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className='submit-register' type="submit">
          Register
        </button>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        <p className='subtext-register'>Already have an account ? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
