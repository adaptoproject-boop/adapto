import React from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { mockLessons, mockUser } from '../mockData';
import SubjectCard from '../components/SubjectCard';
import { Link } from 'react-router-dom';
import { useLearning } from '../context/LearningContext';
import { FaPlay, FaSearch, FaStar, FaAward, FaChevronRight, FaRocket, FaFire, FaGamepad, FaMusic, FaPalette } from 'react-icons/fa';
import Mascot from '../components/Mascot';
import CartoonButton from '../components/CartoonButton';

const ALL_BADGES = [
    {
        name: "Star Starter",
        description: "Complete your first lesson and quiz!",
        emoji: "⭐",
        criteria: "1 completed lesson",
        gradient: "from-yellow-400 to-amber-500 shadow-yellow-100",
        borderColor: "border-yellow-200"
    },
    {
        name: "Active Learner",
        description: "Complete 5 lessons and quizzes!",
        emoji: "🔥",
        criteria: "5 completed lessons",
        gradient: "from-orange-400 to-red-500 shadow-orange-100",
        borderColor: "border-orange-200"
    },
    {
        name: "Subject Master",
        description: "Complete 10 lessons and quizzes!",
        emoji: "👑",
        criteria: "10 completed lessons",
        gradient: "from-purple-400 to-indigo-500 shadow-purple-100",
        borderColor: "border-purple-200"
    },
    {
        name: "Fast Learner",
        description: "Finish a quiz in under 5 seconds with a high score!",
        emoji: "⚡",
        criteria: "Fast & Smart quiz completion",
        gradient: "from-blue-400 to-cyan-500 shadow-blue-100",
        borderColor: "border-blue-200"
    },
    {
        name: "Streak Champion",
        description: "Answer 5 questions correctly in a row!",
        emoji: "🏆",
        criteria: "5-question correct streak",
        gradient: "from-pink-400 to-rose-500 shadow-pink-100",
        borderColor: "border-pink-200"
    }
];

const KidDashboard = () => {
    const { userProgress, t, teacherMaterials, teacherQuizzes, curriculumLessons } = useLearning();
    const [showBadgesModal, setShowBadgesModal] = React.useState(false);

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const [communityStats, setCommunityStats] = React.useState({ totalStudents: 1240, averageScore: 85 });
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchResults, setSearchResults] = React.useState([]);
    const [matchedLessons, setMatchedLessons] = React.useState([]);
    const [showAllMaterials, setShowAllMaterials] = React.useState(false);
    const [showAllQuizzes, setShowAllQuizzes] = React.useState(false);

    const debounceTimerRef = React.useRef(null);

    const handleSearch = async (query) => {
        const cleanQuery = query?.trim();
        if (!cleanQuery) {
            setSearchResults([]);
            setMatchedLessons([]);
            return;
        }

        setIsSearching(true);

        // 1. Search locally through all lessons (curriculum + teacher added)
        const combined = [];
        const seenIds = new Set();
        const appendLessons = (list) => {
            if (Array.isArray(list)) {
                list.forEach(l => {
                    const lid = l.id || l._id;
                    if (lid && !seenIds.has(lid)) {
                        seenIds.add(lid);
                        combined.push(l);
                    }
                });
            }
        };
        appendLessons(curriculumLessons);
        appendLessons(teacherMaterials);
        const sourceData = combined.length > 0 ? combined : mockLessons;

        const q = cleanQuery.toLowerCase();
        const matches = sourceData.filter(lesson => {
            const title = (lesson.title || lesson.topic || "").toLowerCase();
            const subject = (lesson.subject || "").toLowerCase();
            const description = (lesson.description || "").toLowerCase();
            return title.includes(q) || subject.includes(q) || description.includes(q);
        });
        setMatchedLessons(matches);

        // 2. Supplement with related YouTube content
        try {
            const response = await axios.post('http://localhost:5612/api/youtube/videos', {
                subject: cleanQuery,
                topic: cleanQuery,
                difficulty: 'Easy',
                content_type: 'Fun',
                max_results: 6
            });
            if (response.data && response.data.videos) {
                setSearchResults(response.data.videos);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search trigger as the kid types
    React.useEffect(() => {
        const query = searchQuery.trim();
        if (!query) {
            setSearchResults([]);
            setMatchedLessons([]);
            return;
        }

        // Cancel any pending debounced search
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set a new timer to search after 600ms of typing inactivity
        debounceTimerRef.current = setTimeout(() => {
            handleSearch(query);
        }, 600);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery]);

    // Manual click or submit handler for instant search (bypassing debounce)
    const handleManualSubmit = (e) => {
        if (e) e.preventDefault();
        
        // Clear any pending debounced search to prevent duplicate requests
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        handleSearch(searchQuery);
    };

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsRes = await axios.get('http://localhost:5612/api/analytics/stats/community');
                if (statsRes.data) {
                    setCommunityStats(statsRes.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };
        fetchStats();
    }, []);

    const getSubjectList = () => {
        const subjects = [];
        const processedSubjects = new Set();
        
        // Combine curriculum lessons and teacher materials
        const combined = [];
        const seenIds = new Set();

        const appendLessons = (list) => {
            if (Array.isArray(list)) {
                list.forEach(l => {
                    const lid = l.id || l._id;
                    if (lid && !seenIds.has(lid)) {
                        seenIds.add(lid);
                        combined.push(l);
                    }
                });
            }
        };

        appendLessons(curriculumLessons);
        appendLessons(teacherMaterials);

        const sourceData = combined.length > 0 ? combined : mockLessons;

        sourceData.forEach(lesson => {
            const subjectName = lesson.subject;
            if (!processedSubjects.has(subjectName)) {
                processedSubjects.add(subjectName);
                const subjectLessons = sourceData.filter(l => l.subject === subjectName);
                
                const subjectMeta = {
                    "Numbers & Math": { emoji: "🔢", color: "bg-amber-100", textColor: "text-amber-600", from: "from-amber-400", to: "to-orange-500" },
                    "Language Basics": { emoji: "🗣️", color: "bg-blue-100", textColor: "text-blue-600", from: "from-blue-400", to: "to-indigo-500" },
                    "Shapes & Colors": { emoji: "🌈", color: "bg-pink-100", textColor: "text-pink-600", from: "from-pink-400", to: "to-rose-500" },
                    "Animals & Nature": { emoji: "🦁", color: "bg-green-100", textColor: "text-green-600", from: "from-green-400", to: "to-emerald-500" },
                    "Letters & Phonics": { emoji: "🔤", color: "bg-indigo-100", textColor: "text-indigo-600", from: "from-purple-400", to: "to-violet-500" },
                    "Games & Activities": { emoji: "🎮", color: "bg-purple-100", textColor: "text-purple-600", from: "from-cyan-400", to: "to-sky-500" }
                };

                const meta = subjectMeta[subjectName] || { emoji: "📚", color: "bg-slate-100", textColor: "text-slate-600", from: "from-slate-400", to: "to-slate-600" };

                const completedInSubject = subjectLessons.filter(l => userProgress.completedLessons?.includes(l._id || l.id)).length;
                const progressPercent = subjectLessons.length > 0 ? (completedInSubject / subjectLessons.length) * 100 : 0;

                subjects.push({
                    name: subjectName,
                    emoji: lesson.emoji || meta.emoji,
                    color: meta.color,
                    textColor: meta.textColor,
                    from: meta.from,
                    to: meta.to,
                    progress: Math.round(progressPercent),
                    firstLessonId: subjectLessons[0]?._id || subjectLessons[0]?.id,
                    currentLevel: (userProgress.currentLevels?.[subjectName] || 'Easy').toLowerCase()
                });
            }
        });
        return subjects;
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-24 px-4 sm:px-6 relative overflow-hidden text-gray-800">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100 blur-[150px] rounded-full opacity-40 -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-50 blur-[120px] rounded-full opacity-50 -z-10" />

            <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                {/* Hero Section - Redesigned to be more full */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative w-full rounded-[50px] overflow-hidden shadow-2xl shadow-indigo-100 bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 p-8 md:p-16 border-8 border-white/10"
                >
                    {/* Floating icons in background */}
                    <div className="absolute top-10 right-20 text-white/10 text-9xl rotate-12 pointer-events-none"><FaRocket /></div>
                    <div className="absolute bottom-10 left-20 text-white/10 text-8xl -rotate-12 pointer-events-none"><FaAward /></div>

                    <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                        <div className="flex-1 text-center lg:text-left text-white">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                <FaFire className="text-orange-400" /> Daily Adventure Awaits
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black leading-[1.1] mb-8">
                                Welcome back, <br />
                                <span className="text-yellow-300">{userProgress.name || 'Explorer'}!</span>
                            </h1>

                            {/* Continue Learning Widget */}
                            {userProgress.completedLessons && userProgress.completedLessons.length > 0 && (
                                <motion.div 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="bg-white/10 backdrop-blur-xl p-6 rounded-[32px] border border-white/20 mb-8 hover:bg-white/20 transition-all cursor-pointer group"
                                    onClick={() => {
                                        const lastLessonId = userProgress.completedLessons[userProgress.completedLessons.length - 1];
                                        // Simple logic to find "Next" or re-play "Last"
                                        window.location.href = `/lesson/${lastLessonId}`;
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-indigo-900 text-xl shadow-lg group-hover:scale-110 transition-transform">
                                            <FaPlay />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Continue Your Quest</p>
                                            <h3 className="text-lg font-black text-white leading-tight">Pick up where you left off!</h3>
                                        </div>
                                        <FaChevronRight className="ml-auto text-white/50" />
                                    </div>
                                </motion.div>
                            )}

                            <form onSubmit={handleManualSubmit} className="relative max-w-xl group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for subjects, topics, or games..."
                                    className="w-full px-8 py-6 bg-white rounded-[28px] text-lg font-bold text-gray-700 placeholder-gray-400 focus:outline-none shadow-2xl transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="absolute right-2.5 top-2.5 bottom-2.5 px-8 bg-indigo-600 rounded-2xl text-white font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                                >
                                    {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSearch />}
                                    <span className="hidden sm:inline">Explore</span>
                                </button>
                            </form>
                        </div>
                        <div className="hidden lg:block scale-125 hover:scale-135 transition-transform duration-500">
                            <Mascot type="lion" size="xl" emotion="happy" />
                        </div>
                    </div>
                </motion.div>

                {/* Sub-Header Stats - More compact */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                    <StatPill icon="⭐" value={userProgress.totalStars || 0} label="Golden Stars" />
                    <StatPill icon="🔥" value={1} label="Day Streak" />
                    <StatPill icon="👥" value={communityStats.totalStudents} label="Learners Online" />
                    <Link to="/parent">
                        <button className="bg-white h-full px-8 py-4 rounded-[30px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-indigo-100 transition-all group">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📊</div>
                            <div className="text-left">
                                <p className="font-black text-gray-800 leading-none text-sm tracking-tight">Daily Report</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Check Progress</p>
                            </div>
                        </button>
                    </Link>
                </div>

                {/* Search Discoveries */}
                <AnimatePresence>
                    {searchQuery.trim() && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white p-8 rounded-[40px] shadow-xl shadow-indigo-100/50 border border-indigo-50 space-y-6 overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-pink-500 rounded-full animate-bounce" />
                                    Search Discoveries 🌟
                                </h3>
                                <button 
                                    onClick={() => { setSearchQuery(""); setSearchResults([]); setMatchedLessons([]); }}
                                    className="text-xs font-black text-pink-500 uppercase tracking-widest hover:underline hover:scale-105 active:scale-95 transition-all"
                                >
                                    Clear Search
                                </button>
                            </div>

                            {isSearching && searchResults.length === 0 && matchedLessons.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-gray-500 animate-pulse">Scanning the universe for lessons...</p>
                                </div>
                            ) : (matchedLessons.length > 0 || searchResults.length > 0) ? (
                                <div className="space-y-8">
                                    {/* Match Lessons Section */}
                                    {matchedLessons.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-black text-indigo-700 flex items-center gap-2">
                                                🏫 Curriculum Lessons Found ({matchedLessons.length})
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                                {matchedLessons.map((lesson, idx) => {
                                                    const isCompleted = userProgress.completedLessons?.includes(lesson._id || lesson.id);
                                                    const subjectMeta = {
                                                        "Numbers & Math": { emoji: "🔢", color: "bg-amber-100", textColor: "text-amber-600" },
                                                        "Language Basics": { emoji: "🗣️", color: "bg-blue-100", textColor: "text-blue-600" },
                                                        "Shapes & Colors": { emoji: "🌈", color: "bg-pink-100", textColor: "text-pink-600" },
                                                        "Animals & Nature": { emoji: "🦁", color: "bg-green-100", textColor: "text-green-600" },
                                                        "Letters & Phonics": { emoji: "🔤", color: "bg-indigo-100", textColor: "text-indigo-600" },
                                                        "Games & Activities": { emoji: "🎮", color: "bg-purple-100", textColor: "text-purple-600" }
                                                    };
                                                    const meta = subjectMeta[lesson.subject] || { emoji: "📚", color: "bg-slate-100", textColor: "text-slate-600" };

                                                    return (
                                                        <motion.div
                                                            key={lesson.id || lesson._id || idx}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="group relative bg-slate-50 border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all flex flex-col justify-between"
                                                        >
                                                            <div>
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className={`w-12 h-12 rounded-2xl ${meta.color} flex items-center justify-center text-2xl`}>
                                                                        {lesson.emoji || meta.emoji}
                                                                    </div>
                                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                                                        lesson.difficulty?.toLowerCase() === 'hard' ? 'bg-red-50 text-red-500 border-red-100' :
                                                                        lesson.difficulty?.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                        'bg-green-50 text-green-600 border-green-100'
                                                                    }`}>
                                                                        {lesson.difficulty || 'Easy'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">{lesson.subject}</p>
                                                                <h4 className="text-sm font-black text-gray-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                                                    {lesson.title || lesson.topic}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                                                                    {lesson.description || `Embark on an exciting journey to master ${lesson.title || lesson.topic}!`}
                                                                </p>
                                                            </div>
                                                            
                                                            <Link 
                                                                to={`/lesson/${lesson.id || lesson._id}?topic=${encodeURIComponent(lesson.title || lesson.topic)}&subject=${encodeURIComponent(lesson.subject)}&videoUrl=${encodeURIComponent(lesson.video_url || lesson.youtube_url || '')}`}
                                                                className="block"
                                                            >
                                                                <CartoonButton 
                                                                    variant={isCompleted ? "success" : "primary"} 
                                                                    className="w-full !py-2.5 !text-xs"
                                                                >
                                                                    {isCompleted ? "Play Again 🔄" : "Start Quest 🎒"}
                                                                </CartoonButton>
                                                            </Link>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Video Discoveries Section */}
                                    {searchResults.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <h4 className="text-lg font-black text-indigo-700 flex items-center gap-2">
                                                🎥 Fun Learning Videos Found
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                                {searchResults.map((video, idx) => {
                                                    const topicParam = video.title;
                                                    const subjectParam = searchQuery;
                                                    const embedUrlParam = video.embedUrl || `https://www.youtube.com/embed/${video.videoId}`;
                                                    return (
                                                        <motion.div
                                                            key={video.videoId || idx}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="group relative bg-slate-50 border border-slate-100 p-4 rounded-[30px] shadow-sm hover:shadow-lg transition-all"
                                                        >
                                                            <Link 
                                                                to={`/lesson/${encodeURIComponent(video.videoId || video.title)}?topic=${encodeURIComponent(topicParam)}&subject=${encodeURIComponent(subjectParam)}&videoUrl=${encodeURIComponent(embedUrlParam)}`}
                                                                className="block"
                                                            >
                                                                <div className="aspect-video w-full rounded-2xl overflow-hidden relative mb-4">
                                                                    <img 
                                                                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                                                                        alt={video.title}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    />
                                                                    <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-indigo-900/30 transition-all flex items-center justify-center">
                                                                        <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
                                                                            <FaPlay className="translate-x-[1px]" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <h4 className="font-black text-sm text-gray-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                                                    {video.title}
                                                                </h4>
                                                                <p className="text-[10px] font-black text-indigo-400 mt-2 uppercase tracking-wider">Start Discovery Lesson →</p>
                                                            </Link>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-sm font-bold text-gray-400 py-6">No matching adventures found. Try another search!</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Side: Subjects (8 cols) */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                <div className="w-2 h-8 bg-indigo-500 rounded-full" />
                                Pick Your Journey 🌈
                            </h3>
                            <button className="text-xs font-black text-indigo-500 uppercase tracking-widest">See All</button>
                        </div>

                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-2 sm:grid-cols-3 gap-6"
                        >
                            {getSubjectList().map((subject) => (
                                <motion.div key={subject.name} variants={item}>
                                    <Link to={`/subject/${encodeURIComponent(subject.name)}`}>
                                        <div className={`group relative bg-white p-6 rounded-[35px] border-b-8 border-gray-100 hover:border-indigo-100 shadow-sm hover:shadow-xl transition-all h-full`}>
                                            <div className={`w-16 h-16 rounded-2xl ${subject.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                                                {subject.emoji}
                                            </div>
                                            <h4 className="text-lg font-black text-gray-800 mb-1">{subject.name}</h4>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${subject.textColor}`}>Explore →</span>
                                                    <span className={`text-[8px] font-black uppercase mt-1 px-2 py-0.5 rounded-full border ${
                                                        subject.currentLevel === 'hard' ? 'bg-red-50 text-red-500 border-red-100' :
                                                        subject.currentLevel === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-green-50 text-green-600 border-green-100'
                                                    }`}>
                                                        {subject.currentLevel}
                                                    </span>
                                                </div>
                                                <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-gradient-to-r ${subject.from} ${subject.to}`} style={{ width: `${subject.progress}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right Side: Quick Tools & Activities (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl rotate-12"><FaGamepad /></div>
                            <h3 className="text-xl font-black text-gray-800 mb-6">Mini Activities</h3>
                            <div className="space-y-4">
                                <QuickLink icon={<FaPalette className="text-pink-400" />} title="Drawing Fun" sub="Doodle & Draw" to="/learning/touch" />
                                <QuickLink icon={<FaMusic className="text-blue-400" />} title="Sing Along" sub="Nursery Rhymes" to="/subject/Language%20Basics" />
                                <QuickLink icon={<FaStar className="text-yellow-400" />} title="Star Quest" sub="Daily Challenges" to="/parent" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-100 text-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                             <div className="text-5xl mb-4 relative z-10 animate-bounce">🏆</div>
                             <h4 className="text-lg font-black mb-1 relative z-10">Level 5 Achieved!</h4>
                             <p className="text-indigo-200 text-xs font-bold mb-6 relative z-10">You're doing amazing, {userProgress.name || 'Explorer'}!</p>
                             <div className="relative z-10">
                                <CartoonButton 
                                    variant="primary" 
                                    onClick={() => setShowBadgesModal(true)} 
                                    className="w-full !bg-white !text-indigo-600 !py-3 !text-xs !border-b-indigo-200"
                                >
                                    View Badges
                                </CartoonButton>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Modal */}
            <AnimatePresence>
                {showBadgesModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-950/60 backdrop-blur-md p-4 sm:p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white rounded-[40px] max-w-2xl w-full p-8 shadow-2xl relative border-b-8 border-indigo-200"
                        >
                            {/* Close button */}
                            <button 
                                onClick={() => setShowBadgesModal(false)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-gray-500 rounded-full flex items-center justify-center transition-colors text-lg font-black shadow-sm"
                            >
                                ❌
                            </button>

                            <div className="text-center mb-6">
                                <span className="text-5xl">🏆</span>
                                <h3 className="text-3xl font-black text-gray-800 mt-3 mb-1">Badges Collection</h3>
                                <p className="text-gray-500 text-sm font-medium">
                                    You've unlocked <span className="text-indigo-600 font-extrabold">{userProgress.badges?.length || 0}</span> out of <span className="font-extrabold">{ALL_BADGES.length}</span> badges!
                                </p>
                                
                                {/* Progress Bar */}
                                <div className="mt-4 max-w-xs mx-auto bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                                    <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${((userProgress.badges?.length || 0) / ALL_BADGES.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Badges Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto pr-2 mt-4 custom-scrollbar">
                                {ALL_BADGES.map((badge, idx) => {
                                    const isUnlocked = userProgress.badges && userProgress.badges.includes(badge.name);
                                    return (
                                        <motion.div
                                            key={idx}
                                            whileHover={isUnlocked ? { scale: 1.03, y: -2 } : {}}
                                            className={`p-5 rounded-3xl border transition-all duration-300 relative ${
                                                isUnlocked 
                                                    ? `bg-gradient-to-br from-indigo-50/50 to-purple-50/50 ${badge.borderColor} shadow-sm` 
                                                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                                            }`}
                                        >
                                            {/* Badge Icon */}
                                            <div className="flex justify-center mb-3">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner relative border-4 ${
                                                    isUnlocked 
                                                        ? `bg-gradient-to-br ${badge.gradient} border-white text-white` 
                                                        : 'bg-slate-200 border-slate-300 text-slate-400'
                                                }`}>
                                                    {isUnlocked ? badge.emoji : '🔒'}
                                                </div>
                                            </div>

                                            {/* Badge Info */}
                                            <div className="text-center">
                                                <h4 className={`font-black text-sm ${isUnlocked ? 'text-gray-800' : 'text-slate-400'}`}>
                                                    {badge.name}
                                                </h4>
                                                <p className="text-[10px] text-gray-500 font-semibold mt-1 leading-tight min-h-[32px] flex items-center justify-center">
                                                    {badge.description}
                                                </p>
                                                
                                                {/* Unlock criteria / Status badge */}
                                                <div className="mt-3">
                                                    {isUnlocked ? (
                                                        <span className="inline-block bg-green-100 text-green-700 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider border border-green-200">
                                                            Unlocked 🎉
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block bg-slate-200 text-slate-500 text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                                                            {badge.criteria}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Footer Button */}
                            <div className="mt-8 flex justify-center">
                                <CartoonButton variant="primary" onClick={() => setShowBadgesModal(false)} className="px-8 py-3 !text-sm">
                                    Keep Exploring! 🚀
                                </CartoonButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatPill = ({ icon, value, label }) => (
    <div className="bg-white px-6 py-4 rounded-[28px] shadow-sm border border-gray-100 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="text-left">
            <p className="font-black text-gray-800 leading-none text-sm tracking-tight">{value}</p>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    </div>
);

const QuickLink = ({ icon, title, sub, to }) => (
    <Link to={to} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white shadow-sm transition-colors">
            {icon}
        </div>
        <div className="flex-1">
            <p className="font-bold text-gray-800 text-sm leading-none">{title}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{sub}</p>
        </div>
        <FaChevronRight className="text-gray-300 text-[10px]" />
    </Link>
);

export default KidDashboard;
