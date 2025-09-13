import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLoad } from "./LoadContext";

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BASE_ROUTE;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("authTokenConsultor") || sessionStorage.getItem("authTokenConsultor")
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoad();

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("authTokenConsultor");
    sessionStorage.removeItem("refreshTokenConsultor");
    localStorage.removeItem("authTokenConsultor");
    localStorage.removeItem("refreshTokenConsultor");
    // COMENTADO: delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  }, [navigate]);

  // Função para configurar o token no axios
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      // COMENTADO: delete axios.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const currentToken = localStorage.getItem("authTokenConsultor") || sessionStorage.getItem("authTokenConsultor");
      if (currentToken) {
        // COMENTADO: axios.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
        setAuthToken(currentToken);
        try {
          const response = await axios.get(`${API_URL}consultant/me`);
          setUser(response.data);
        } catch (error) {
          logout();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [logout]);

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken =
            localStorage.getItem("refreshTokenConsultor") ||
            sessionStorage.getItem("refreshTokenConsultor");

          if (!refreshToken) {
            logout();
            return Promise.reject(error);
          }

          try {
            const response = await axios.post(`${API_URL}auth/refresh`, {
              refreshToken,
            });
            const { token: newAccessToken, refreshToken: newRefreshToken } =
              response.data;

            setToken(newAccessToken);
            // COMENTADO: axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            setAuthToken(newAccessToken);
            
            // Atualiza o header da requisição original
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            }

            if (localStorage.getItem("refreshTokenConsultor")) {
              localStorage.setItem("authTokenConsultor", newAccessToken);
              localStorage.setItem("refreshTokenConsultor", newRefreshToken);
            } else {
              sessionStorage.setItem("authTokenConsultor", newAccessToken);
              sessionStorage.setItem("refreshTokenConsultor", newRefreshToken);
            }

            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  const login = async (email, password, rememberMe = false) => {
    try {
      startLoading();
      const response = await axios.post(`${API_URL}auth/login/consultant`, {
        email,
        password,
      });
      const { token: newToken, refreshToken } = response.data;

      setToken(newToken);
      // COMENTADO: axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setAuthToken(newToken);

      if (rememberMe) {
        localStorage.setItem("authTokenConsultor", newToken);
        localStorage.setItem("refreshTokenConsultor", refreshToken);
        sessionStorage.removeItem("authTokenConsultor");
        sessionStorage.removeItem("refreshTokenConsultor");
      } else {
        sessionStorage.setItem("authTokenConsultor", newToken);
        sessionStorage.setItem("refreshTokenConsultor", refreshToken);
        localStorage.removeItem("authTokenConsultor");
        localStorage.removeItem("refreshTokenConsultor");
      }

      const userResponse = await axios.get(`${API_URL}consultant/me`);
      setUser(userResponse.data);
      navigate("/platform/dashboard");
    } catch (error) {
      throw error;
    } finally {
      stopLoading();
    }
  };
  
  const updateUserBalance = (newBalance) => {
    setUser(prevUser => ({
      ...prevUser,
      balance: newBalance
    }));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    updateUserBalance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};