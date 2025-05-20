import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
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
      <h2>Inscription</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Nom d'utilisateur</label><br />
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Mot de passe</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: '1.5rem' }}>
          S'inscrire
        </button>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Register;
