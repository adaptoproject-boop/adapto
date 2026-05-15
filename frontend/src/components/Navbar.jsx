import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';

const Navbar = () => {
    const location = useLocation();
    const { userInfo, logout } = useAuth();
    const learningContext = useLearning();
    if (!learningContext) return null;
    const { t, setLanguage, userProgress } = learningContext;
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    // Show navbar on all pages for consistent access
    // if (location.pathname === '/') return null;

    return (
        <motion.nav
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
        >
            <div className="glass-card px-3 py-2 flex items-center justify-between gap-2 shadow-xl bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-3 pr-4 border-r border-gray-200">
                        <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            className="w-10 h-10 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"
                        >
                            🎓
                        </motion.div>
                        <span className="text-lg font-bold text-gray-700 tracking-tight hidden sm:block">ADAPTO</span>
                    </Link>

                    {userInfo && (
                        <div className="flex items-center">
                            {userInfo.role === 'kid' && (
                                <NavLink to="/dashboard" current={location.pathname}>👧 {t('nav_dashboard')}</NavLink>
                            )}
                            {(userInfo.role === 'parent' || userInfo.role === 'kid') && (
                                <NavLink to="/parent" current={location.pathname}>👨‍👩‍👧 {t('auth_role_parent')}</NavLink>
                            )}
                            {userInfo.role === 'teacher' && (
                                <NavLink to="/teacher/dashboard" current={location.pathname}>👨‍🏫 {t('auth_role_teacher')}</NavLink>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Switcher Button */}
                    {/* Language Switcher Dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsLangMenuOpen(true)}
                        onMouseLeave={() => setIsLangMenuOpen(false)}
                    >
                        <button
                            className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold transition-all border border-purple-200"
                        >
                            <span className="text-lg">🌐</span>
                            <span className="hidden sm:inline">
                                {userProgress?.language === 'en' ? 'English' :
                                    userProgress?.language === 'hi' ? 'हिंदी' : 'मराठी'}
                            </span>
                            <span className="text-xs ml-1">▼</span>
                        </button>

                        <AnimatePresence>
                            {isLangMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-purple-100 overflow-hidden z-50"
                                >
                                    {[
                                        { code: 'en', label: 'English' },
                                        { code: 'hi', label: 'हिंदी' },
                                        { code: 'mr', label: 'मराठी' }
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setIsLangMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-purple-50 transition-colors ${userProgress?.language === lang.code ? 'text-purple-600 bg-purple-50/50' : 'text-gray-600'
                                                }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {userInfo ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-sm font-bold text-gray-700">{userInfo.name}</span>
                                <span className="text-xs text-gray-400 capitalize">{userInfo.role}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border border-white shadow-sm">
                                {userInfo.role === 'kid' ? '👧' : userInfo.role === 'parent' ? '👨‍👩‍👧' : '👨‍🏫'}
                            </div>
                            <button
                                onClick={logout}
                                className="ml-2 p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                title={t('nav_logout')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm transition-colors">
                                {t('nav_login')}
                            </Link>
                            <Link to="/register" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                                {t('nav_register')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

const NavLink = ({ to, current, children }) => (
    <Link
        to={to}
        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${current === to
            ? 'bg-coral/10 text-coral'
            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
    >
        {children}
    </Link>
);

export default Navbar;
