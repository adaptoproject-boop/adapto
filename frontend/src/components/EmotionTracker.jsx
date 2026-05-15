import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearning } from '../context/LearningContext';
import { FaVideo, FaVideoSlash, FaBrain } from 'react-icons/fa';

/**
 * EmotionTracker Component
 * 
 * Demonstrates ADAPTO's real-time behavioral monitoring.
 * In a production environment, this would use face-api.js or similar.
 * Here, it provides a webcam preview and simulates emotion detection
 * to sync with the backend orchestration engine.
 */
const EmotionTracker = ({ isActive = true, onConfusedRatioUpdate }) => {
    const { logEmotion } = useLearning();
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [currentEmotion, setCurrentEmotion] = useState('engaged');
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Start camera
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
            setIsCameraOn(true);
        } catch (err) {
            console.error("Camera access denied:", err);
            setIsCameraOn(false);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraOn(false);
        }
    };

    useEffect(() => {
        if (isActive && !stream) {
            startCamera();
        }
        return () => stopCamera();
    }, [isActive]);

    // Simulated emotion detection loop (every 5 seconds)
    useEffect(() => {
        if (!isActive || !isCameraOn) return;

        const interval = setInterval(async () => {
            // Simulation Logic:
            // 80% Engaged/Focused, 20% Confused/Bored
            const emotions = ['engaged', 'focused', 'happy', 'confused', 'bored'];
            const weights  = [0.4, 0.3, 0.1, 0.1, 0.1];
            
            const rand = Math.random();
            let cumulative = 0;
            let detected = 'engaged';
            
            for (let i = 0; i < emotions.length; i++) {
                cumulative += weights[i];
                if (rand < cumulative) {
                    detected = emotions[i];
                    break;
                }
            }

            setCurrentEmotion(detected);
            const ratio = await logEmotion(detected);
            if (onConfusedRatioUpdate) onConfusedRatioUpdate(ratio);
        }, 5000);

        return () => clearInterval(interval);
    }, [isActive, isCameraOn]);

    const emotionMeta = {
        engaged:   { label: 'Focused',   color: 'text-blue-500',   bg: 'bg-blue-50',   emoji: '🧠' },
        focused:   { label: 'Studying',  color: 'text-indigo-500', bg: 'bg-indigo-50', emoji: '🧐' },
        happy:     { label: 'Enjoying',  color: 'text-green-500',  bg: 'bg-green-50',  emoji: '😊' },
        confused:  { label: 'Thinking',  color: 'text-orange-500', bg: 'bg-orange-50', emoji: '😕' },
        bored:     { label: 'Distracted',color: 'text-slate-500',  bg: 'bg-slate-50',  emoji: '😴' }
    };

    const meta = emotionMeta[currentEmotion] || emotionMeta.engaged;

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
            <AnimatePresence>
                {showPreview && isCameraOn && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="w-48 aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative"
                    >
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover mirror"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> Live AI Guard
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                layout
                className="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-xl border border-white flex items-center gap-2 group cursor-pointer"
                onClick={() => setShowPreview(!showPreview)}
            >
                <div className={`w-10 h-10 rounded-full ${meta.bg} flex items-center justify-center text-xl transition-all group-hover:scale-110`}>
                    {isCameraOn ? meta.emoji : <FaVideoSlash className="text-slate-400 text-sm" />}
                </div>
                
                <div className="pr-4 py-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ADAPTO AI</p>
                    <p className={`text-sm font-black ${meta.color} leading-none mt-1`}>
                        {isCameraOn ? meta.label : 'Camera Off'}
                    </p>
                </div>

                <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] text-white font-black animate-bounce shadow-lg shadow-indigo-200">
                    <FaBrain />
                </div>
            </motion.div>
        </div>
    );
};

export default EmotionTracker;
