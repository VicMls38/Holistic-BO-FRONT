import { useAuthContext } from './AuthContext';

export const useAuth = () => {
  const { user, token, login, logout } = useAuthContext();
  return { user, token, login, logout, isLoggedIn: !!token };
};
