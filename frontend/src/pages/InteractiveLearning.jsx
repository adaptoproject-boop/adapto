import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CartoonButton from '../components/CartoonButton';
import { FaChevronLeft, FaVolumeUp, FaLightbulb } from 'react-icons/fa';

const InteractiveLearning = () => {
    const navigate = useNavigate();
    const [activeObject, setActiveObject] = useState(null);

    const learnObjects = [
        { id: 1, letter: 'A', word: 'Apple', emoji: '🍎', color: 'bg-yellow-400' },
        { id: 2, letter: 'B', word: 'Ball', emoji: '⚽', color: 'bg-blue-400' },
        { id: 3, letter: 'C', word: 'Cat', emoji: '🐱', color: 'bg-pink-400' }
    ];

    return (
        <div className="min-h-screen bg-pastel-gradient pb-20 pt-8 px-6 relative overflow-hidden">
            {/* Floating Decorations */}
            <div className="absolute top-20 right-10 text-4xl animate-float-slow">☁️</div>
            <div className="absolute bottom-40 left-10 text-3xl animate-float">🌟</div>

            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to="/dashboard"
                        className="w-12 h-12 glass-card flex items-center justify-center text-gray-500 hover:text-coral transition-colors"
                    >
                        <FaChevronLeft />
                    </Link>

                    <div className="glass-card px-6 py-3 flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        <span className="font-bold text-gray-700">Interactive Learning</span>
                    </div>

                    <div className="w-12" /> {/* Spacer */}
                </div>

                {/* Main Learning Area */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-card p-8 mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-700 text-center mb-2">
                        Tap the letters to hear their sounds! 🔊
                    </h2>
                    <p className="text-gray-500 text-center mb-8">
                        Learn the alphabet with fun sounds and pictures
                    </p>

                    {/* Interactive Letters */}
                    <div className="flex justify-center gap-6 mb-8">
                        {learnObjects.map((obj) => (
                            <motion.button
                                key={obj.id}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveObject(obj)}
                                className={`w-24 h-24 ${obj.color} rounded-3xl flex items-center justify-center text-5xl font-bold text-white shadow-xl ${activeObject?.id === obj.id ? 'ring-4 ring-white ring-offset-4' : ''
                                    }`}
                            >
                                {obj.letter}
                            </motion.button>
                        ))}
                    </div>

                    {/* Result Display */}
                    <AnimatePresence mode="wait">
                        {activeObject && (
                            <motion.div
                                key={activeObject.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="glass-card-solid p-8 text-center"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5 }}
                                    className="text-7xl mb-4"
                                >
                                    {activeObject.emoji}
                                </motion.div>
                                <p className="text-lg text-gray-500 mb-2">
                                    <span className="text-coral font-bold text-2xl">{activeObject.letter}</span> for
                                </p>
                                <p className="text-3xl font-bold text-gray-700">{activeObject.word}</p>

                                <button className="mt-4 px-6 py-3 bg-coral/10 text-coral rounded-full font-semibold flex items-center gap-2 mx-auto">
                                    <FaVolumeUp /> Play Sound
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!activeObject && (
                        <div className="glass-card-solid p-8 text-center text-gray-400">
                            <FaLightbulb className="text-4xl mx-auto mb-4 text-yellow-400" />
                            <p>Tap a letter above to start learning!</p>
                        </div>
                    )}
                </motion.div>

                {/* Bottom Actions */}
                <div className="flex gap-4">
                    <CartoonButton
                        onClick={() => navigate('/dashboard')}
                        variant="secondary"
                        className="flex-1"
                    >
                        Back to Home
                    </CartoonButton>
                    <CartoonButton
                        onClick={() => navigate('/quiz/L1')}
                        variant="primary"
                        className="flex-1"
                    >
                        Take Quiz ⭐
                    </CartoonButton>
                </div>
            </div>
        </div>
    );
};

export default InteractiveLearning;
