import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiPlayCircle, FiHelpCircle, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import CartoonButton from '../components/CartoonButton';
import { useLearning } from '../context/LearningContext';

const TeacherLessons = () => {
    const navigate = useNavigate();
    const { t } = useLearning();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSubject, setFilterSubject] = useState('All');
    const [filterDifficulty, setFilterDifficulty] = useState('All');

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5612/api/curriculum/all');
            if (response.data.success) {
                setLessons(response.data.lessons);
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;
        try {
            const response = await axios.delete(`http://localhost:5612/api/curriculum/lesson/${id}`);
            if (response.data.success) {
                setLessons(lessons.filter(l => l.id !== id));
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
        }
    };

    const filteredLessons = lessons.filter(lesson => {
        const matchesSearch = lesson.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             lesson.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = filterSubject === 'All' || lesson.subject === filterSubject;
        const matchesDifficulty = filterDifficulty === 'All' || lesson.difficulty === filterDifficulty;
        return matchesSearch && matchesSubject && matchesDifficulty;
    });

    const subjects = ['All', ...new Set(lessons.map(l => l.subject))];
    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    return (
        <div className="min-h-screen bg-pastel-gradient pt-32 px-8 pb-12 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/teacher/dashboard')}
                            className="bg-white/80 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-500"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Manage Curriculum</h1>
                            <p className="text-gray-500">View and edit study lessons and quizzes</p>
                        </div>
                    </div>
                    <CartoonButton variant="primary" onClick={() => navigate('/teacher/edit-lesson/new')}>
                        <FiPlus className="mr-2" /> Add New Lesson
                    </CartoonButton>
                </div>

                {/* Filters */}
                <div className="glass-card p-6 mb-8 flex flex-wrap items-center gap-6">
                    <div className="flex-1 min-w-[250px] relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by topic or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-coral/20 outline-none transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <FiFilter className="text-gray-400" />
                        <select
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            className="bg-white/50 border border-white px-4 py-3 rounded-xl outline-none"
                        >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className="bg-white/50 border border-white px-4 py-3 rounded-xl outline-none"
                        >
                            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {/* Lessons Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredLessons.map((lesson) => (
                            <motion.div
                                key={lesson.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-white"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            lesson.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                                            lesson.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {lesson.difficulty}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-700 mt-2">{lesson.topic}</h3>
                                        <p className="text-coral font-semibold text-sm">{lesson.subject}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => navigate(`/teacher/edit-lesson/${lesson.id}`)}
                                            className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Edit Lesson"
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(lesson.id)}
                                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Delete Lesson"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <FiPlayCircle className="text-coral" />
                                        <span className="truncate max-w-[250px]">{lesson.video_url}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <FiHelpCircle className="text-purple-500" />
                                        <span>{lesson.quiz_data?.length || 0} Questions in Quiz</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-400">Order: {lesson.sequence_order}</span>
                                    <button 
                                        onClick={() => navigate(`/teacher/edit-lesson/${lesson.id}`)}
                                        className="text-sm font-bold text-gray-600 hover:text-coral transition-colors"
                                    >
                                        Edit Details →
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredLessons.length === 0 && (
                    <div className="text-center py-20 glass-card">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-700">No lessons found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherLessons;
