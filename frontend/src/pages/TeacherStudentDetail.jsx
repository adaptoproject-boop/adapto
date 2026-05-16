import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
import { mockLessons } from '../mockData';
import { FiClock, FiCheckCircle, FiBookOpen, FiStar, FiAward, FiArrowLeft, FiFileText, FiActivity } from 'react-icons/fi';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const TeacherStudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await fetch(`http://localhost:5612/api/teacher/student-progress/${id}`);
                const data = await response.json();
                setStudentData(data);
            } catch (error) {
                console.error('Error fetching student progress:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [id]);

    // Generate Report Handler
    const handleGenerateReport = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5612/api/reports/generate-report/${id}`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Student_Report_${student.name}.pdf`;
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

    if (loading) {
        return (
            <div className="min-h-screen bg-pastel-gradient flex items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
                <p className="text-gray-500 font-bold animate-pulse">Generating AI Report...</p>
            </div>
        );
    }

    if (!studentData || !studentData.student) {
        return (
            <div className="min-h-screen bg-pastel-gradient flex items-center justify-center flex-col gap-4">
                <div className="text-2xl font-bold text-gray-600">Student not found</div>
                <button
                    onClick={() => navigate('/teacher/students')}
                    className="text-blue-500 hover:underline"
                >
                    Back to Students
                </button>
            </div>
        );
    }

    const { student, quiz_results, subject_progress, overall_stats } = studentData;

    // Prepare Chart Data
    const chartData = {
        labels: quiz_results.slice().reverse().map(r => new Date(r.timestamp).toLocaleDateString()),
        datasets: [
            {
                label: 'Quiz Scores',
                data: quiz_results.slice().reverse().map(r => r.quizScore || r.score),
                borderColor: '#FF7F50',
                backgroundColor: 'rgba(255, 127, 80, 0.5)',
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Confusion Level',
                data: quiz_results.slice().reverse().map(r => (r.confused_ratio || 0) * 100),
                borderColor: '#818cf8',
                backgroundColor: 'rgba(129, 140, 248, 0.5)',
                tension: 0.4,
                borderDash: [5, 5],
                yAxisID: 'y',
            }
        ]
    };

    return (
        <div className="min-h-screen bg-pastel-gradient pt-32 px-8 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/teacher/students')}
                            className="bg-white/80 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-500"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{student.name}'s Progress</h1>
                            <p className="text-gray-500"> detailed performance report</p>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateReport}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
                    >
                        <FiFileText size={20} /> Generate AI Report
                    </button>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <StatCard icon={<FiStar />} label="Total Stars" value={overall_stats.total_stars} color="text-yellow-500 bg-yellow-50" />
                    <StatCard icon={<FiBookOpen />} label="Lessons Completed" value={overall_stats.completed_lessons} color="text-blue-500 bg-blue-50" />
                    <StatCard icon={<FiCheckCircle />} label="Quizzes Passed" value={overall_stats.quizzes_passed} color="text-green-500 bg-green-50" />
                    <StatCard icon={<FiAward />} label="Average Score" value={`${overall_stats.average_score}%`} color="text-purple-500 bg-purple-50" />
                    <StatCard icon={<FiClock />} label="Study Time" value={`${overall_stats.total_study_time_mins}m`} color="text-orange-500 bg-orange-50" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Chart */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">📈 Score & Emotion Trend</h3>
                            <div className="flex gap-4">
                                <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-2 h-2 bg-coral rounded-full"></span> Score</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-2 h-2 bg-indigo-400 rounded-full"></span> Emotion Intensity</span>
                            </div>
                        </div>
                        <div className="h-64">
                            {quiz_results.length > 0 ? (
                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: { y: { beginAtZero: true, max: 100 } }
                                    }}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No quiz data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subject Progress */}
                    <div className="glass-card p-6 flex flex-col">
                        <h3 className="font-bold text-gray-700 mb-4">📚 Subject Performance</h3>
                        <div className="space-y-4 flex-1">
                            {Object.entries(subject_progress).map(([subject, stats]) => (
                                <div key={subject} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                                    <div>
                                        <p className="font-bold text-gray-700">{subject}</p>
                                        <p className="text-xs text-gray-500">{stats.total_quizzes} quizzes</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${stats.average_score >= 80 ? 'text-green-500' : stats.average_score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {stats.average_score}%
                                        </p>
                                        <p className="text-xs text-gray-400 uppercase">{stats.current_level}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Teacher Actions */}
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teacher Actions</h4>
                            <button 
                                onClick={async () => {
                                    const res = await axios.post('http://localhost:5612/api/teacher/notify-parent', { student_id: id });
                                    alert(res.data.message);
                                }}
                                className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:border-coral hover:text-coral transition-all"
                            >
                                📧 Notify Parent
                            </button>
                            <button 
                                onClick={() => navigate('/teacher/lessons')}
                                className="w-full py-2 bg-coral text-white rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
                            >
                                🎯 Assign Remedial
                            </button>
                        </div>
                    </div>
                </div>

                {/* Emotion Timeline */}
                <div className="glass-card p-6">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <FiActivity className="text-coral" /> Real-time Emotion Timeline
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {(studentData.emotion_timeline || []).map((log, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 p-3 bg-white/40 rounded-xl border border-white min-w-[100px]">
                                <span className="text-2xl">
                                    {log.emotion === 'happy' ? '😊' : log.emotion === 'confused' ? '😕' : log.emotion === 'neutral' ? '😐' : '😮'}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{log.emotion}</span>
                                <span className="text-[9px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <div className="mt-1 w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                                    <div className="bg-coral h-full" style={{ width: `${log.score}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-6">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <FiClock className="text-blue-500" /> Recent Activity
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                                    <th className="pb-3 pl-4">Date</th>
                                    <th className="pb-3">Lesson / Topic</th>
                                    <th className="pb-3">Score</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Level Change</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {quiz_results.map((result, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-white/50 transition-colors">
                                        <td className="py-4 pl-4 text-gray-500">
                                            {new Date(result.timestamp).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 font-medium text-gray-700">
                                            {result.lessonTitle || result.subject}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-lg font-bold ${(result.quizScore || result.score) >= 80 ? 'bg-green-100 text-green-600' :
                                                (result.quizScore || result.score) >= 50 ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-red-100 text-red-600'
                                                }`}>
                                                {result.quizScore || result.score}%
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            {result.passed ? (
                                                <span className="text-green-500 flex items-center gap-1"><FiCheckCircle /> Passed</span>
                                            ) : (
                                                <span className="text-red-400">Retry</span>
                                            )}
                                        </td>
                                        <td className="py-4 text-gray-500">
                                            {result.videoLevel} → {result.nextLevel}
                                        </td>
                                    </tr>
                                ))}
                                {quiz_results.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-400">
                                            No recent activity found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Curriculum-wide Progress (User's Request: "All like start lessons") */}
                <div className="glass-card p-6">
                    <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <FiActivity className="text-pink-500" /> Curriculum Completion Status
                    </h3>
                    
                    <div className="space-y-8">
                        {/* Group lessons by subject from mockData */}
                        {Array.from(new Set(mockLessons.map(l => l.subject))).map(subject => (
                            <div key={subject} className="space-y-4">
                                <h4 className="text-lg font-bold text-gray-600 border-l-4 border-coral pl-3">{subject}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {mockLessons.filter(l => l.subject === subject).map(lesson => {
                                        const results = quiz_results.filter(r => r.lessonId === lesson._id || (r.lessonTitle === lesson.title));
                                        const isCompleted = results.some(r => r.passed);
                                        const bestScore = results.length > 0 ? Math.max(...results.map(r => r.quizScore || r.score)) : 0;
                                        const isStarted = results.length > 0;

                                        return (
                                            <div key={lesson._id} className={`p-4 rounded-2xl border-2 transition-all ${
                                                isCompleted ? 'bg-green-50 border-green-100' : 
                                                isStarted ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'
                                            }`}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-2xl">{lesson.emoji}</span>
                                                    {isCompleted ? (
                                                        <span className="bg-green-500 text-white p-1 rounded-full text-xs">
                                                            <FiCheckCircle />
                                                        </span>
                                                    ) : isStarted ? (
                                                        <span className="bg-blue-500 text-white p-1 rounded-full text-xs animate-pulse">
                                                            <FiActivity />
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">
                                                            <FiBookOpen />
                                                        </span>
                                                    )}
                                                </div>
                                                <h5 className="font-bold text-gray-700 text-sm mb-1">{lesson.title}</h5>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">
                                                        {isCompleted ? 'Completed' : isStarted ? 'In Progress' : 'Not Started'}
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

const StatCard = ({ icon, label, value, color }) => (
    <div className="glass-card p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export default TeacherStudentDetail;
