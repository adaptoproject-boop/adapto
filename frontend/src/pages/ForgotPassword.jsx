import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaKey, FaArrowRight, FaCheckCircle, FaStar } from 'react-icons/fa';
import CartoonButton from '../components/CartoonButton';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5612/api/auth/forgot-password', { email });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5612/api/auth/reset-password', {
        email,
        otp,
        new_password: newPassword
      });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or expired');
    } finally {
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
        >🔑</motion.div>
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

            {/* Glass Card */}
            <div className="glass-card p-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-700 mb-1">Reset Password 🔐</h2>
                    <p className="text-gray-500">
                        {step === 1 ? "Enter your email to receive an OTP" : "Enter OTP and new password"}
                    </p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium text-center">
                        {error}
                    </motion.div>
                )}

                {message && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm font-medium text-center flex items-center justify-center gap-2">
                        <FaCheckCircle /> {message}
                    </motion.div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="input-with-icon">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <CartoonButton type="submit" variant="primary" className="w-full">
                            {loading ? 'Sending...' : 'Send OTP'} <FaArrowRight className="ml-2" />
                        </CartoonButton>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="input-with-icon">
                            <FaKey className="input-icon" />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="6-digit code"
                                required
                            />
                        </div>
                        <div className="input-with-icon">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password (min 6)"
                                required
                                minLength={6}
                            />
                        </div>
                        <CartoonButton type="submit" variant="success" className="w-full">
                            {loading ? 'Resetting...' : 'Reset Password'} <FaStar className="text-yellow-200 ml-2" />
                        </CartoonButton>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-coral font-bold hover:underline text-sm flex items-center justify-center gap-1">
                        Back to Login
                    </Link>
                </div>
            </div>

            {/* Decorative bottom */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mt-8 gap-4"
            >
                {['📫', '✨', '🔒'].map((item, i) => (
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

export default ForgotPassword;
