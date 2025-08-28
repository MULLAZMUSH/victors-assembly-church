import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("jwt") || null);

  const login = (jwt) => {
    setToken(jwt);
    localStorage.setItem("jwt", jwt);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("jwt");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
