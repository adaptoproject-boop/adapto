import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearning } from '../context/LearningContext';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaVolumeUp } from 'react-icons/fa';
import axios from 'axios';

const TouchLearning = () => {
    const { userProgress, currentEmotion, t } = useLearning();
    const [activeTab, setActiveTab] = useState('alphabets');
    const [playing, setPlaying] = useState(null);

    // Decorative Data
    const content = {
        alphabets: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char, i) => ({
            value: char,
            color: ['bg-red-100 text-red-500', 'bg-blue-100 text-blue-500', 'bg-green-100 text-green-500', 'bg-yellow-100 text-yellow-500', 'bg-purple-100 text-purple-500', 'bg-pink-100 text-pink-500'][i % 6]
        })),
        numbers: [
            { value: 1, icon: '🍎' }, { value: 2, icon: '🐱' }, { value: 3, icon: '🍦' },
            { value: 4, icon: '🚗' }, { value: 5, icon: '⭐️' }, { value: 6, icon: '🎈' },
            { value: 7, icon: '🌻' }, { value: 8, icon: '🐞' }, { value: 9, icon: '🦋' },
            { value: 10, icon: '🔟' }
        ],
        colors: [
            { name: 'Red', hex: 'bg-red-500 ring-red-200', hi: 'लाल', mr: 'लाल' },
            { name: 'Blue', hex: 'bg-blue-500 ring-blue-200', hi: 'नीला', mr: 'निळा' },
            { name: 'Green', hex: 'bg-green-500 ring-green-200', hi: 'हरा', mr: 'हिरवा' },
            { name: 'Yellow', hex: 'bg-yellow-400 ring-yellow-200', hi: 'पीला', mr: 'पिवळा' },
            { name: 'Orange', hex: 'bg-orange-500 ring-orange-200', hi: 'नारंगी', mr: 'केशरी' },
            { name: 'Purple', hex: 'bg-purple-500 ring-purple-200', hi: 'बैंगनी', mr: 'जांभळा' },
            { name: 'Pink', hex: 'bg-pink-400 ring-pink-200', hi: 'गुलाबी', mr: 'गुलाबी' },
            { name: 'Black', hex: 'bg-black ring-gray-200', hi: 'काला', mr: 'काळा' },
            { name: 'White', hex: 'bg-white border-4 border-gray-100 ring-gray-100', hi: 'सफेद', mr: 'पांढरा' }
        ],
        flowers: [
            { name: 'Rose', icon: '🌹', hi: 'गुलाब', mr: 'गुलाब' },
            { name: 'Sunflower', icon: '🌻', hi: 'सूरजमुखी', mr: 'सूर्यफूल' },
            { name: 'Hibiscus', icon: '🌺', hi: 'गुड़हल', mr: 'जास्वंद' },
            { name: 'Lotus', icon: '🪷', hi: 'कमल', mr: 'कमळ' },
            { name: 'Tulip', icon: '🌷', hi: 'कंदपुष्प', mr: 'ट्यूलिप' },
            { name: 'Daisy', icon: '🌼', hi: 'गुलबहार', mr: 'डेझी' },
            { name: 'Marigold', icon: '🏵️', hi: 'गेंदा', mr: 'झेंडू' },
            { name: 'Cherry Blossom', icon: '🌸', hi: 'चेरी ब्लॉसम', mr: 'चेरी ब्लॉसम' }
        ]
    };

    // Dictionary for translation logic
    const getSpeakText = (item, type) => {
        const lang = userProgress.language;

        if (type === 'alphabets') {
            const char = item.value;
            if (lang === 'hi') return `${char} से ${getHindiWord(char)}`;
            if (lang === 'mr') return `${char} म्हणजे ${getMarathiWord(char)}`;
            return `${char} for ${getEnglishWord(char)}`;
        }

        if (type === 'numbers') {
            const num = item.value;
            if (lang === 'hi') return getHindiNumber(num);
            if (lang === 'mr') return getMarathiNumber(num);
            return num.toString();
        }

        if (type === 'colors') {
            if (lang === 'hi') return item.hi;
            if (lang === 'mr') return item.mr;
            return item.name;
        }

        if (type === 'flowers') {
            if (lang === 'hi') return item.hi;
            if (lang === 'mr') return item.mr;
            return item.name;
        }

        return item.value || item.name;
    };

    // Helper for words
    const getEnglishWord = (l) => {
        const words = { A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant', F: 'Fish', G: 'Grapes', H: 'Hen', I: 'Ice Cream', J: 'Jug', K: 'Kite', L: 'Lion', M: 'Monkey', N: 'Nest', O: 'Orange', P: 'Parrot', Q: 'Queen', R: 'Rat', S: 'Sun', T: 'Tiger', U: 'Umbrella', V: 'Van', W: 'Watch', X: 'X-ray', Y: 'Yak', Z: 'Zebra' };
        return words[l] || l;
    };

    const getHindiWord = (l) => {
        const words = { A: 'सेब (Apple)', B: 'गेंद (Ball)', C: 'बिल्ली (Cat)', D: 'कुत्ता (Dog)' }; // Demo Only
        return words[l] || getEnglishWord(l);
    };

    const getMarathiWord = (l) => {
        const words = { A: 'सफरचंद (Apple)', B: 'चेंडू (Ball)', C: 'मांजर (Cat)', D: ' कुत्रा (Dog)' }; // Demo Only
        return words[l] || getEnglishWord(l);
    };

    const getHindiNumber = (n) => ['एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस'][n - 1];
    const getMarathiNumber = (n) => ['एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा'][n - 1];

    const handleSpeak = async (item, type) => {
        const text = getSpeakText(item, type);
        const identifier = item.value || item.name; // Unique ID for playing state
        setPlaying(identifier);

        try {
            const response = await axios.post('http://localhost:5612/api/voice/speak', {
                text: text,
                language: userProgress.language,
                emotion: currentEmotion
            }, { responseType: 'blob' });

            const audioUrl = URL.createObjectURL(response.data);
            const audio = new Audio(audioUrl);
            audio.play();
            audio.onended = () => setPlaying(null);
        } catch (error) {
            console.error("TTS Error", error);
            setPlaying(null);
        }
    };

    return (
        <div className="min-h-screen bg-pastel-gradient-soft p-6 pt-24 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce">🎨</div>
            <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-spin-slow">🧩</div>

            <Link to="/dashboard" className="absolute top-8 left-6 bg-white p-3 rounded-full shadow-md z-10 hover:scale-110 transition-transform">
                <FaArrowLeft className="text-gray-600" />
            </Link>

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-700 mb-2">{t('touch_title')} 👆</h1>
                    <p className="text-gray-500">{t('touch_subtitle')}</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-10">
                    {['alphabets', 'numbers', 'colors', 'flowers'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all capitalize ${activeTab === tab
                                ? 'bg-coral text-white shadow-lg scale-105'
                                : 'bg-white text-gray-400 hover:bg-gray-50'
                                }`}
                        >
                            {t(`touch_${tab}`)}
                        </button>
                    ))}
                </div>

                {/* Grid Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6"
                >
                    {content[activeTab].map((item, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.1, rotate: idx % 2 === 0 ? 2 : -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSpeak(item, activeTab)}
                            className={`
                                relative aspect-square rounded-3xl shadow-sm border-b-4 hover:shadow-xl transition-all flex flex-col items-center justify-center group
                                ${activeTab === 'alphabets' ? item.color : 'bg-white border-gray-200'}
                                ${playing === (item.value || item.name) ? 'ring-4 ring-yellow-400 scale-105' : ''}
                            `}
                        >
                            {/* Alphabets View */}
                            {activeTab === 'alphabets' && (
                                <span className="text-7xl font-bubble font-bold drop-shadow-sm">
                                    {item.value}
                                </span>
                            )}

                            {/* Numbers View */}
                            {activeTab === 'numbers' && (
                                <>
                                    <span className="text-6xl font-bold text-gray-700 mb-2">{item.value}</span>
                                    <span className="text-4xl absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm border border-gray-100 group-hover:scale-125 transition-transform">
                                        {item.icon}
                                    </span>
                                </>
                            )}

                            {/* Colors View */}
                            {activeTab === 'colors' && (
                                <div className={`w-full h-full rounded-3xl ${item.hex} flex items-center justify-center ring-4 ring-opacity-30 p-2`}>
                                    <span className="bg-white/90 px-3 py-1 rounded-xl text-sm font-bold text-gray-700 shadow-sm backdrop-blur-sm">
                                        {userProgress.language === 'en' ? item.name : userProgress.language === 'hi' ? item.hi : item.mr}
                                    </span>
                                </div>
                            )}

                            {/* Flowers View */}
                            {activeTab === 'flowers' && (
                                <>
                                    <span className="text-6xl animate-pulse-soft">{item.icon}</span>
                                    <span className="absolute bottom-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                                        {userProgress.language === 'en' ? item.name : userProgress.language === 'hi' ? item.hi : item.mr}
                                    </span>
                                </>
                            )}

                            {/* Playing Indicator */}
                            {playing === (item.value || item.name) && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 bg-white rounded-full p-2 text-blue-500 shadow-sm"
                                >
                                    <FaVolumeUp />
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};
export default TouchLearning;
