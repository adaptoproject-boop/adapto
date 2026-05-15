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

const KidDashboard = () => {
    const { userProgress, t, teacherMaterials, teacherQuizzes } = useLearning();

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
    const [showAllMaterials, setShowAllMaterials] = React.useState(false);
    const [showAllQuizzes, setShowAllQuizzes] = React.useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await axios.post('http://localhost:5612/api/youtube/videos', {
                subject: searchQuery,
                topic: searchQuery,
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
        
        const sourceData = teacherMaterials && teacherMaterials.length > 0 ? teacherMaterials : mockLessons;

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

                            <form onSubmit={handleSearch} className="relative max-w-xl group">
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
                                <CartoonButton variant="primary" className="w-full !bg-white !text-indigo-600 !py-3 !text-xs !border-b-indigo-200">View Badges</CartoonButton>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
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
