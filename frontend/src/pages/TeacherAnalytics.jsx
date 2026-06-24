import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { FiArrowLeft } from 'react-icons/fi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useLearning } from '../context/LearningContext';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const TeacherAnalytics = () => {
    const navigate = useNavigate();
    const { t } = useLearning();
    const [analyticsData, setAnalyticsData] = useState({
        totalStudents: 0,
        averageScore: 0,
        topicPerformance: [],
        difficultyDistribution: { easy: 0, medium: 0, hard: 0 },
        weakTopics: [],
        adaptiveInsights: {
            avg_confused_ratio: 0,
            avg_retries: 0,
            avg_pace: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch Real-Time Analytics from Backend
                const response = await api.get('/teacher/analytics');
                const data = response.data;

                setAnalyticsData({
                    totalStudents: data.class_summary?.total_students || 0,
                    averageScore: data.class_summary?.average_class_score || 0,
                    topicPerformance: data.topic_analysis || [],
                    difficultyDistribution: data.difficulty_distribution || { easy: 0, medium: 0, hard: 0 },
                    weakTopics: data.weak_topics || [],
                    adaptiveInsights: data.adaptive_insights || { avg_confused_ratio: 0, avg_retries: 0, avg_pace: 0 }
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics:", error);
                setError("Failed to load analytics data.");
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    // Chart Data Configuration
    const barData = {
        labels: analyticsData.topicPerformance.map(t => t.topic),
        datasets: [
            {
                label: t('chart_label_avg_score'), // Translated
                data: analyticsData.topicPerformance.map(t => t.average_score),
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const doughnutData = {
        labels: [t('difficulty_easy'), t('difficulty_medium'), t('difficulty_hard')], // Translated
        datasets: [
            {
                label: t('chart_label_num_quizzes'), // Translated
                data: [
                    analyticsData.difficultyDistribution.easy || 0,
                    analyticsData.difficultyDistribution.medium || 0,
                    analyticsData.difficultyDistribution.hard || 0
                ],
                backgroundColor: [
                    'rgba(74, 222, 128, 0.6)', // Green
                    'rgba(250, 204, 21, 0.6)', // Yellow
                    'rgba(248, 113, 113, 0.6)', // Red
                ],
                borderColor: [
                    'rgba(74, 222, 128, 1)',
                    'rgba(250, 204, 21, 1)',
                    'rgba(248, 113, 113, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20 flex justify-center items-center">
                <div className="text-red-500 font-bold">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pastel-gradient pt-32 px-8 pb-12 relative overflow-hidden">
            <div className="deco-blob deco-blob-pink w-64 h-64 -top-20 -left-20" />
            <div className="deco-blob deco-blob-blue w-72 h-72 top-1/2 -right-20" />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center"
                >
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/teacher/dashboard')}
                            className="bg-white/80 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-500"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{t('analytics_title') || 'Class Analytics'}</h1>
                            <p className="text-gray-500">{t('analytics_subtitle') || 'Monitor class performance and adaptive insights'}</p>
                        </div>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard title={t('analytics_kpi_students')} value={analyticsData.totalStudents} icon="🎓" color="bg-blue-100 text-blue-600" />
                    <KPICard title={t('analytics_kpi_avg')} value={`${analyticsData.averageScore}%`} icon="📊" color="bg-purple-100 text-purple-600" />
                    <KPICard title={t('analytics_kpi_topics')} value={analyticsData.topicPerformance.length} icon="📚" color="bg-pink-100 text-pink-600" />
                </div>

                {/* Adaptive Health Row */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 blur-[100px] opacity-20 -mr-20 -mt-20" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-indigo-500/30 rounded-xl flex items-center justify-center text-xl">🤖</div>
                            <div>
                                <h2 className="text-2xl font-black">ADAPTO Adaptive Health</h2>
                                <p className="text-indigo-300 text-sm">Real-time behavioral signals from the AI engine</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-2">
                                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Confusion Level</p>
                                <div className="flex items-end gap-3">
                                    <p className="text-5xl font-black">{(analyticsData.adaptiveInsights.avg_confused_ratio * 100).toFixed(0)}%</p>
                                    <div className="mb-2 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-orange-400 transition-all duration-1000" 
                                            style={{ width: `${analyticsData.adaptiveInsights.avg_confused_ratio * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-white/60">Class-wide confused or bored facial signals</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Average Retries</p>
                                <div className="flex items-end gap-3">
                                    <p className="text-5xl font-black">{analyticsData.adaptiveInsights.avg_retries}</p>
                                    <div className="mb-2 flex gap-1">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className={`w-2 h-4 rounded-sm ${i <= analyticsData.adaptiveInsights.avg_retries ? 'bg-indigo-400' : 'bg-white/10'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-white/60">Attempts per difficult question</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Class Pacing</p>
                                <div className="flex items-end gap-3">
                                    <p className="text-5xl font-black">{(analyticsData.adaptiveInsights.avg_pace * 100).toFixed(0)}%</p>
                                    <p className="text-indigo-300 font-bold mb-2">Steady</p>
                                </div>
                                <p className="text-xs text-white/60">Average learning speed vs. target</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bar Chart - Topic Performance */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-gray-700 mb-4">{t('analytics_topic_perf')}</h3>
                        <div className="h-64 flex items-center justify-center">
                            {analyticsData.topicPerformance.length > 0 ? (
                                <Bar options={{ responsive: true, maintainAspectRatio: false }} data={barData} />
                            ) : (
                                <p className="text-gray-400">{t('no_data_available')}</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Doughnut Chart - Difficulty Distribution */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                    >
                        <h3 className="text-lg font-bold text-gray-700 mb-4">{t('analytics_diff_dist')}</h3>
                        <div className="h-64 flex items-center justify-center relative">
                            <Doughnut options={{ responsive: true, maintainAspectRatio: false }} data={doughnutData} />
                        </div>
                    </motion.div>
                </div>

                {/* Weak Areas Alert */}
                {analyticsData.weakTopics.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-start gap-4"
                    >
                        <div className="text-3xl">⚠️</div>
                        <div>
                            <h3 className="text-lg font-bold text-orange-800">{t('analytics_attn_needed')}</h3>
                            <p className="text-orange-600">
                                {t('analytics_weak_topics_intro')}
                                <span className="font-bold ml-1">
                                    {analyticsData.weakTopics.map(t => t.topic).join(", ")}
                                </span>.
                                {t('analytics_weak_topics_action')}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-green-50 border border-green-100 p-6 rounded-2xl flex items-start gap-4"
                    >
                        <div className="text-3xl">🌟</div>
                        <div>
                            <h3 className="text-lg font-bold text-green-800">Great Job!</h3>
                            <p className="text-green-600">
                                The class is performing well across all topics. Keep up the great work!
                            </p>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
};

// Helper Component for KPI Cards
const KPICard = ({ title, value, icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </motion.div>
);

export default TeacherAnalytics;
