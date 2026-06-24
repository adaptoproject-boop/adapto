import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUsers, FiBook, FiFileText, FiBarChart2,
    FiLogOut, FiMenu, FiX, FiHome
} from 'react-icons/fi';
import CartoonButton from '../components/CartoonButton';
import { useLearning } from '../context/LearningContext';
import { API_URL } from '../api/config';

/**
 * TeacherDashboard - Main teacher panel with navigation
 */

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { t, userProgress } = useLearning(); // Destructure userProgress

    // Debug Log
    console.log("TeacherDashboard Render:", {
        lang: userProgress?.language,
        translatedTitle: t('teacher_dash_title'),
        keyTest: t('teacher_sidebar_dash')
    });

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        studyMaterials: 0,
        quizzes: 0,
        avgClassScore: 0,
        activeToday: 0,
        strugglingCount: 0
    });
    const [strugglingStudents, setStrugglingStudents] = useState([]);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            // Fetch students count
            const studentsRes = await fetch(`${API_URL}/teacher/students`);
            const studentsData = await studentsRes.json();

            // Fetch materials count
            const materialsRes = await fetch(`${API_URL}/teacher/study-materials`);
            const materialsData = await materialsRes.json();

            // Fetch quizzes count
            const quizzesRes = await fetch(`${API_URL}/teacher/quizzes`);
            const quizzesData = await quizzesRes.json();

            // Fetch analytics
            const analyticsRes = await fetch(`${API_URL}/teacher/analytics`);
            const analyticsData = await analyticsRes.json();

            setStats({
                totalStudents: studentsData.students?.length || 0,
                studyMaterials: materialsData.materials?.length || 0,
                quizzes: quizzesData.quizzes?.length || 0,
                avgClassScore: analyticsData.class_summary?.average_class_score || 0,
                activeToday: analyticsData.class_summary?.active_today || 0,
                strugglingCount: analyticsData.struggling_students?.length || 0
            });
            setStrugglingStudents(analyticsData.struggling_students || []);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const menuItems = [
        { icon: FiHome, label: t('teacher_sidebar_dash'), path: '/teacher/dashboard', color: 'text-blue-500', bg: 'bg-blue-50' },
        { icon: FiUsers, label: t('teacher_sidebar_students'), path: '/teacher/students', color: 'text-green-500', bg: 'bg-green-50' },
        { icon: FiBook, label: 'Study Materials', path: '/teacher/materials', color: 'text-purple-500', bg: 'bg-purple-50' },
        { icon: FiBook, label: 'Manage Curriculum', path: '/teacher/lessons', color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { icon: FiFileText, label: t('teacher_sidebar_quizzes'), path: '/teacher/quizzes', color: 'text-pink-500', bg: 'bg-pink-50' },
        { icon: FiBarChart2, label: t('teacher_sidebar_analytics'), path: '/teacher/analytics', color: 'text-coral', bg: 'bg-coral/10' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-pastel-gradient flex relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="deco-blob deco-blob-pink w-96 h-96 -top-24 -left-20" />
            <div className="deco-blob deco-blob-purple w-80 h-80 top-1/2 -right-20" />
            <div className="deco-blob deco-blob-blue w-72 h-72 -bottom-20 left-1/4" />

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: sidebarOpen ? 24 : -300 }}
                className="fixed left-0 top-24 bottom-6 w-64 glass-card z-50 p-6 flex flex-col"
            >
                <div className="mb-8 flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                        👨‍🏫
                    </div>
                    <h2 className="text-xl font-bold text-gray-700">{t('teacher_panel')}</h2>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <motion.button
                            key={item.path}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${window.location.pathname === item.path
                                ? 'bg-white shadow-md text-coral border border-gray-100'
                                : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                                }`}
                        >
                            <item.icon className="text-xl" />
                            <span className="font-semibold">{item.label}</span>
                        </motion.button>
                    ))}
                </nav>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all mt-auto border border-transparent hover:border-red-100"
                >
                    <FiLogOut className="text-xl" />
                    <span className="font-semibold">{t('nav_logout')}</span>
                </motion.button>
            </motion.aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 pt-32 px-8 pb-12 ${sidebarOpen ? 'ml-72' : 'ml-12'}`}>
                {/* Header/Toggle Bar */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-white hover:shadow-md transition-all text-gray-500"
                        >
                            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{t('teacher_dash_title')}</h1>
                            <p className="text-gray-500">{t('teacher_dash_welcome')}</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 bg-white/60 p-2 rounded-2xl border border-white">
                        <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center text-white shadow-soft">
                            <FiUsers />
                        </div>
                        <div className="pr-4">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Class Status</p>
                            <p className="text-sm font-bold text-gray-700">All Active</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <main className="space-y-10">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { label: t('teacher_stats_total_students'), value: stats.totalStudents, icon: FiUsers, color: 'from-blue-400 to-blue-500' },
                            { label: 'Active Today', value: stats.activeToday, icon: FiUsers, color: 'from-green-400 to-green-500' },
                            { label: 'Struggling Students', value: stats.strugglingCount, icon: FiX, color: 'from-red-400 to-red-500' },
                            { label: t('teacher_stats_materials'), value: stats.studyMaterials, icon: FiBook, color: 'from-purple-400 to-purple-500' },
                            { label: t('teacher_stats_quizzes'), value: stats.quizzes, icon: FiFileText, color: 'from-indigo-400 to-indigo-500' },
                            { label: t('teacher_stats_avg_score'), value: `${stats.avgClassScore.toFixed(1)}%`, icon: FiBarChart2, color: 'from-pink-400 to-pink-500' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="glass-card p-6 flex items-center gap-5 group cursor-default"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg transition-transform group-hover:rotate-12`}>
                                    <stat.icon />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-700">{stat.value}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl">⚡</span>
                            <h3 className="text-2xl font-bold text-gray-700">{t('teacher_quick_actions')}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: t('teacher_sidebar_students'),
                                    desc: t('teacher_card_students_desc'),
                                    icon: FiUsers,
                                    path: '/teacher/students',
                                    color: 'bg-blue-50 text-blue-500 border-blue-100'
                                },
                                {
                                    title: t('teacher_stats_materials'), // Using Stats label as "Add Material" equivalent
                                    desc: t('teacher_card_material_desc'),
                                    icon: FiBook,
                                    path: '/teacher/materials',
                                    color: 'bg-green-50 text-green-500 border-green-100'
                                },
                                {
                                    title: t('teacher_stats_quizzes'), // Using Stats label as "Create Quiz" equivalent
                                    desc: t('teacher_card_quiz_desc'),
                                    icon: FiFileText,
                                    path: '/teacher/quizzes',
                                    color: 'bg-purple-50 text-purple-500 border-purple-100'
                                }
                            ].map((action, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(action.path)}
                                    className={`glass-card p-8 text-left group border-2 border-transparent hover:border-white transition-all`}
                                >
                                    <div className={`w-12 h-12 ${action.color} border rounded-xl flex items-center justify-center text-2xl mb-6 shadow-sm`}>
                                        <action.icon />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-700 mb-2">{action.title}</h4>
                                    <p className="text-gray-500 mb-6">{action.desc}</p>
                                    <div className="flex items-center gap-2 text-coral font-bold text-sm">
                                        {t('teacher_open_tool')} <span className="text-lg">→</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </section>

                    {/* Announcement Section */}
                    <div className="glass-card-solid p-8 relative overflow-hidden bg-gradient-to-br from-white/90 to-blue-50/50">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="text-6xl animate-float">📢</div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-700 mb-2">{t('teacher_tip')}</h3>
                                <p className="text-gray-500 mb-6 max-w-lg">
                                    {t('teacher_tip_content')}
                                </p>
                                <CartoonButton variant="primary" onClick={() => navigate('/teacher/materials')}>
                                    {t('teacher_btn_update')}
                                </CartoonButton>
                            </div>
                        </div>
                        {/* Decorative background emoji */}
                        <div className="absolute -right-10 -bottom-10 text-9xl opacity-5 pointer-events-none rotate-12">
                            🎓
                        </div>
                    </div>
                </main>
            </div>

            {/* Floating Decorations */}
            <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-16 right-16 text-5xl opacity-40"
            >🎈</motion.div>
            <motion.div
                animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-32 right-32 text-4xl opacity-30"
            >🌟</motion.div>
        </div>
    );
};


export default TeacherDashboard;
