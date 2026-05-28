import React from 'react';
import { motion } from 'framer-motion';
import { updateUserLevel } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import CartoonButton from './CartoonButton';

/**
 * AgeSelectorModal
 * Displays three age range cards (2‑4, 5‑7, 8‑10) mapping to difficulty levels.
 * On selection, updates the user's level via API, stores the choice in localStorage,
 * and closes the modal.
 */
const AgeSelectorModal = ({ onClose }) => {
  const { userInfo } = useAuth();

  const handleSelect = async (level) => {
    // Update backend
    await updateUserLevel(level, userInfo?.token);
    // Persist locally
    localStorage.setItem('ageSelected', 'true');
    localStorage.setItem('selectedLevel', level);
    onClose();
  };

  const cards = [
    { label: '2‑4 years', level: 'Easy', description: 'Beginner adventures' },
    { label: '5‑7 years', level: 'Medium', description: 'Growing explorers' },
    { label: '8‑10 years', level: 'Hard', description: 'Future prodigies' }
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Select Your Age Group</h2>
        <div className="grid gap-4">
          {cards.map((c) => (
            <motion.div
              key={c.level}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border border-gray-200 rounded-lg p-4 hover:border-coral cursor-pointer"
              onClick={() => handleSelect(c.level)}
            >
              <h3 className="font-semibold text-lg mb-1 text-coral">{c.label}</h3>
              <p className="text-sm text-gray-600 mb-2">{c.description}</p>
              <CartoonButton variant="primary" className="w-full">
                Choose {c.level}
              </CartoonButton>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgeSelectorModal;
