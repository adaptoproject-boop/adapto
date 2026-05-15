import React from 'react';
import { motion } from 'framer-motion';

const Mascot = ({ type = 'lion', size = 'md', className = '', emotion = 'happy' }) => {
    const mascots = {
        lion: { emoji: '🦁', title: 'Leo the Lion', sad: '😿', happy: '🦁', angry: '🐯', surprised: '🙀', neutral: '🦁', fun: '🦁' },
        panda: { emoji: '🐼', title: 'Panda Buddy', sad: '🐼', happy: '🐼', angry: '🐼', surprised: '🐼', neutral: '🐼', fun: '🐼' },
        cat: { emoji: '🐱', title: 'Kitty Teacher', sad: '😿', happy: '😺', angry: '😼', surprised: '🙀', neutral: '🐱', fun: '😸' },
        owl: { emoji: '🦉', title: 'Professor Owl', sad: '🦉', happy: '🦉', angry: '🦉', surprised: '😲', neutral: '🦉', fun: '🦉' },
        star: { emoji: '⭐', title: 'Super Star', sad: '💫', happy: '⭐', angry: '🔥', surprised: '✨', neutral: '⭐', fun: '🌟' },
        sparkles: { emoji: '✨', title: 'Magic', sad: '🌫️', happy: '✨', angry: '⚡', surprised: '🎆', neutral: '✨', fun: '🌈' }
    };

    const emotionMap = {
        happy: 'happy',
        sad: 'sad',
        angry: 'angry',
        surprised: 'surprised',
        neutral: 'neutral',
        bored: 'sad',
        confused: 'surprised',
        fun: 'fun'
    };

    const mascot = mascots[type] || mascots.lion;
    const currentExpression = mascot[emotionMap[emotion.toLowerCase()]] || mascot.emoji;

    const sizes = {
        sm: 'text-4xl',
        md: 'text-6xl',
        lg: 'text-8xl',
        xl: 'text-9xl'
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.5 }}
            animate={{
                y: emotion === 'happy' || emotion === 'fun' ? [0, -25, 0] : [0, -5, 0],
                rotate: emotion === 'happy' || emotion === 'fun' ? [0, 10, -10, 0] : [0, 2, -2, 0],
                opacity: 1,
                scale: 1
            }}
            transition={{
                duration: emotion === 'happy' || emotion === 'fun' ? 2 : 5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={`flex flex-col items-center justify-center p-4 cursor-pointer select-none ${className}`}
            whileHover={{ scale: 1.1, rotate: 10 }}
        >
            <span className={`${sizes[size]} drop-shadow-xl filter`}>
                {currentExpression}
            </span>
            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="mt-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-700 shadow-sm border border-white"
            >
                {mascot.title}
            </motion.div>
        </motion.div>
    );
};

export default Mascot;
