import React from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const SubjectCard = ({ title, emoji, progress, color }) => {
    const totalStars = 10;
    const filledStars = Math.round((progress / 100) * totalStars);

    const bgGradients = {
        'bg-blue-100': 'from-blue-50 to-blue-100',
        'bg-yellow-100': 'from-yellow-50 to-amber-100',
        'bg-pink-100': 'from-pink-50 to-pink-100',
        'bg-purple-100': 'from-purple-50 to-purple-100',
        'bg-green-100': 'from-green-50 to-green-100',
    };

    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-card-solid p-5 cursor-pointer group"
        >
            {/* Emoji/Illustration Container */}
            <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${bgGradients[color] || 'from-gray-50 to-gray-100'} flex items-center justify-center mb-4 overflow-hidden border border-white/50 shadow-sm`}>
                <motion.span
                    className="text-6xl group-hover:scale-115 transition-transform duration-300"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    {emoji}
                </motion.span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-700 mb-3 text-center group-hover:text-coral transition-colors">
                {title}
            </h3>

            {/* Star Progress */}
            <div className="flex items-center justify-between bg-white/70 rounded-full px-4 py-2.5 border border-gray-50 shadow-sm">
                <div className="flex gap-0.5">
                    {[...Array(Math.min(5, filledStars))].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <FaStar className="text-yellow-400 text-xs drop-shadow-sm" />
                        </motion.div>
                    ))}
                    {[...Array(Math.max(0, 5 - Math.min(5, filledStars)))].map((_, i) => (
                        <FaStar key={`empty-${i}`} className="text-gray-200 text-xs" />
                    ))}
                </div>
                <span className="text-sm font-bold">
                    <span className="text-coral">{filledStars}</span>
                    <span className="text-gray-400">/10 stars</span>
                    <span className="ml-1.5 text-gray-300 group-hover:text-coral transition-colors">→</span>
                </span>
            </div>
        </motion.div>
    );
};

export default SubjectCard;
