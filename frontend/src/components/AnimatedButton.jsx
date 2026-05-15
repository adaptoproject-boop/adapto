import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({ children, onClick, type = "button", variant = "primary", className = "", icon: Icon }) => {
    const variants = {
        primary: "btn-gradient text-white",
        secondary: "bg-secondary text-slate-800 border-b-6 border-yellow-600 hover:filter hover:brightness-110",
        accent: "bg-accent text-white border-b-6 border-green-700 hover:filter hover:brightness-110",
        outline: "bg-white border-4 border-primary text-primary hover:bg-primary/5",
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
            whileTap={{ scale: 0.9, rotate: 0 }}
            className={`
                px-8 py-4 rounded-kid font-bubble text-xl md:text-2xl 
                flex items-center justify-center gap-3 shadow-lg 
                relative overflow-hidden group
                ${variants[variant]} ${className}
            `}
        >
            {/* Glossy Overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 skew-y-[-10deg] -translate-y-4 group-hover:translate-y-[-2px] transition-transform" />

            {Icon && <Icon className="text-3xl" />}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
};

export default AnimatedButton;
