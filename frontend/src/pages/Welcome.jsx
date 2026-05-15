import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CartoonButton from '../components/CartoonButton';
import { FaStar } from 'react-icons/fa';
import { useLearning } from '../context/LearningContext';
import Mascot from '../components/Mascot';

const Welcome = () => {
    const { t } = useLearning();

    return (
        <div className="min-h-screen bg-pastel-gradient overflow-hidden relative">
            {/* Decorative Blobs */}
            <div className="deco-blob deco-blob-pink w-[500px] h-[500px] -top-40 -left-40" />
            <div className="deco-blob deco-blob-purple w-[400px] h-[400px] top-1/4 -right-32" />
            <div className="deco-blob deco-blob-blue w-[350px] h-[350px] bottom-0 left-1/3" />

            {/* Floating Decorative Elements */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-24 left-12 text-6xl opacity-70"
            >☁️</motion.div>
            <motion.div
                animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-40 right-24 text-4xl"
            >⭐</motion.div>
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-40 left-24 text-3xl opacity-70"
            >💜</motion.div>
            <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute top-60 right-48 text-3xl"
            >🌟</motion.div>
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-24 right-12 text-5xl opacity-60"
            >☁️</motion.div>
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/3 left-1/4 text-2xl"
            >💖</motion.div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10">
                {/* Hero Section */}
                <div className="glass-card p-10 md:p-14 relative overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ x: -40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="space-y-6"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                                {t('welcome_title')}
                                <motion.span
                                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="inline-block ml-3"
                                >✨</motion.span>
                            </h1>

                            <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                                {t('welcome_subtitle')}
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="/register?role=kid">
                                    <CartoonButton variant="primary">
                                        {t('welcome_get_started')} 🌟 <FaStar className="text-yellow-300" size={14} />
                                    </CartoonButton>
                                </Link>
                                <Link to="/login?role=parent">
                                    <CartoonButton variant="secondary">
                                        👨‍👩‍👧 {t('auth_role_parent')}
                                    </CartoonButton>
                                </Link>
                                <Link to="/login?role=teacher">
                                    <CartoonButton variant="outline">
                                        👨‍🏫 {t('auth_role_teacher')}
                                    </CartoonButton>
                                </Link>
                            </div>

                            {/* Trust badges */}

                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex -space-x-2">
                                    {['👧', '👦', '👧🏽', '👦🏻'].map((avatar, i) => (
                                        <div key={i} className="w-10 h-10 bg-white rounded-full border-2 border-white shadow-md flex items-center justify-center text-lg">
                                            {avatar}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700">10,000+</p>
                                    <p className="text-sm text-gray-400">Happy learners</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Illustration */}
                        <motion.div
                            initial={{ x: 40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="relative flex justify-center"
                        >
                            <div className="relative">
                                {/* Main Children Hero Image */}
                                <motion.img
                                    src="/children_hero.png"
                                    alt="Happy learning children"
                                    className="w-full max-w-sm drop-shadow-2xl"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                />

                                {/* Floating Panda badge */}
                                <motion.div
                                    className="absolute -top-6 -right-6 text-5xl bg-white rounded-full shadow-lg p-2"
                                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    🤖
                                </motion.div>

                                {/* ABC blocks badge */}
                                <motion.div
                                    className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                                >
                                    <span className="text-2xl">🎓</span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">Smart Learning!</p>
                                        <p className="text-[10px] text-gray-400">AI Powered ✨</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Subject Preview Cards */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="mt-16"
                >
                    <h2 className="text-2xl font-bold text-gray-700 text-center mb-8">
                        {t('dash_ready')} 🎯
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {[
                            { title: t('touch_alphabets'), emoji: '🔤', stars: 3, bg: 'from-pink-50 to-pink-100' },
                            { title: t('touch_numbers'), emoji: '🔢', stars: 5, bg: 'from-blue-50 to-blue-100' },
                            { title: t('feature_fun'), emoji: '🐼', stars: 7, bg: 'from-green-50 to-green-100' }, // Reusing feature key for demo
                            { title: t('touch_colors'), emoji: '🎨', stars: 8, bg: 'from-purple-50 to-purple-100' }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="glass-card-solid p-6 text-center cursor-pointer group"
                            >
                                <motion.div
                                    className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${card.bg} flex items-center justify-center mb-4`}
                                >
                                    <motion.span
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                        className="text-5xl group-hover:scale-110 transition-transform"
                                    >
                                        {card.emoji}
                                    </motion.span>
                                </motion.div>
                                <h3 className="font-bold text-gray-700 mb-2">{card.title}</h3>
                                <div className="flex items-center justify-center gap-1 text-sm">
                                    <span className="text-coral font-bold">{card.stars}</span>
                                    <span className="text-gray-400">/10 {t('dash_stars')}</span>
                                    <span className="text-gray-300 ml-1">→</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div >
        </div >
    );
};

export default Welcome;
