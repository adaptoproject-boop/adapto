import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaStar } from 'react-icons/fa';
import CartoonButton from '../components/CartoonButton';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useLearning();
    const [role, setRole] = useState('kid');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Real authentication via backend
        const result = await login(email, password, role);

        if (result.success) {
            // Navigate based on role
            if (role === 'kid') {
                navigate('/dashboard');
            } else if (role === 'parent') {
                navigate('/parent');
            } else if (role === 'teacher') {
                navigate('/teacher/dashboard');
            }
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pastel-gradient flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="deco-blob deco-blob-pink w-96 h-96 -top-32 -right-20" />
            <div className="deco-blob deco-blob-purple w-80 h-80 bottom-0 -left-20" />
            <div className="deco-blob deco-blob-blue w-64 h-64 top-1/2 right-1/4" />

            {/* Floating Decorations */}
            <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-20 text-5xl opacity-70"
            >☁️</motion.div>
            <motion.div
                animate={{ y: [0, -10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-40 right-24 text-4xl"
            >⭐</motion.div>
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-40 left-24 text-3xl opacity-70"
            >💜</motion.div>
            <motion.div
                animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-24 right-20 text-5xl opacity-60"
            >☁️</motion.div>

            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-10"
                >
                    <Link to="/" className="inline-flex flex-col items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                            className="w-16 h-16 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center text-white text-4xl shadow-xl"
                        >
                            🎓
                        </motion.div>
                        <span className="text-3xl font-bold text-gray-700 tracking-tight">ADAPTO</span>
                    </Link>
                </motion.div>

                {/* Login Card */}
                <div className="glass-card p-10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-700 mb-1">{t('auth_login_title')} 👋</h2>
                        <p className="text-gray-500">{t('dash_continue')}</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Role Selector */}
                    <div className="flex gap-2 p-2 bg-white/40 rounded-2xl mb-8 border border-white/60">
                        {['kid', 'parent', 'teacher'].map((r) => (
                            <motion.button
                                key={r}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setRole(r)}
                                className={`flex-1 py-3 px-2 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 ${role === r
                                    ? 'bg-white shadow-lg text-coral'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <span className="text-xl">
                                    {r === 'kid' ? '👧' : r === 'parent' ? '👨‍👩‍👧' : '👨‍🏫'}
                                </span>
                                <span className="capitalize text-xs">
                                    {r === 'kid' ? t('auth_role_kid') : r === 'parent' ? t('auth_role_parent') : t('auth_role_teacher')}
                                </span>
                            </motion.button>
                        ))}
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="input-with-icon">
                            <FaUser className="input-icon" />
                            <input
                                type="email"
                                placeholder={t('auth_email')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-with-icon">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                placeholder={t('auth_password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded accent-coral" defaultChecked />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-coral font-semibold hover:underline">Forgot password?</Link>
                        </div>

                        <CartoonButton type="submit" variant="primary" className="w-full">
                            {loading ? 'Loading...' : t('auth_submit_login')} <FaStar className="text-yellow-300" />
                        </CartoonButton>
                    </form>

                    <p className="text-center text-gray-500 mt-8">
                        {t('auth_no_account')}{' '}
                        <Link to="/register" className="text-coral font-bold hover:underline">
                            {t('auth_register_link')}
                        </Link>
                    </p>
                </div>

                {/* Decorative bottom */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mt-8 gap-4"
                >
                    {['📚', '✏️', '🎨'].map((item, i) => (
                        <motion.span
                            key={i}
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            className="text-2xl opacity-60"
                        >
                            {item}
                        </motion.span>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
