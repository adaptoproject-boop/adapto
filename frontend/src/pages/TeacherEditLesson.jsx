import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft, FiPlus, FiTrash2, FiVideo, FiFileText, FiAward } from 'react-icons/fi';
import axios from 'axios';
import CartoonButton from '../components/CartoonButton';
import { useLearning } from '../context/LearningContext';

const TeacherEditLesson = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLearning();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [lessonData, setLessonData] = useState({
        subject: 'Numbers & Math',
        topic: '',
        difficulty: 'Easy',
        sequence_order: 1,
        video_url: '',
        learning_objective: '',
        min_pass_score: 70,
        quiz_data: []
    });

    useEffect(() => {
        if (!isNew) {
            fetchLesson();
        }
    }, [id]);

    const fetchLesson = async () => {
        try {
            const response = await axios.get(`http://localhost:5612/api/curriculum/lesson/${id}`);
            if (response.data.success) {
                setLessonData(response.data.lesson);
            }
        } catch (error) {
            console.error('Error fetching lesson:', error);
            alert('Failed to load lesson data');
            navigate('/teacher/lessons');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLessonData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuizChange = (index, field, value) => {
        const updatedQuiz = [...lessonData.quiz_data];
        updatedQuiz[index][field] = value;
        setLessonData(prev => ({ ...prev, quiz_data: updatedQuiz }));
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updatedQuiz = [...lessonData.quiz_data];
        updatedQuiz[qIndex].options[oIndex] = value;
        setLessonData(prev => ({ ...prev, quiz_data: updatedQuiz }));
    };

    const addQuestion = () => {
        setLessonData(prev => ({
            ...prev,
            quiz_data: [
                ...prev.quiz_data,
                { question: '', options: ['', '', '', ''], answer: '', explanation: '' }
            ]
        }));
    };

    const removeQuestion = (index) => {
        const updatedQuiz = lessonData.quiz_data.filter((_, i) => i !== index);
        setLessonData(prev => ({ ...prev, quiz_data: updatedQuiz }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let response;
            if (isNew) {
                response = await axios.post('http://localhost:5612/api/curriculum/lesson', lessonData);
            } else {
                response = await axios.put(`http://localhost:5612/api/curriculum/lesson/${id}`, lessonData);
            }

            if (response.data.success) {
                alert(`Lesson ${isNew ? 'created' : 'updated'} successfully!`);
                navigate('/teacher/lessons');
            }
        } catch (error) {
            console.error('Error saving lesson:', error);
            alert('Failed to save lesson');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div></div>;

    return (
        <div className="min-h-screen bg-pastel-gradient pt-32 px-8 pb-12 relative overflow-hidden">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/teacher/lessons')} className="flex items-center gap-2 text-gray-500 hover:text-coral mb-6 transition-colors">
                    <FiArrowLeft /> Back to Lessons
                </button>

                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800">{isNew ? 'Create New Lesson' : 'Edit Lesson'}</h1>
                    <CartoonButton variant="primary" onClick={handleSave} disabled={saving}>
                        <FiSave className="mr-2" /> {saving ? 'Saving...' : 'Save Lesson'}
                    </CartoonButton>
                </div>

                <form className="space-y-8 pb-20">
                    {/* Basic Info Section */}
                    <section className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <FiVideo className="text-coral text-xl" />
                            <h2 className="text-xl font-bold text-gray-700">Lesson Details</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-600 mb-2">Topic Name</label>
                                <input
                                    name="topic"
                                    value={lessonData.topic}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Counting 1-10"
                                    className="w-full px-4 py-3 bg-white/50 border border-white rounded-xl outline-none"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Subject</label>
                                <select
                                    name="subject"
                                    value={lessonData.subject}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/50 border border-white rounded-xl outline-none"
                                >
                                    <option>Numbers & Math</option>
                                    <option>Language Basics</option>
                                    <option>Environment & Nature</option>
                                    <option>Shapes & Colors</option>
                                    <option>Logical Thinking</option>
                                    <option>General Awareness</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={lessonData.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/50 border border-white rounded-xl outline-none"
                                >
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-600 mb-2">YouTube Video URL</label>
                                <input
                                    name="video_url"
                                    value={lessonData.video_url}
                                    onChange={handleInputChange}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-4 py-3 bg-white/50 border border-white rounded-xl outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-600 mb-2">Learning Objective</label>
                                <textarea
                                    name="learning_objective"
                                    value={lessonData.learning_objective}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-4 py-3 bg-white/50 border border-white rounded-xl outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Quiz Section */}
                    <section className="glass-card p-8">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3">
                                <FiFileText className="text-purple-500 text-xl" />
                                <h2 className="text-xl font-bold text-gray-700">Quiz Questions</h2>
                            </div>
                            <button 
                                type="button"
                                onClick={addQuestion}
                                className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
                            >
                                <FiPlus /> Add Question
                            </button>
                        </div>

                        <div className="space-y-10">
                            {lessonData.quiz_data.map((q, qIndex) => (
                                <motion.div 
                                    key={qIndex} 
                                    layout
                                    className="p-6 bg-white/30 rounded-2xl border border-white relative"
                                >
                                    <button 
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Question {qIndex + 1}</label>
                                            <input
                                                value={q.question}
                                                onChange={(e) => handleQuizChange(qIndex, 'question', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/60 border border-white rounded-xl outline-none font-semibold text-gray-700"
                                                placeholder="Enter question text..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex}>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Option {oIndex + 1}</label>
                                                    <input
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                        className="w-full px-4 py-2 bg-white/40 border border-white rounded-lg outline-none text-sm"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-green-600 mb-1">Correct Answer</label>
                                                <input
                                                    value={q.answer}
                                                    onChange={(e) => handleQuizChange(qIndex, 'answer', e.target.value)}
                                                    className="w-full px-4 py-2 bg-green-50/50 border border-green-100 rounded-lg outline-none text-sm"
                                                    placeholder="Must match one of the options exactly"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-blue-600 mb-1">Explanation (Adaptive Hint)</label>
                                                <input
                                                    value={q.explanation}
                                                    onChange={(e) => handleQuizChange(qIndex, 'explanation', e.target.value)}
                                                    className="w-full px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-lg outline-none text-sm"
                                                    placeholder="Explain why this is correct"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {lessonData.quiz_data.length === 0 && (
                                <div className="text-center py-10 text-gray-400 italic">
                                    No questions added yet. Click "Add Question" to start.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Advanced Section */}
                    <section className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <FiAward className="text-orange-500 text-xl" />
                            <h2 className="text-xl font-bold text-gray-700">Adaptive Settings</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Min. Passing Score (%)</label>
                                <input
                                    type="number"
                                    name="min_pass_score"
                                    value={lessonData.min_pass_score}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/50 border border-white rounded-xl outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Sequence Order</label>
                                <input
                                    type="number"
                                    name="sequence_order"
                                    value={lessonData.sequence_order}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/50 border border-white rounded-xl outline-none"
                                />
                            </div>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
};

export default TeacherEditLesson;
