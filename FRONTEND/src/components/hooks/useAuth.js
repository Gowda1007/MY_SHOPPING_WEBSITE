import { useUser } from "../context/UserContext";


export const useAuth = () => {
  const { user } = useUser();
  return {
    isAuthenticated: Boolean(user?.email),
    user,
  };
};