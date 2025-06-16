import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

import '../css/register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://ethan-server.com:8443/api/users/register', {
        username: username.trim(),
        password,
      });

      if (response.status === 201) {
        alert('Registration successful! Please login with your credentials.');
        navigate('/login');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 409) {
        setError('Username already exists. Please choose a different username.');
      } else {
        setError('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h2 className="title-register">Register</h2>
      <form className="form-register" onSubmit={handleRegister}>
        <input
          className="register-input-username"
          placeholder="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          className="register-input-password"
          placeholder="Password (min. 6 characters)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={6}
        />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          className="submit-register" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
        
        <p className="subtext-register">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;