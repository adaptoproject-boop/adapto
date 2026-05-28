import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaStar } from 'react-icons/fa';
import CartoonButton from '../components/CartoonButton';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { t } = useLearning();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('parent');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleNext = async (e) => {
        e.preventDefault();
        setError('');

        if (step < 3) {
            setStep(step + 1);
        } else {
            setLoading(true);
            // Real registration via backend
            const result = await register(name, email, password, role);

            if (result.success) {
                // Navigate based on role
                if (role === 'parent') {
                    navigate('/parent');
                } else if (role === 'teacher') {
                    navigate('/teacher/dashboard');
                }
            } else {
                setError(result.error);
                setLoading(false);
                setStep(2); // Go back to details to fix
            }
        }
    };

    return (
        <div className="min-h-screen bg-pastel-gradient flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="deco-blob deco-blob-pink w-96 h-96 -top-20 -left-20" />
            <div className="deco-blob deco-blob-purple w-80 h-80 top-1/3 -right-20" />
            <div className="deco-blob deco-blob-blue w-72 h-72 -bottom-20 left-1/4" />

            {/* Floating Decorations */}
            <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-16 left-16 text-5xl opacity-80"
            >☁️</motion.div>
            <motion.div
                animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-32 right-20 text-4xl"
            >🌟</motion.div>
            <motion.div
                animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-32 left-20 text-3xl opacity-70"
            >💜</motion.div>
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-20 right-32 text-4xl opacity-60"
            >✨</motion.div>

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

                {/* Register Card */}
                <div className="glass-card p-10">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Progress Steps */}
                    <div className="flex justify-center gap-3 mb-10">
                        {[1, 2, 3].map((s) => (
                            <motion.div
                                key={s}
                                animate={{
                                    width: step >= s ? 32 : 10,
                                    backgroundColor: step >= s ? '#FF7B6B' : '#E8E8F0'
                                }}
                                className="h-2.5 rounded-full transition-all"
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form
                            key={step}
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -30, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleNext}
                            className="space-y-7"
                        >
                            {step === 1 && (
                                <>
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-gray-700 mb-1">{t('auth_register_title')} 🎉</h2>
                                        <p className="text-gray-500">{t('auth_role')}</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {['parent', 'teacher'].map((r) => (
                                            <motion.button
                                                key={r}
                                                type="button"
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setRole(r)}
                                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${role === r
                                                    ? 'border-coral bg-gradient-to-br from-coral/10 to-coral/5 shadow-md'
                                                    : 'border-gray-100 bg-white/50 hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className="text-3xl">
                                                    {r === 'parent' ? '👨‍👩‍👧' : '👨‍🏫'}
                                                </span>
                                                <span className={`font-bold capitalize ${role === r ? 'text-coral' : 'text-gray-600'}`}>
                                                    {r === 'parent' ? t('auth_role_parent') : t('auth_role_teacher')}
                                                </span>
                                                {role === r && <FaCheck className="ml-auto text-coral" />}
                                            </motion.button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-gray-700 mb-1">{t('auth_name')} 📝</h2>
                                        <p className="text-gray-500">Tell us a bit about yourself</p>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="input-with-icon">
                                            <FaUser className="input-icon" />
                                            <input
                                                type="text"
                                                placeholder={t('auth_name')}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="input-with-icon">
                                            <FaEnvelope className="input-icon" />
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
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <div className="text-center py-8">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                        className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center text-emerald-500 text-4xl mx-auto mb-6 shadow-lg border-4 border-white"
                                    >
                                        <FaCheck />
                                    </motion.div>
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('auth_submit_login')} 🎊</h2>
                                        <p className="text-gray-500">{t('dash_ready')}</p>
                                    </motion.div>

                                    {/* Celebration emojis */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-center gap-4 mt-6 text-3xl"
                                    >
                                        {['🎈', '🎉', '⭐', '🌟', '🎊'].map((emoji, i) => (
                                            <motion.span
                                                key={i}
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                            >
                                                {emoji}
                                            </motion.span>
                                        ))}
                                    </motion.div>
                                </div>
                            )}

                            <CartoonButton type="submit" variant="primary" className="w-full">
                                {step < 3 ? 'Continue' : t('auth_submit_register')} <FaStar className="text-yellow-300" />
                            </CartoonButton>
                        </motion.form>
                    </AnimatePresence>

                    {step === 1 && (
                        <p className="text-center text-gray-500 mt-8">
                            {t('auth_have_account')}{' '}
                            <Link to="/login" className="text-coral font-bold hover:underline">
                                {t('auth_login_link')}
                            </Link>
                        </p>
                    )}
                </div>

                {/* Decorative bottom illustration */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mt-8 gap-3"
                >
                    {['🌸', '🌻', '🌷'].map((flower, i) => (
                        <motion.span
                            key={i}
                            animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                            className="text-2xl opacity-60"
                        >
                            {flower}
                        </motion.span>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;
