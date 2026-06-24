import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiArrowLeft, FiStar, FiBookOpen, FiAward, FiFileText, FiDownload } from 'react-icons/fi';
import CartoonButton from '../components/CartoonButton';
import { API_URL } from '../api/config';

const TeacherStudents = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('name'); // name, stars, lessons

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch(`${API_URL}/teacher/students`);
            const data = await response.json();
            setStudents(data.students || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async (studentId, studentName) => {
        try {
            const response = await fetch(`${API_URL}/reports/generate-report/${studentId}`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Report_${studentName}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Failed to download report. Make sure student has taken quizzes.");
            }
        } catch (error) {
            console.error('Download error:', error);
            alert("Error downloading report.");
        }
    };

    return (
        <div className="min-h-screen bg-pastel-gradient pt-32 px-8 pb-12 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="deco-blob deco-blob-pink w-64 h-64 -top-20 -left-20" />
            <div className="deco-blob deco-blob-blue w-72 h-72 top-1/2 -right-20" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/teacher/dashboard')}
                            className="bg-white/80 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-500"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <FiUsers className="text-blue-500" /> Student Directory
                            </h1>
                            <p className="text-gray-500">View and manage all your students' progress</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white/60 p-2 rounded-2xl border border-white">
                        <span className="text-sm font-bold text-gray-500 pl-2">Sort by:</span>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none outline-none text-gray-700 font-bold pr-4 cursor-pointer"
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="stars">Most Stars</option>
                            <option value="lessons">Most Lessons Completed</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.length > 0 ? (
                            [...students].sort((a, b) => {
                                if (sortBy === 'name') return a.name.localeCompare(b.name);
                                if (sortBy === 'stars') return (b.totalStars || 0) - (a.totalStars || 0);
                                if (sortBy === 'lessons') return (b.completedLessons || 0) - (a.completedLessons || 0);
                                return 0;
                            }).map((student, i) => (
                                <motion.div
                                    key={student._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-6 group hover:translate-y-[-5px] transition-all"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                                            {student.role === 'kid' ? '👶' : '👨‍🎓'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-700">{student.name}</h3>
                                            <p className="text-gray-400 text-sm">{student.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/40 p-3 rounded-xl border border-white/50">
                                            <div className="flex items-center gap-2 text-yellow-500 mb-1">
                                                <FiStar size={14} />
                                                <span className="text-xs font-bold uppercase tracking-wider">Stars</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-700">{student.totalStars || 0}</p>
                                        </div>
                                        <div className="bg-white/40 p-3 rounded-xl border border-white/50">
                                            <div className="flex items-center gap-2 text-green-500 mb-1">
                                                <FiBookOpen size={14} />
                                                <span className="text-xs font-bold uppercase tracking-wider">Lessons</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-700">{student.completedLessons || 0}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                                            <FiAward /> Level: <span className="capitalize">{student.level || 'Easy'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownloadReport(student._id, student.name)}
                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                title="Download Report"
                                            >
                                                <FiDownload />
                                            </button>
                                            <CartoonButton
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/teacher/student-progress/${student._id}`)}
                                            >
                                                View Progress
                                            </CartoonButton>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center glass-card">
                                <span className="text-6xl mb-4 block">🔍</span>
                                <h3 className="text-2xl font-bold text-gray-700">No students found</h3>
                                <p className="text-gray-500">Wait for students to join your platform!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherStudents;
