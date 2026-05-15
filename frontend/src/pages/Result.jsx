import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import CartoonButton from '../components/CartoonButton';
import { FaStar, FaTrophy, FaRedo, FaHome, FaArrowRight, FaClock, FaMedal, FaRocket, FaLightbulb, FaSync, FaChevronDown, FaChevronUp, FaFire, FaArrowUp, FaSmile, FaBrain, FaChevronRight, FaCheck } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        score = 0,
        total = 5,
        scorePercent = 0,
        lessonTitle = "Quiz",
        lessonId = "1",
        subject = "General",
        starsEarned = 0,
        passed = false,
        nextTopic = null,
        nextAction = 'REVISION',
        newBadges = [],
        responseTimes = [],
        questions = [],
        userAnswers = [],
        // ── Adaptive ML fields from orchestrator ──
        levelUp = false,
        encouragement = false,
        nextLesson = null,
        nextDifficulty = 'same',
        streakCorrect = 0,
        streakWrong = 0,
        confusedRatio = 0,
        retries = 0,
    } = location.state || {};

    const [showReview, setShowReview] = useState(false);
    const [showBadgePopup, setShowBadgePopup] = useState(newBadges.length > 0);

    const calculatedAvgTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;
    
    const avgTime = location.state?.avgTime || calculatedAvgTime;

    // ── Compute action FIRST so hooks can reference it ──
    const getActionConfig = () => {
        if (score === 0) {
            return {
                icon: <FaSync />,
                title: "Let's Watch Again!",
                color: "bg-red-500",
                btnText: "Watch Video Again 🔄",
                link: `/lesson/${lessonId}`,
                sub: "You got 0 score. You must watch the video again carefully!",
                activityTitle: "Break Time! 🕒",
                activity: "Take a 5-minute break, stretch your hands, drink some water, and get ready to focus!"
            };
        }

        switch (nextAction) {
            case 'NEXT_TOPIC':
                return {
                    icon: <FaRocket />,
                    title: "Ready for Next Adventure!",
                    color: "bg-green-500",
                    btnText: "Next Topic 🚀",
                    link: nextLesson ? `/lesson/${nextLesson._id || nextLesson.id}?topic=${encodeURIComponent(nextLesson.topic || nextLesson.title || '')}&subject=${encodeURIComponent(nextLesson.subject || subject)}` : (nextTopic ? `/lesson/${nextTopic}` : "/dashboard"),
                    sub: "You mastered this! Let's go ahead!",
                    activityTitle: "Teach Someone! 👨‍🏫",
                    activity: "Can you explain what you just learned to your parents or a friend? Teaching makes you smarter!"
                };
            case 'SIMILAR':
                return {
                    icon: <FaLightbulb />,
                    title: "Great Practice!",
                    color: "bg-blue-500",
                    btnText: "Similar Practice 💡",
                    link: `/lesson/${lessonId}?style=easy_explanation`,
                    sub: "Nearly perfect! Let's try a similar one.",
                    activityTitle: "Draw it Out! 🎨",
                    activity: "Grab a paper and draw what you learned. Visualizing helps to remember things easily!"
                };
            default: // REVISION
                return {
                    icon: <FaSync />,
                    title: "Let's Watch Again!",
                    color: "bg-orange-500",
                    btnText: "Revision Time 🔄",
                    link: `/lesson/${lessonId}`,
                    sub: "Don't worry! Let's watch the video again.",
                    activityTitle: "Relax & Focus 🧘‍♀️",
                    activity: "Close your eyes, take 3 deep breaths, and watch the video again without any distractions."
                };
        }
    };

    const action = getActionConfig();

    // ── Auto-navigation countdown (only after passing) ──
    const [timeLeft, setTimeLeft] = useState(10);
    const [autoNav, setAutoNav] = useState(passed && scorePercent >= 60);

    useEffect(() => {
        if (!autoNav) return;
        
        if (timeLeft <= 0) {
            navigate(action.link);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, autoNav]);

    // ── Confetti celebration ──
    useEffect(() => {
        if (levelUp || (passed && scorePercent >= 80)) {
            confetti({
                particleCount: 200,
                spread: 90,
                origin: { y: 0.5 },
                colors: ['#FF7B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#C77DFF']
            });
        }
    }, []);

    // ── Difficulty badge colour ──
    const diffBadge = {
        easy:   { label: 'Easy',   cls: 'bg-green-100 text-green-700' },
        medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
        hard:   { label: 'Hard',   cls: 'bg-red-100 text-red-700' },
        same:   { label: 'Same Level', cls: 'bg-slate-100 text-slate-600' },
    }[nextDifficulty] || { label: nextDifficulty, cls: 'bg-slate-100 text-slate-600' };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-6 relative overflow-x-hidden">

            {/* ── Level-Up Banner ── */}
            <AnimatePresence>
                {levelUp && (
                    <motion.div
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0,  opacity: 1 }}
                        exit={{    y: -80, opacity: 0 }}
                        className="fixed top-0 inset-x-0 z-[70] flex justify-center pt-4 pointer-events-none"
                    >
                        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-2xl shadow-indigo-300 pointer-events-auto">
                            <FaArrowUp className="text-yellow-300 text-xl animate-bounce" />
                            <span className="font-black text-lg">You Levelled Up! Welcome to <span className="capitalize">{nextDifficulty}</span>! 🌟</span>
                            <FaArrowUp className="text-yellow-300 text-xl animate-bounce" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Encouragement Banner ── */}
            <AnimatePresence>
                {encouragement && !levelUp && (
                    <motion.div
                        initial={{ y: -80, opacity: 0 }}
                        animate={{ y: 0,  opacity: 1 }}
                        exit={{    y: -80, opacity: 0 }}
                        className="fixed top-0 inset-x-0 z-[70] flex justify-center pt-4 pointer-events-none"
                    >
                        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white px-8 py-4 rounded-full shadow-2xl shadow-orange-200 pointer-events-auto">
                            <FaSmile className="text-yellow-200 text-xl" />
                            <span className="font-black text-lg">Great try! Let's try an easier one 💪 You've got this!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Badge Popup */}
            <AnimatePresence>
                {showBadgePopup && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl"
                        >
                            <div className="text-6xl mb-4 animate-bounce">🏆</div>
                            <h2 className="text-2xl font-black text-gray-800 mb-2">New Badge!</h2>
                            <p className="text-gray-500 mb-6 font-medium">You earned the <span className="text-indigo-600 font-black">{newBadges[0]}</span> badge!</p>
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-inner">
                                    <FaMedal className="text-yellow-500 text-5xl" />
                                </div>
                            </div>
                            <CartoonButton variant="primary" onClick={() => setShowBadgePopup(false)} className="w-full">
                                Yay! Thanks! 🎈
                            </CartoonButton>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-5xl">
                <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
                    {/* Main Performance Card */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex-1 bg-white rounded-3xl p-8 shadow-xl border-b-8 border-gray-200"
                    >
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-5xl shadow-inner">
                                {scorePercent >= 80 ? '🦁' : scorePercent >= 50 ? '🦊' : '🦉'}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-gray-800 leading-tight flex items-center gap-3">
                                    {scorePercent >= 80 ? 'Super Hero!' : scorePercent >= 50 ? 'Great Job!' : 'Keep Trying!'}
                                    {passed && <FaCheck className="text-green-500 text-2xl" />}
                                </h1>
                                <p className="text-indigo-500 font-bold tracking-wide uppercase text-sm mt-1">{subject} • {lessonTitle}</p>
                                {passed && (
                                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2">
                                        <FaCheck /> Lesson Completed
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Score"    value={`${score}/${total}`}      icon={<FaStar className="text-yellow-400" />} />
                            <StatCard label="Accuracy" value={`${scorePercent}%`}        icon={<FaTrophy className="text-orange-400" />} />
                            <StatCard label="Speed"    value={`${avgTime.toFixed(1)}s`}  icon={<FaClock className="text-blue-400" />} />
                            <StatCard label="Stars"    value={`+${starsEarned}`}         icon={<div className="text-yellow-400 text-xl">⭐</div>} />
                        </div>

                        {/* ── Streak Badge ── */}
                        {streakCorrect >= 3 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-3 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-2xl mb-6 shadow-lg shadow-orange-100"
                            >
                                <FaFire className="text-yellow-200 text-2xl animate-pulse" />
                                <span className="font-black">{streakCorrect} Correct Streak! 🔥 You're on fire!</span>
                            </motion.div>
                        )}

                        {/* ── AI Behavioral Insights (ML Integration) ── */}
                        <div className="bg-indigo-50/50 rounded-3xl p-6 mb-8 border border-indigo-100/50">
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FaBrain className="text-indigo-600" /> ADAPTO AI Behavioral Insights
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-white">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                                        {confusedRatio > 0.4 ? '🤔' : '🧠'}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Focus Level</p>
                                        <p className="font-black text-gray-800">
                                            {confusedRatio > 0.6 ? 'Deep Thinking' : confusedRatio > 0.3 ? 'Interested' : 'Super Focused!'}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-white">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                                        {retries > 1 ? '🧗' : '🚀'}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Learning Persistence</p>
                                        <p className="font-black text-gray-800">
                                            {retries > 2 ? 'Incredible Grit!' : retries > 0 ? 'Good Effort' : 'Perfect Flow'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/dashboard" className="flex-1">
                                <CartoonButton variant="secondary" className="w-full !py-4">
                                    <FaHome /> Go Home
                                </CartoonButton>
                            </Link>
                            <Link to={`/quiz/${lessonId}`} className="flex-1">
                                <CartoonButton variant="secondary" className="w-full !py-4">
                                    <FaRedo /> Try Again
                                </CartoonButton>
                            </Link>
                        </div>
                    </motion.div>

                    {/* ── Main Adventure Action (The "UX Flow" fix for kids) ── */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden border-b-8 border-indigo-800"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl rotate-12">
                                {action.icon}
                            </div>
                            
                            <h2 className="text-3xl font-black mb-4 relative z-10 flex items-center gap-3">
                                {action.title} 🌟
                            </h2>
                            <p className="text-indigo-100 text-lg font-medium mb-8 max-w-md relative z-10">
                                {action.sub}
                            </p>

                            <Link to={action.link} className="relative z-10 block">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    {autoNav && (
                                        <div className="flex items-center justify-center gap-2 mb-4">
                                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">
                                                Starting next adventure in {timeLeft}s...
                                            </span>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); setAutoNav(false); }}
                                                className="text-[10px] font-black underline ml-2 text-white/50 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    <button className="w-full bg-white text-indigo-600 py-6 rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(224,231,255)] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4">
                                        {action.btnText} <FaChevronRight />
                                    </button>
                                </motion.div>
                            </Link>

                            <div className="mt-8 flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 relative z-10">
                                <div className="text-3xl">✨</div>
                                <div>
                                    <h4 className="font-black text-indigo-200 text-[10px] uppercase tracking-widest">{action.activityTitle}</h4>
                                    <p className="text-sm font-bold text-white/90">{action.activity}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── Next Lesson Path (If available) ── */}
                        {nextLesson && (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white rounded-[40px] p-8 shadow-xl border-2 border-indigo-100 relative overflow-hidden group hover:border-indigo-300 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                        <FaArrowRight className="text-indigo-500" /> Coming Up Next
                                    </h2>
                                    <DiffBadge diff={nextLesson.difficulty} />
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-5 mb-6">
                                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">{nextLesson.subject}</p>
                                    <p className="font-black text-gray-800 text-xl leading-snug">{nextLesson.topic || nextLesson.title}</p>
                                </div>
                                <Link to={`/lesson/${nextLesson.id || nextLesson._id}?topic=${encodeURIComponent(nextLesson.topic || nextLesson.title)}&subject=${encodeURIComponent(nextLesson.subject)}&videoUrl=${encodeURIComponent(nextLesson.video_url || nextLesson.youtube_url || '')}`}>
                                    <CartoonButton variant="primary" className="w-full !py-4 shadow-lg">
                                        Explore This Adventure <FaRocket />
                                    </CartoonButton>
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* ── Progress Journey (Visual Flow) ── */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FlowStep 
                        icon="🎮" 
                        title="Quiz Done!" 
                        desc="You've earned your stars for this lesson." 
                        completed={true} 
                    />
                    <FlowStep 
                        icon="🗺️" 
                        title="AI Path Ready" 
                        desc={`Moving to ${nextDifficulty.toUpperCase()} content.`} 
                        completed={false} 
                        active={true}
                    />
                    <FlowStep 
                        icon="🏅" 
                        title="Final Goal" 
                        desc="Complete 2 more to get a trophy!" 
                        completed={false} 
                    />
                </div>

                {/* ── ML Orchestrator Logic Detail ── */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="w-full bg-white rounded-3xl p-8 mb-8 border-l-8 border-indigo-500 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
                            <FaLightbulb className="text-yellow-400" /> Why this next step?
                        </h3>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">Decision Engine: ADAPTO-v1</span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <div className={`p-4 rounded-2xl ${levelUp ? 'bg-green-50 border border-green-100' : encouragement ? 'bg-orange-50 border border-orange-100' : 'bg-blue-50 border border-blue-100'}`}>
                                <p className="font-bold text-gray-700 mb-1">Pedagogical Decision:</p>
                                <p className="text-sm text-gray-600">
                                    {levelUp 
                                        ? `The AI detected high mastery (${scorePercent}%) and a strong streak (${streakCorrect}). Promoting to ${nextDifficulty.toUpperCase()} content.`
                                        : encouragement
                                        ? `The AI observed some difficulty. Switching to ${nextDifficulty.toUpperCase()} content to rebuild confidence.`
                                        : `Steady progress maintained. Difficulty kept at ${nextDifficulty.toUpperCase()} for reinforcement.`
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-64 space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Live Feature Weights</p>
                            <FeatureBar label="Performance" value={scorePercent} color="bg-green-500" />
                            <FeatureBar label="Focus" value={Math.max(0, 100 - (confusedRatio * 100))} color="bg-blue-500" />
                            <FeatureBar label="Persistence" value={Math.max(0, 100 - (retries * 30))} color="bg-orange-500" />
                            <FeatureBar label="Streak" value={Math.min(100, streakCorrect * 20)} color="bg-red-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Review Section */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
                >
                    <button onClick={() => setShowReview(!showReview)} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500"><FaLightbulb /></div>
                            <h3 className="text-xl font-black text-gray-800">Review Questions</h3>
                        </div>
                        {showReview ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <AnimatePresence>
                        {showReview && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <div className="p-6 pt-0 border-t border-gray-50 flex flex-col gap-4">
                                    {questions.map((q, i) => {
                                        const userAnswer = userAnswers[i];
                                        const isCorrect = userAnswer?.correct;
                                        return (
                                            <div key={i} className={`p-5 rounded-2xl border-2 ${isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>{i + 1}</div>
                                                    <p className="font-bold text-gray-800 text-lg">{q.question || q.text}</p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                                                    <p className="text-sm"><span className="text-gray-400">Your Answer: </span><span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{q.options[userAnswer?.selected] || 'No Answer'}</span></p>
                                                    {!isCorrect && <p className="text-sm"><span className="text-gray-400">Correct: </span><span className="font-bold text-green-600">{q.options[q.correctAnswer]}</span></p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon }) => (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
        <div className="text-sm mb-1">{icon}</div>
        <div className="text-xl font-black text-gray-800">{value}</div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    </div>
);

const FeatureBar = ({ label, value, color }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-gray-500">
            <span>{label}</span>
            <span>{Math.round(value)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className={`h-full ${color}`} />
        </div>
    </div>
);

const FlowStep = ({ icon, title, desc, completed, active }) => (
    <div className={`p-6 rounded-[32px] border-2 transition-all ${
        completed ? 'bg-green-50 border-green-100' : 
        active ? 'bg-indigo-50 border-indigo-200 shadow-md scale-105' : 
        'bg-white border-gray-100 opacity-60'
    }`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${
            completed ? 'bg-green-400 text-white' : 
            active ? 'bg-indigo-600 text-white shadow-lg' : 
            'bg-gray-100 text-gray-400'
        }`}>
            {completed ? <FaCheck /> : icon}
        </div>
        <h4 className="font-black text-gray-800 text-sm mb-1">{title}</h4>
        <p className="text-[10px] font-bold text-gray-400 leading-tight">{desc}</p>
    </div>
);

const DiffBadge = ({ diff }) => {
    const b = {
        easy:   { label: 'Easy',   cls: 'bg-green-100 text-green-700 border-green-200' },
        medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
        hard:   { label: 'Hard',   cls: 'bg-red-100 text-red-700 border-red-200' },
        Easy:   { label: 'Easy',   cls: 'bg-green-100 text-green-700 border-green-200' },
        Medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
        Hard:   { label: 'Hard',   cls: 'bg-red-100 text-red-700 border-red-200' },
    }[diff] || { label: diff || 'Easy', cls: 'bg-slate-100 text-slate-500 border-slate-200' };

    return (
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${b.cls}`}>
            {b.label}
        </span>
    );
};

export default Result;
