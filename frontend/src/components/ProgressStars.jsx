import React from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const ProgressStars = ({ current, total = 3, className = "" }) => {
    return (
        <div className={`flex gap-3 ${className}`}>
            {[...Array(total)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`text-2xl ${i < current ? 'text-blue-600' : 'text-slate-200'}`}
                >
                    <FaStar />
                </motion.div>
            ))}
        </div>
    );
};

export default ProgressStars;
