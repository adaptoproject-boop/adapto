import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaUserCircle } from 'react-icons/fa';

const MobileHeader = ({ title, user = { name: "Explorer", stars: 0 } }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-2">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border-4 border-white p-3 flex justify-between items-center max-w-2xl mx-auto"
            >
                <Link to="/dashboard" className="flex items-center gap-2 pl-2">
                    <div className="bg-primary p-2 rounded-2xl shadow-sm rotate-[-5deg]">
                        <span className="text-2xl">🚀</span>
                    </div>
                </Link>

                <h2 className="text-xl font-bubble text-slate-700 truncate px-2">{title}</h2>

                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="bg-secondary/20 px-4 py-2 rounded-full border-2 border-secondary/30 flex items-center gap-2"
                    >
                        <FaStar className="text-secondary text-lg animate-pulse" />
                        <span className="font-bubble text-slate-700">{user.stars}</span>
                    </motion.div>

                    <Link to="/dashboard">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 bg-slate-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-primary text-2xl"
                        >
                            <FaUserCircle />
                        </motion.div>
                    </Link>
                </div>
            </motion.div>
        </header>
    );
};

export default MobileHeader;
