import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );

  const login = async (email, password) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await axios.post(`${API_BASE}/auth/login`, { email: cleanEmail, password });
      const newToken = res.data.token;
      
      setToken(newToken);
      setCurrentUser(res.data.user);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message);
    }
  };

<<<<<<< HEAD
  const register = async (email, password, role) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await axios.post(`${API_BASE}/auth/register`, { email: cleanEmail, password, role });
=======
  const register = async (registrationData, password, role) => {
    try {
      let payload = {};
      if (typeof registrationData === 'object') {
        payload = { ...registrationData };
        if (payload.email) payload.email = payload.email.trim().toLowerCase();
      } else {
        payload = {
          email: String(registrationData).trim().toLowerCase(),
          password,
          role
        };
      }
      const res = await axios.post(`${API_BASE}/auth/register`, payload);
>>>>>>> 7fb864e190720415daafeeb5e7c85fa42639087b
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message);
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const authHeader = () => {
    return token ? { headers: { authorization: `Bearer ${token}` } } : {};
  };

  return (
    <AuthContext.Provider value={{ token, currentUser, login, register, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
};
