import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaChevronLeft, FaChevronRight, FaStar, FaFilm, FaGraduationCap, FaRocket, FaLightbulb } from 'react-icons/fa';
import { mockLessons } from '../mockData';
import { useLearning } from '../context/LearningContext';
import Mascot from '../components/Mascot';
import CartoonButton from '../components/CartoonButton';
import { FaCheck } from 'react-icons/fa';
import { API_URL } from '../api/config';

const DIFF_BADGE = {
    easy:   { label: 'Easy',   cls: 'bg-green-100 text-green-700 border-green-200' },
    medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    hard:   { label: 'Hard',   cls: 'bg-red-100 text-red-700 border-red-200' },
    Easy:   { label: 'Easy',   cls: 'bg-green-100 text-green-700 border-green-200' },
    Medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    Hard:   { label: 'Hard',   cls: 'bg-red-100 text-red-700 border-red-200' },
};

const DiffBadge = ({ diff }) => {
    const b = DIFF_BADGE[diff] || { label: diff || 'Easy', cls: 'bg-slate-100 text-slate-500' };
    return (
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${b.cls}`}>
            {b.label}
        </span>
    );
};

const SubjectDetail = () => {
    const { subjectName } = useParams();
    const { userProgress, teacherMaterials, getCurrentLevel } = useLearning();

    // Current difficulty for this subject (from adaptive engine)
    const currentDiff = (getCurrentLevel ? getCurrentLevel(subjectName) : userProgress?.currentLevels?.[subjectName] || 'easy').toLowerCase();

    const [curriculumLessons, setCurriculumLessons] = useState([]);
    const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(true);

    useEffect(() => {
        const fetchCurriculum = async () => {
            setIsLoadingCurriculum(true);
            try {
                const response = await fetch(`${API_URL}/curriculum/subject/${encodeURIComponent(subjectName)}`);
                const data = await response.json();
                if (data.success && data.lessons) {
                    const combined = [...data.lessons];
                    const seenIds = new Set(data.lessons.map(l => l.id || l._id));
                    
                    const subMaterials = (teacherMaterials || []).filter(m => m.subject.toLowerCase() === subjectName.toLowerCase());
                    subMaterials.forEach(m => {
                        const mid = m.id || m._id;
                        if (mid && !seenIds.has(mid)) {
                            seenIds.add(mid);
                            combined.push(m);
                        }
                    });
                    
                    setCurriculumLessons(combined);
                } else {
                    const combinedMock = mockLessons.filter(l => l.subject === subjectName);
                    const seenIds = new Set(combinedMock.map(l => l.id || l._id));
                    
                    const subMaterials = (teacherMaterials || []).filter(m => m.subject.toLowerCase() === subjectName.toLowerCase());
                    subMaterials.forEach(m => {
                        const mid = m.id || m._id;
                        if (mid && !seenIds.has(mid)) {
                            seenIds.add(mid);
                            combinedMock.push(m);
                        }
                    });
                    
                    setCurriculumLessons(combinedMock);
                }
            } catch (err) {
                console.error("Error fetching curriculum:", err);
                const combinedMock = mockLessons.filter(l => l.subject === subjectName);
                const seenIds = new Set(combinedMock.map(l => l.id || l._id));
                
                const subMaterials = (teacherMaterials || []).filter(m => m.subject.toLowerCase() === subjectName.toLowerCase());
                subMaterials.forEach(m => {
                    const mid = m.id || m._id;
                    if (mid && !seenIds.has(mid)) {
                        seenIds.add(mid);
                        combinedMock.push(m);
                    }
                });
                
                setCurriculumLessons(combinedMock);
            } finally {
                setIsLoadingCurriculum(false);
            }
        };
        fetchCurriculum();
    }, [subjectName]);

    // Sort lessons Easy -> Medium -> Hard
    const diffWeights = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'easy': 1, 'medium': 2, 'hard': 3 };
    const subjectLessons = [...curriculumLessons].sort((a, b) => {
        return (diffWeights[a.difficulty] || 99) - (diffWeights[b.difficulty] || 99);
    });

    // Helper to check if a lesson is locked because its prerequisite isn't completed yet
    const isLessonLocked = (lesson) => {
        if (!lesson.prerequisite_topic_id) return false;
        // Check if prerequisite lesson is completed
        return !userProgress.completedLessons?.includes(lesson.prerequisite_topic_id);
    };

    const subjectEmoji = subjectLessons[0]?.emoji || (subjectName === 'Numbers & Math' ? '🔢' : '📚');
    
    // Theme colors based on subject
    const getTheme = () => {
        const themes = {
            "Numbers & Math": { from: "from-amber-400", to: "to-orange-500", shadow: "shadow-orange-200", bg: "bg-orange-50" },
            "Language Basics": { from: "from-blue-400", to: "to-indigo-500", shadow: "shadow-blue-200", bg: "bg-blue-50" },
            "Shapes & Colors": { from: "from-pink-400", to: "to-rose-500", shadow: "shadow-rose-200", bg: "bg-rose-50" },
            "Animals & Nature": { from: "from-green-400", to: "to-emerald-500", shadow: "shadow-green-200", bg: "bg-emerald-50" },
            "Letters & Phonics": { from: "from-purple-400", to: "to-violet-500", shadow: "shadow-purple-200", bg: "bg-violet-50" },
            "Games & Activities": { from: "from-cyan-400", to: "to-sky-500", shadow: "shadow-sky-200", bg: "bg-sky-50" }
        };
        return themes[subjectName] || { from: "from-indigo-400", to: "to-blue-500", shadow: "shadow-indigo-200", bg: "bg-indigo-50" };
    };

    const theme = getTheme();

    // YouTube Recommended Videos state
    const [youtubeVideos, setYoutubeVideos] = useState([]);
    const [selectedYTVideo, setSelectedYTVideo] = useState(null);
    const [isLoadingYT, setIsLoadingYT] = useState(false);

    const fetchYoutubeRecommended = async () => {
        setIsLoadingYT(true);
        try {
            const response = await fetch(`${API_URL}/youtube/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: subjectName,
                    topic: `${subjectName} learning for kids nursery animated story`,
                    difficulty: userProgress?.currentLevels?.[subjectName] || 'Easy',
                    content_type: 'Fun',
                    max_results: 6
                })
            });
            const data = await response.json();
            if (data.videos) {
                setYoutubeVideos(data.videos);
            }
        } catch (error) {
            console.error("YouTube fetch error:", error);
        } finally {
            setIsLoadingYT(false);
        }
    };

    useEffect(() => {
        fetchYoutubeRecommended();
    }, [subjectName]);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-24 px-4 sm:px-6 relative overflow-hidden">
            {/* Background Premium Decorations */}
            <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br ${theme.from} ${theme.to} blur-[150px] rounded-full opacity-10 -z-10`} />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100 blur-[120px] rounded-full opacity-20 -z-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header - Compact & Premium */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/dashboard"
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm hover:shadow-md hover:text-indigo-500 transition-all border border-gray-100"
                        >
                            <FaChevronLeft />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{subjectEmoji}</span>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{subjectName}</h1>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 ml-1">Learning Path & Adventure</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs">👤</div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-gray-500 pr-2">+120 Learners Today</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Featured Hero Card */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`relative overflow-hidden rounded-[40px] p-8 md:p-12 bg-gradient-to-br ${theme.from} ${theme.to} text-white shadow-2xl ${theme.shadow}`}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 text-[200px] rotate-12 pointer-events-none">
                                {subjectEmoji}
                            </div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                        <FaRocket className="text-yellow-300" /> Subject Explorer
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Master <br/>{subjectName}!</h2>
                                    <p className="text-white/80 font-medium text-lg leading-relaxed mb-8 max-w-md">
                                        Start your adventure today. Watch cool videos, solve puzzles, and earn shiny stars!
                                    </p>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl text-xs font-bold">
                                            <FaFilm className="text-yellow-400" /> 32 Lessons
                                        </div>
                                        <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-xl text-xs font-bold">
                                            <FaStar className="text-yellow-300" /> 150+ Stars
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block scale-110">
                                    <Mascot type="lion" size="lg" emotion="happy" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Video Gallery Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                    <span className={`w-2 h-8 bg-gradient-to-b ${theme.from} ${theme.to} rounded-full`}></span>
                                    Recommended for You
                                </h3>
                                <button onClick={fetchYoutubeRecommended} className="text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:underline">Refresh ✨</button>
                            </div>

                            {isLoadingYT ? (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="aspect-video bg-white rounded-[32px] animate-pulse border border-gray-100 shadow-sm" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {/* Show YouTube videos if found, otherwise show Database Lessons */}
                                    {(youtubeVideos.length > 0 ? youtubeVideos : subjectLessons.slice(0, 4)).map((item, idx) => {
                                        const isVideo = item.videoId || item.embedUrl;
                                        const videoId = item.videoId || (item.video_url || item.youtube_url ? (() => {
                                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                            const match = (item.video_url || item.youtube_url).match(regExp);
                                            return (match && match[2].length === 11) ? match[2] : null;
                                        })() : null);

                                        return (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ y: -8 }}
                                                className="bg-white p-3 rounded-[32px] shadow-sm border border-gray-100 group cursor-pointer hover:shadow-xl hover:border-indigo-100 transition-all"
                                                onClick={() => {
                                                    if (isVideo) {
                                                        setSelectedYTVideo(item);
                                                    } else {
                                                        window.location.href = `/lesson/${item.id || item._id}?topic=${encodeURIComponent(item.topic || item.title)}&subject=${encodeURIComponent(item.subject)}&videoUrl=${encodeURIComponent(item.video_url || item.youtube_url || '')}`;
                                                    }
                                                }}
                                            >
                                                <div className="aspect-video rounded-[24px] overflow-hidden relative mb-4">
                                                    <img 
                                                        src={item.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                                                        alt={item.title || item.topic} 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                                            <FaPlay className="ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-2 pb-2">
                                                    <h4 className="font-bold text-gray-800 line-clamp-1 leading-tight mb-1">{item.title || item.topic}</h4>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.channelTitle || 'Lesson'}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Adventure Path */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-gray-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50" />
                            
                            <h3 className="font-black text-gray-800 mb-8 flex items-center gap-3 relative z-10">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.from} ${theme.to} flex items-center justify-center text-white text-lg shadow-lg ${theme.shadow}`}>
                                    <FaGraduationCap />
                                </div>
                                Adventure Path
                            </h3>

                            <div className="space-y-3 relative z-10">
                                {isLoadingCurriculum ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                                    ))
                                ) : subjectLessons.map((lesson, idx) => {
                                        const lessonDiff = (lesson.difficulty || 'easy').toLowerCase();
                                        const isCurrent  = lessonDiff === currentDiff;
                                        const isLocked   = isLessonLocked(lesson);
                                        
                                        const linkContent = (
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                                                    isLocked
                                                        ? 'bg-slate-200 text-slate-400'
                                                        : userProgress.completedLessons?.includes(lesson.id || lesson._id)
                                                            ? 'bg-green-500 text-white shadow-md shadow-green-100'
                                                            : isCurrent 
                                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                                                                : 'bg-white text-slate-400 border border-slate-100'
                                                }`}>
                                                    {isLocked ? (
                                                        <FaRocket className="opacity-50" />
                                                    ) : userProgress.completedLessons?.includes(lesson.id || lesson._id) 
                                                        ? <FaCheck size={10} /> 
                                                        : idx + 1
                                                    }
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <span className={`font-bold block text-sm truncate ${
                                                        isLocked
                                                            ? 'text-slate-400 line-through'
                                                            : userProgress.completedLessons?.includes(lesson.id || lesson._id) 
                                                                ? 'text-green-600' 
                                                                : 'text-gray-700'
                                                    }`}>{lesson.topic || lesson.title}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <DiffBadge diff={lesson.difficulty} />
                                                        {isCurrent && !isLocked && !userProgress.completedLessons?.includes(lesson.id || lesson._id) && (
                                                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Your Recommended Level 🌟</span>
                                                        )}
                                                        {userProgress.completedLessons?.includes(lesson.id || lesson._id) && (
                                                            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Completed ✨</span>
                                                        )}
                                                        {isLocked && (
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Locked 🔒</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {!isLocked && (
                                                    <FaChevronRight className="text-slate-300 text-[10px] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                                )}
                                            </div>
                                        );

                                        if (isLocked) {
                                            return (
                                                <div
                                                    key={lesson.id || lesson._id}
                                                    className="p-4 rounded-2xl bg-slate-100/50 border-2 border-dashed border-slate-200 cursor-not-allowed opacity-60"
                                                    title="Complete prerequisite lessons first!"
                                                >
                                                    {linkContent}
                                                </div>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={lesson.id || lesson._id}
                                                to={`/lesson/${lesson.id || lesson._id}?topic=${encodeURIComponent(lesson.topic || lesson.title)}&subject=${encodeURIComponent(lesson.subject)}&videoUrl=${encodeURIComponent(lesson.video_url || lesson.youtube_url || '')}`}
                                                className={`block p-4 rounded-2xl transition-all group border-2 ${
                                                    isCurrent
                                                        ? 'bg-indigo-50 border-indigo-200 shadow-md'
                                                        : 'bg-slate-50 hover:bg-white border-transparent hover:border-indigo-100 hover:shadow-md'
                                                }`}
                                            >
                                                {linkContent}
                                            </Link>
                                        );
                                    })}
                            </div>
                        </motion.div>

                        {/* Interactive Widget */}
                        <div className={`rounded-[40px] p-8 text-center border-b-8 border-gray-200 shadow-lg bg-white overflow-hidden relative group`}>
                            <motion.div 
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="text-5xl mb-4"
                            >
                                💎
                            </motion.div>
                            <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-1">Daily Quest</h4>
                            <p className="text-xs text-gray-400 font-bold mb-6">Complete 2 lessons to get a Golden Medal!</p>
                            <CartoonButton variant="secondary" className="w-full !py-3 !text-xs">View My Quests</CartoonButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {selectedYTVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-xl"
                        onClick={() => setSelectedYTVideo(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-white p-2 sm:p-4 rounded-[40px] shadow-2xl max-w-5xl w-full relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedYTVideo(null)}
                                className="absolute -top-12 right-0 text-white font-black text-xs uppercase tracking-widest bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-all"
                            >
                                Close ✕
                            </button>
                            <div className="aspect-video rounded-[30px] overflow-hidden bg-black shadow-2xl">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`${selectedYTVideo.embedUrl}?autoplay=1`}
                                    title={selectedYTVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubjectDetail;
