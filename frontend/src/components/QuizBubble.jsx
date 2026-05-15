import React from 'react';
import { motion } from 'framer-motion';

const QuizBubble = ({ children, character = "🦁" }) => {
    return (
        <div className="flex flex-col items-center gap-6 mb-12">
            {/* Character Mascot */}
            <motion.div
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-9xl filter drop-shadow-xl"
            >
                {character}
            </motion.div>

            {/* Speech Bubble */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-slate-100 max-w-lg text-center"
            >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-t-4 border-l-4 border-slate-100 rotate-45" />
                <h2 className="text-3xl md:text-4xl font-bubble text-slate-800 leading-tight">
                    {children}
                </h2>
            </motion.div>
        </div>
    );
};

export default QuizBubble;
