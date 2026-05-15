import React from 'react';
import { motion } from 'framer-motion';

const CartoonButton = ({ children, variant = 'primary', className = '', onClick, type = 'button' }) => {
    const variants = {
        primary: 'btn-coral',
        secondary: 'btn-soft',
        outline: 'btn-soft border-2 border-coral/20 hover:border-coral/40'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            type={type}
            onClick={onClick}
            className={`${variants[variant] || variants.primary} ${className} flex items-center justify-center gap-2 cursor-pointer`}
        >
            {children}
        </motion.button>
    );
};

export default CartoonButton;
