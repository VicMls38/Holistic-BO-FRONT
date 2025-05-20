import { useAuth } from '../auth/AuthContext';

const Home = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Bienvenue !</h1>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
};

export default Home;