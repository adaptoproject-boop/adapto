import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(
        localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
    );

    const [currentView, setCurrentView] = useState(
        localStorage.getItem('currentView') || 'parent'
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

            const userData = { ...data, originalRole: data.role };
            setUserInfo(userData);
            setCurrentView(role);
            localStorage.setItem('userInfo', JSON.stringify(userData));
            localStorage.setItem('currentView', role);

            return { success: true, data: userData };
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

            const userData = { ...data, originalRole: data.role };
            setUserInfo(userData);
            setCurrentView(role);
            localStorage.setItem('userInfo', JSON.stringify(userData));
            localStorage.setItem('currentView', role);

            return { success: true, data: userData };
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
        const baseRole = userInfo?.originalRole || (userInfo?.role === 'kid' ? 'parent' : userInfo?.role);
        if (userInfo && baseRole === 'parent') {
            const updatedUser = { 
                ...userInfo, 
                role: view,
                originalRole: 'parent'
            };
            setUserInfo(updatedUser);
            setCurrentView(view);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            localStorage.setItem('currentView', view);
        }
    };

    const logout = () => {
        setUserInfo(null);
        setCurrentView('parent');
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
