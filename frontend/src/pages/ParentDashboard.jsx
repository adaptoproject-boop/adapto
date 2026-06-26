import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaCheck, FaTimes, FaArrowUp, FaArrowDown, FaMinus, FaRedo, FaYoutube, FaFilePdf } from 'react-icons/fa';
import { useLearning } from '../context/LearningContext';
import { useAuth } from '../context/AuthContext';
import { mockLessons, contentStyleLabels } from '../mockData';
import { API_URL } from '../api/config';
import { motion } from 'framer-motion';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ParentDashboard = () => {
    const { userProgress, getLessonResults, resetProgress, t, teacherMaterials, curriculumLessons } = useLearning();
    const { switchView } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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

    const allLessons = combined.length > 0 ? combined : mockLessons;

    const handleGenerateReport = async () => {
        const studentId = userProgress.userId || userProgress._id;

        if (!studentId) {
            console.error("Student ID missing for report generation");
            alert("Cannot generate report: Student ID not found. Please try logging out and back in.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/reports/generate-report/${studentId}`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Progress_Report_${userProgress.name}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                const errorData = await response.json();
                console.error("Failed to generate report:", errorData);
                alert(`Failed to generate report: ${errorData.error || "Unknown server error"}`);
            }
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Error generating report.");
        } finally {
            setLoading(false);
        }
    };

    if (!userProgress) {
        return (
            <div className="min-h-screen bg-pastel-gradient-soft flex items-center justify-center">
                <div className="text-xl text-gray-500 font-bold animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    const lessonResults = getLessonResults() || [];

    // Calculate stats
    const totalQuizzes = lessonResults.length;
    const passedQuizzes = lessonResults.filter(r => r.passed).length;
    const totalStarsEarned = lessonResults.reduce((sum, r) => sum + (r.starsEarned || 0), 0);
    const averageScore = totalQuizzes > 0
        ? Math.round(lessonResults.reduce((sum, r) => sum + r.quizScore, 0) / totalQuizzes)
        : 0;

    // Content style usage
    const styleUsage = { normal: 0, fun: 0, easy_explanation: 0 };
    lessonResults.forEach(r => {
        if (r.contentStyle && styleUsage[r.contentStyle] !== undefined) {
            styleUsage[r.contentStyle]++;
        }
    });

    // Prepare Chart Data
    const chartData = {
        labels: lessonResults.map(r => r.lessonTitle.substring(0, 10) + '...'),
        datasets: [
            {
                label: t('parent_quiz_progress'),
                data: lessonResults.map(r => r.quizScore),
                borderColor: '#FF7F50', // Coral
                backgroundColor: 'rgba(255, 127, 80, 0.5)',
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    console.log("ParentDashboard Render. userProgress:", userProgress);

    return (
        <div className="min-h-screen bg-pastel-gradient-soft pb-20 pt-28 px-6">
            {/* Decorative Blobs */}
            <div className="deco-blob deco-blob-pink w-[300px] h-[300px] top-0 -right-20 opacity-20" />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">

                {/* Switch to Kid Banner for new parents */}
                {lessonResults.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-gradient-to-r from-purple-100 via-pink-50 to-pink-100 rounded-3xl border border-purple-200/50 shadow-md flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                            <span className="text-5xl animate-bounce">👧</span>
                            <div>
                                <h3 className="text-xl font-bold text-gray-700">Set up your child's learning journey!</h3>
                                <p className="text-gray-500 text-sm">Switch to Kid View to allow your child to watch videos, play games, and take quizzes.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                switchView('kid');
                                navigate('/dashboard');
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-coral to-pink-500 hover:from-coral-dark hover:to-pink-600 text-white rounded-2xl font-bold shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaStar className="text-yellow-300" /> Switch to Kid View & Start Learning
                        </button>
                    </motion.div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-700">{t('parent_title')} 👨‍👩‍👧</h1>
                        <p className="text-gray-500">{t('parent_track')}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className={`px-4 py-2 text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 hover:-translate-y-1'
                                }`}
                        >
                            <FaFilePdf /> {loading ? 'Generating...' : t('dash_report', 'Download Report')}
                        </button>
                        <button
                            onClick={() => {
                                switchView('kid');
                                navigate('/dashboard');
                            }}
                            className="px-4 py-2 bg-coral text-white rounded-xl font-bold shadow-md hover:bg-coral-dark flex items-center gap-2 transition-all hover:-translate-y-0.5"
                        >
                            <FaStar className="text-yellow-300" /> {t('parent_back_learning')}
                        </button>

                        <div className="glass-card px-6 py-3 flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-2xl">
                                👧
                            </div>
                            <div>
                                <p className="font-bold text-gray-700">{userProgress.name}</p>
                                <p className="text-sm text-gray-500">⭐ {userProgress.totalStars} {t('dash_stars')}</p>
                            </div>
                        </div>
                        <button
                            onClick={resetProgress}
                            className="text-sm text-gray-400 hover:text-coral transition-colors"
                            title="Reset progress for testing"
                        >
                            <FaRedo />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon="🎯" label={t('parent_quizzes_taken')} value={totalQuizzes} />
                    <StatCard icon="✅" label={t('parent_passed')} value={passedQuizzes} />
                    <StatCard icon="⭐" label={t('parent_stars_earned')} value={totalStarsEarned} />
                    <StatCard icon="📊" label={t('parent_avg_score')} value={`${averageScore}%`} />
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Progress Chart */}
                    <div className="md:col-span-2 glass-card p-6">
                        <h3 className="font-bold text-gray-700 mb-4">📈 {t('parent_quiz_progress')}</h3>
                        <div className="h-64 flex items-center justify-center bg-gray-50/50 rounded-xl relative">
                            {lessonResults.length > 0 ? (
                                <Line data={chartData} options={chartOptions} />
                            ) : (
                                <p className="text-gray-400 text-sm">No quiz data available yet to show trends.</p>
                            )}
                        </div>
                    </div>

                    {/* Level Distribution + Content Style */}
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-gray-700 mb-4">🎚️ {t('parent_current_levels')}</h3>
                            <div className="mt-4 space-y-2">
                                {userProgress.currentLevels && Object.entries(userProgress.currentLevels).map(([subject, level]) => (
                                    <div key={subject} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{subject}</span>
                                        <span className={`font-bold uppercase text-xs px-2 py-1 rounded ${level === 'hard' ? 'bg-red-100 text-red-600' :
                                            level === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                            {level}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content Style Usage */}
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-gray-700 mb-4">🎬 {t('parent_style_usage')}</h3>
                            <div className="space-y-2">
                                {Object.entries(styleUsage).map(([style, count]) => {
                                    const info = contentStyleLabels[style] || { emoji: '📹', label: style };
                                    return (
                                        <div key={style} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-gray-600">
                                                <span>{info.emoji}</span> {info.label}
                                            </span>
                                            <span className="font-bold text-gray-700">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lesson-wise Quiz Results Table */}
                <div className="glass-card p-6">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <FaYoutube className="text-red-500" /> {t('parent_lesson_records')}
                    </h3>

                    {lessonResults.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                                        <th className="pb-3 font-semibold">Lesson</th>
                                        <th className="pb-3 font-semibold">Video</th>
                                        <th className="pb-3 font-semibold">Score</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                        <th className="pb-3 font-semibold">Level</th>
                                        <th className="pb-3 font-semibold">Emotion</th>
                                        <th className="pb-3 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lessonResults.slice().reverse().map((result, i) => {
                                        const styleInfo = contentStyleLabels[result.contentStyle] || contentStyleLabels.normal;
                                        return (
                                            <tr key={result.id || i} className="border-b border-gray-50 hover:bg-white/50">
                                                <td className="py-4">
                                                    <span className="font-semibold text-gray-700">{result.lessonTitle}</span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded inline-block w-fit ${result.videoLevel === 'hard' ? 'bg-red-100 text-red-600' :
                                                            result.videoLevel === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                                'bg-green-100 text-green-600'
                                                            }`}>
                                                            {result.videoLevel}
                                                        </span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            {styleInfo.emoji} {styleInfo.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`font-bold ${result.quizScore >= 80 ? 'text-green-500' :
                                                        result.quizScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                        }`}>
                                                        {result.quizScore}%
                                                    </span>
                                                    <span className="text-gray-400 text-xs block">
                                                        {result.correctAnswers}/{result.totalQuestions}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    {result.passed ? (
                                                        <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                                                            <FaCheck /> Passed
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                                                            <FaTimes /> Retry
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <LevelChange from={result.previousLevel} to={result.nextLevel} />
                                                </td>
                                                <td className="py-4">
                                                    <EmotionBadge emotion={result.emotion} />
                                                </td>
                                                <td className="py-4 text-sm text-gray-400">
                                                    {new Date(result.timestamp).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <span className="text-4xl block mb-4">📚</span>
                            <p>No lessons completed yet.</p>
                            <p className="text-sm">Complete lessons to see results here!</p>
                        </div>
                    )}
                </div>

                {/* Subject Progress */}
                <div className="glass-card p-6">
                    <h3 className="font-bold text-gray-700 mb-4">📊 {t('parent_subject_progress')}</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {allLessons.map((lesson) => {
                            const lid = lesson._id || lesson.id;
                            const lTitle = lesson.topic || lesson.title;
                            const results = lessonResults.filter(r => r.lessonId === lid || r.lessonTitle === lTitle);
                            const bestScore = results.length > 0
                                ? Math.max(...results.map(r => r.quizScore))
                                : 0;
                            const attempts = results.length;

                            return (
                                <div key={lid} className="glass-card-solid p-4 text-center">
                                    <span className="text-3xl block mb-2">{lesson.emoji || '📚'}</span>
                                    <h4 className="font-bold text-gray-700 text-sm mb-2">{lTitle}</h4>
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <p>Best: <span className="font-bold text-coral">{bestScore}%</span></p>
                                        <p>Attempts: {attempts}</p>
                                        <p className="uppercase">
                                            Level: <span className="font-bold">{userProgress.currentLevels?.[lesson.subject] || 'easy'}</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detailed Curriculum Status (Requested: "All like start lessons") */}
                <div className="glass-card p-6">
                    <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <FaStar className="text-yellow-500" /> Full Curriculum Journey
                    </h3>
                    
                    <div className="space-y-8">
                        {Array.from(new Set(allLessons.map(l => l.subject))).map(subject => (
                            <div key={subject} className="space-y-4">
                                <h4 className="text-lg font-bold text-gray-600 border-l-4 border-coral pl-3">{subject}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allLessons.filter(l => l.subject === subject).map(lesson => {
                                        const lid = lesson._id || lesson.id;
                                        const lTitle = lesson.topic || lesson.title;
                                        const results = lessonResults.filter(r => r.lessonId === lid || r.lessonTitle === lTitle);
                                        const isCompleted = results.some(r => r.passed) || userProgress.completedLessons?.includes(lid);
                                        const isStarted = results.length > 0;
                                        const bestScore = isStarted ? Math.max(...results.map(r => r.quizScore)) : 0;

                                        return (
                                            <div key={lid} className={`p-4 rounded-2xl border-2 transition-all ${
                                                isCompleted ? 'bg-green-50 border-green-100' : 
                                                isStarted ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'
                                            }`}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-2xl">{lesson.emoji || '📚'}</span>
                                                    {isCompleted ? (
                                                        <span className="bg-green-500 text-white p-1 rounded-full text-xs">
                                                            <FaCheck />
                                                        </span>
                                                    ) : isStarted ? (
                                                        <span className="bg-blue-500 text-white p-1 rounded-full text-xs">
                                                            <FaRedo className="animate-spin-slow" />
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <h5 className="font-bold text-gray-700 text-sm mb-1">{lesson.topic || lesson.title}</h5>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                        isCompleted ? 'bg-green-100 text-green-600' : 
                                                        isStarted ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {isCompleted ? 'Completed' : isStarted ? 'In Progress' : 'Locked'}
                                                    </span>
                                                    {isStarted && (
                                                        <span className="text-xs font-bold text-coral">{bestScore}%</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }) => (
    <div className="glass-card-solid p-5 text-center">
        <span className="text-3xl block mb-2">{icon}</span>
        <p className="text-2xl font-bold text-gray-700">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
    </div>
);

const LevelChange = ({ from, to }) => {
    if (to === 'hard' && from !== 'hard') {
        return <span className="flex items-center gap-1 text-green-500 text-sm"><FaArrowUp /> Level Up</span>;
    }
    if (to === 'easy' && from !== 'easy') {
        return <span className="flex items-center gap-1 text-orange-500 text-sm"><FaArrowDown /> Level Down</span>;
    }
    return <span className="flex items-center gap-1 text-gray-400 text-sm"><FaMinus /> Same</span>;
};

const EmotionBadge = ({ emotion }) => {
    const emotions = {
        happy: { emoji: '😊', color: 'bg-green-100 text-green-700' },
        focused: { emoji: '🧐', color: 'bg-blue-100 text-blue-700' },
        sad: { emoji: '😢', color: 'bg-gray-100 text-gray-700' },
        frustrated: { emoji: '😤', color: 'bg-red-100 text-red-700' },
        bored: { emoji: '😴', color: 'bg-yellow-100 text-yellow-700' },
        confused: { emoji: '😕', color: 'bg-orange-100 text-orange-700' }
    };
    const e = emotions[emotion] || emotions.happy;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${e.color}`}>
            {e.emoji} {emotion}
        </span>
    );
};

export default ParentDashboard;
