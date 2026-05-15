import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaChevronLeft, FaChevronRight, FaStar, FaLock, FaUnlock, FaCheck } from 'react-icons/fa';
import CartoonButton from '../components/CartoonButton';
import EmotionTracker from '../components/EmotionTracker';
import { mockLessons, emotionOptions, contentStyleLabels, decideContentStyle } from '../mockData';
import { useLearning } from '../context/LearningContext';

const LessonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isVideoComplete, markVideoComplete, getCurrentLevel, userProgress, setEmotion, getContentStyle, teacherMaterials, logVideoEvent } = useLearning();

    const searchParams = new URLSearchParams(location.search);
    const paramLevel = searchParams.get('level');
    const paramStyle = searchParams.get('style');
    const paramTopic = searchParams.get('topic');
    const paramSubject = searchParams.get('subject');
    const paramVideoUrl = searchParams.get('videoUrl');

    const lesson = mockLessons.find(l => l._id === id || l.title === id) 
        || (teacherMaterials && teacherMaterials.find(m => (m._id === id || m.id === id)))
        || { _id: id, title: paramTopic || id, subject: paramSubject || 'General', emoji: '📚' };

    const displayTopic = paramTopic || lesson.topic || lesson.title || id;
    const displaySubject = paramSubject || lesson.subject || 'General';
    const dbVideoUrl = paramVideoUrl || lesson.video_url || lesson.youtube_url;

    const currentLevel = userProgress.currentLevels[displaySubject] || 'Easy';
    const [contentStyle, setContentStyle] = useState(paramStyle || getContentStyle());
    const [videoWatched, setVideoWatched] = useState(isVideoComplete(id));
    const [selectedEmotion, setSelectedEmotion] = useState(userProgress.currentEmotion);
    const [confusedRatio, setConfusedRatio] = useState(0);

    // YouTube Video State
    const [lessonVideo,      setLessonVideo]      = useState(null);
    const [isLoadingVideo,   setIsLoadingVideo]   = useState(false);
    const [videoError,       setVideoError]        = useState(null);
    const [switchingMode,    setSwitchingMode]    = useState(false);
    const [lastEmotionUsed,  setLastEmotionUsed]  = useState(userProgress.currentEmotion);

    // Video engagement tracking
    const [videoCompletionPct, setVideoCompletionPct] = useState(0);
    const [pauseCount,         setPauseCount]         = useState(0);
    const [replayCount,        setReplayCount]        = useState(0);
    const [playCount,          setPlayCount]          = useState(0);
    const videoDuration   = useRef(null);

    // Post video events to backend
    const trackVideoEvent = useCallback(async (eventType, payload = {}) => {
        logVideoEvent(eventType, {
            lesson_id: id,
            subject: displaySubject,
            ...payload
        });
    }, [id, displaySubject, logVideoEvent]);

    // Listen for YouTube postMessage events (play/pause/end/buffering)
    useEffect(() => {
        const onMessage = (e) => {
            if (!e.data || typeof e.data !== 'string') return;
            try {
                const msg = JSON.parse(e.data);
                if (msg.event === 'video-progress' && msg.info) {
                    const pct = msg.info.currentTime / (msg.info.duration || 1);
                    setVideoCompletionPct(Math.min(pct, 1));
                    videoDuration.current = msg.info.duration;
                }
                if (msg.event === 'infoDelivery') {
                    const state = msg.info?.playerState;
                    if (state === 1) { // Playing
                        setPlayCount(c => c + 1);
                        trackVideoEvent('play', { replay: playCount > 0 });
                    }
                    if (state === 2) { // Paused
                        setPauseCount(c => c + 1);
                        trackVideoEvent('pause', { completion: videoCompletionPct });
                    }
                    if (state === 0) { // ended
                        setVideoCompletionPct(1);
                        trackVideoEvent('ended', { completion: 1.0 });
                        handleVideoComplete();
                    }
                }
            } catch (_) {}
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [trackVideoEvent, videoCompletionPct, playCount]);

    const steps = [
        { name: 'Watch Video', icon: '🎬', completed: videoWatched },
        { name: 'Interactive Learning', icon: '✨', completed: false, optional: true },
        { name: 'Take Quiz', icon: '📝', completed: false, locked: !videoWatched },
        { name: 'Get Results', icon: '🏆', completed: false, locked: true }
    ];

    useEffect(() => {
        const fetchLessonVideo = async (styleOverride = null) => {
            const getYouTubeId = (url) => {
                if (!url) return null;
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : null;
            };

            setIsLoadingVideo(true);
            
            if (dbVideoUrl && !styleOverride) {
                const vidId = getYouTubeId(dbVideoUrl);
                if (vidId) {
                    setLessonVideo({
                        videoId: vidId,
                        embedUrl: `https://www.youtube.com/embed/${vidId}`,
                        title: displayTopic
                    });
                    setIsLoadingVideo(false);
                    return;
                }
            }

            try {
                const searchQuery = styleOverride === 'Fun' 
                    ? `${displayTopic} funny cartoon song for kids nursery rhyme` 
                    : `${displayTopic} for kids educational lesson`;

                const response = await fetch('http://localhost:5612/api/youtube/videos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: displaySubject,
                        topic: searchQuery,
                        difficulty: currentLevel,
                        content_type: styleOverride || contentStyle || 'Standard',
                        max_results: 5
                    })
                });
                const data = await response.json();
                if (data.videos && data.videos.length > 0) {
                    const selectedVideo = styleOverride === 'Fun' ? data.videos[2] || data.videos[1] : data.videos[0];
                    setLessonVideo(selectedVideo);
                } else {
                    setVideoError("Couldn't find an adventure video. Let's try again!");
                }
            } catch (error) {
                setVideoError("Oops! Connection issue. Try again!");
            } finally {
                setIsLoadingVideo(false);
            }
        };

        fetchLessonVideo(switchingMode ? 'Fun' : null);
    }, [id, paramTopic, paramVideoUrl, switchingMode]);

    const handleVideoComplete = () => {
        if (!videoWatched) {
            setVideoWatched(true);
            markVideoComplete(id, currentLevel, contentStyle);
        }
    };

    return (
        <div className="min-h-screen bg-[#fff5f5] pb-20 pt-28 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ffe4e1] blur-[120px] rounded-full opacity-60 -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#fff0f5] blur-[100px] rounded-full opacity-50 -z-10" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        to="/dashboard"
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm hover:shadow-md transition-all"
                    >
                        <FaChevronLeft />
                    </Link>

                    <div className="flex-1 flex justify-center">
                        <div className="bg-white px-10 py-4 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 border border-white">
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-2xl">
                                {lesson.emoji}
                            </div>
                            <div className="text-left">
                                <h2 className="text-2xl font-black text-gray-800 leading-none">{displayTopic}</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                    {paramVideoUrl ? "Teacher Curated Adventure" : "Expert YouTube Adventure"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-4 rounded-[40px] shadow-sm border-8 border-white overflow-hidden aspect-video relative">
                            {isLoadingVideo ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-[32px]">
                                    <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">Gathering Rhymes...</p>
                                </div>
                            ) : videoError ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 rounded-[32px] p-6 text-center">
                                    <p className="text-red-400 font-bold mb-4">{videoError}</p>
                                    <button onClick={() => window.location.reload()} className="bg-red-400 text-white px-6 py-2 rounded-xl font-bold">Try Again</button>
                                </div>
                            ) : lessonVideo ? (
                                <div className="w-full h-full relative">
                                    <iframe
                                        key={lessonVideo.videoId}
                                        width="100%"
                                        height="100%"
                                        src={`${lessonVideo.embedUrl}?autoplay=1&rel=0`}
                                        title={lessonVideo.title}
                                        frameBorder="0"
                                        className="rounded-[32px]"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gray-50 rounded-[32px]" />
                            )}
                        </div>

                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-white">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-black text-gray-800">{displayTopic}</h2>
                                {videoWatched && (
                                    <span className="flex items-center gap-2 text-green-500 font-bold bg-green-50 px-4 py-1 rounded-full text-xs">
                                        <FaCheck /> Adventure Complete!
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                {paramVideoUrl ? `Enjoy this special lesson about ${displayTopic}!` : lesson.description}
                            </p>
                            
                            {/* Dev Skip Helper */}
                            {!videoWatched && (
                                <button 
                                    onClick={handleVideoComplete}
                                    className="mt-4 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-indigo-400 transition-colors"
                                >
                                    (Dev Only: Skip Video ⏩)
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-white">
                            <h3 className="font-black text-gray-800 mb-6 flex items-center gap-3">
                                <span className="text-2xl">📚</span> Learning Flow
                            </h3>
                            <div className="space-y-4">
                                {steps.map((step, i) => (
                                    <div
                                        key={i}
                                        className={`p-5 rounded-3xl flex items-center gap-4 transition-all ${step.completed
                                            ? 'bg-green-50/50 border-2 border-green-100'
                                            : step.locked
                                                ? 'opacity-40 bg-gray-50'
                                                : 'bg-indigo-50/30 border-2 border-indigo-100/50'
                                            }`}
                                    >
                                        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${step.completed ? 'bg-green-400 text-white shadow-lg shadow-green-100' :
                                            step.locked ? 'bg-gray-200 text-gray-400' : 'bg-white text-indigo-500 shadow-md shadow-indigo-50'
                                            }`}>
                                            {step.completed ? <FaCheck size={16} /> :
                                                step.locked ? <FaLock size={16} /> : step.icon}
                                        </span>
                                        <div className="flex-1">
                                            <span className="font-bold text-gray-700 block">{step.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-2">
                            <motion.div
                                animate={videoWatched ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <CartoonButton
                                    onClick={() => navigate(
                                        `/quiz/${id}?topic=${encodeURIComponent(displayTopic)}&subject=${encodeURIComponent(displaySubject)}&videoCompletion=${videoCompletionPct.toFixed(2)}&confusedRatio=${confusedRatio?.toFixed(2) || 0}`
                                    )}
                                    variant={videoWatched ? "primary" : "secondary"}
                                    className={`w-full py-6 text-xl shadow-xl transition-all ${!videoWatched ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                    disabled={!videoWatched}
                                >
                                    {videoWatched ? (
                                        <span className="flex items-center justify-center gap-3">Take Quiz <FaChevronRight /></span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-3"><FaLock /> Locked</span>
                                    )}
                                </CartoonButton>
                            </motion.div>
                            {!videoWatched && (
                                <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 animate-pulse">
                                    Watch video to unlock quiz 🪄
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-time Signal Tracker */}
            <EmotionTracker 
                isActive={!isVideoComplete(id)} 
                onConfusedRatioUpdate={(ratio) => setConfusedRatio(ratio)}
            />
        </div>
    );
};

export default LessonDetail;
