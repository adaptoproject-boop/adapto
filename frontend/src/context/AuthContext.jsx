import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5612/api';

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(
        localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
    );

    const [currentView, setCurrentView] = useState(
        localStorage.getItem('currentView') || 'kid'
    );

    /**
     * Real login - connects to backend API
     * NO MOCK DATA - requires actual account
     */
    const login = async (email, password, role) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
                role
            });

            setUserInfo(data);
            setCurrentView(role);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('currentView', role);

            return { success: true, data };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed. Please create an account first.'
            };
        }
    };

    /**
     * Real registration - creates new account in MongoDB
     */
    const register = async (name, email, password, role) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/register`, {
                name,
                email,
                password,
                role
            });

            setUserInfo(data);
            setCurrentView(role);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('currentView', role);

            return { success: true, data };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    /**
     * Switch between Kid and Parent view using SAME account.
     * No re-login required for family accounts.
     */
    const switchView = (view) => {
        if (userInfo && (userInfo.role === 'kid' || userInfo.role === 'parent')) {
            const updatedUser = { ...userInfo, role: view };
            setUserInfo(updatedUser);
            setCurrentView(view);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            localStorage.setItem('currentView', view);
        }
    };

    const logout = () => {
        setUserInfo(null);
        setCurrentView('kid');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('currentView');
        localStorage.removeItem('learningProgress');
    };

    return (
        <AuthContext.Provider value={{
            userInfo,
            currentView,
            login,
            register,
            logout,
            switchView
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
