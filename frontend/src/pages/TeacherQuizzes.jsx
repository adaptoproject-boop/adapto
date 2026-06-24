import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiPlus, FiArrowLeft, FiCheckCircle, FiHelpCircle, FiTrash2 } from 'react-icons/fi';
import CartoonButton from '../components/CartoonButton';
import { API_URL } from '../api/config';

const TeacherQuizzes = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        subject: 'Alphabets',
        topic: '',
        difficulty: 'Easy',
        questions: Array(5).fill({
            question: '',
            options: ['', '', '', ''],
            correct_answer: 0
        })
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch(`${API_URL}/teacher/quizzes`);
            const data = await response.json();
            setQuizzes(data.quizzes || []);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionChange = (qIndex, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[oIndex] = value;
        newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/teacher/create-quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setShowAddForm(false);
                setFormData({
                    subject: 'Alphabets',
                    topic: '',
                    difficulty: 'Easy',
                    questions: Array(5).fill({
                        question: '',
                        options: ['', '', '', ''],
                        correct_answer: 0
                    })
                });
                fetchQuizzes();
            } else {
                setError(data.error || 'Failed to create quiz');
            }
        } catch (error) {
            setError('Server error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!formData.subject || !formData.topic) {
            setError('Please enter a subject and topic to generate questions.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/gemini/quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: formData.subject,
                    topic: formData.topic,
                    difficulty: formData.difficulty
                })
            });

            const data = await response.json();

            if (response.ok && data.content && Array.isArray(data.content)) {
                // Map API response to our form structure
                const generatedQuestions = data.content.map(q => ({
                    question: q.question,
                    options: q.options || ['', '', '', ''],
                    correct_answer: q.correctAnswer !== undefined ? q.correctAnswer : 0
                }));
                
                // Ensure we have 5 questions
                while (generatedQuestions.length < 5) {
                    generatedQuestions.push({
                        question: '',
                        options: ['', '', '', ''],
                        correct_answer: 0
                    });
                }
                
                setFormData(prev => ({
                    ...prev,
                    questions: generatedQuestions.slice(0, 5)
                }));
            } else {
                setError(data.error || 'Failed to generate quiz with AI.');
            }
        } catch (error) {
            console.error('Error generating AI quiz:', error);
            setError('Server error while generating AI quiz.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-pastel-gradient pt-32 px-8 pb-12 relative overflow-hidden">
            <div className="deco-blob deco-blob-pink w-64 h-64 -top-20 -left-20" />
            <div className="deco-blob deco-blob-blue w-72 h-72 top-1/2 -right-20" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/teacher/dashboard')}
                            className="bg-white/80 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-500"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <FiFileText className="text-purple-500" /> Quizzes
                            </h1>
                            <p className="text-gray-500">Create and manage assessment quizzes</p>
                        </div>
                    </div>

                    <CartoonButton variant="primary" onClick={() => setShowAddForm(true)}>
                        <FiPlus className="mr-2" /> Create New Quiz
                    </CartoonButton>
                </div>

                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm overflow-y-auto"
                        >
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className="glass-card-solid w-full max-w-4xl p-8 my-auto relative"
                            >
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                                >
                                    <FiPlus className="rotate-45" size={24} />
                                </button>

                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                        <FiCheckCircle className="text-green-500" /> Design New Quiz
                                    </h2>
                                    <button 
                                        type="button"
                                        onClick={handleAIGenerate}
                                        disabled={submitting}
                                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-indigo-200"
                                    >
                                        ✨ Auto-Generate with AI
                                    </button>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 border border-red-100 italic">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <form onSubmit={handleCreateQuiz} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                                            <select
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-200"
                                            >
                                                {['Alphabets', 'Numbers', 'Colors', 'Shapes', 'Plants', 'Flowers'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Quiz Topic</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Master the letter A"
                                                value={formData.topic}
                                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                                className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Questions Area - Fixed Height for alignment */}
                                    <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
                                        {formData.questions.map((q, qIndex) => (
                                            <div key={qIndex} className="bg-slate-50/50 p-6 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                                        {qIndex + 1}
                                                    </span>
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="Enter question text..."
                                                        value={q.question}
                                                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                                        className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-200"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                name={`q-${qIndex}-correct`}
                                                                checked={q.correct_answer === oIndex}
                                                                onChange={() => handleQuestionChange(qIndex, 'correct_answer', oIndex)}
                                                                className="w-4 h-4 text-green-500"
                                                            />
                                                            <input
                                                                required
                                                                placeholder={`Option ${oIndex + 1}`}
                                                                value={opt}
                                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-200"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                                        <CartoonButton variant="secondary" type="button" className="flex-1" onClick={() => setShowAddForm(false)}>
                                            Cancel
                                        </CartoonButton>
                                        <CartoonButton variant="primary" type="submit" className="flex-1" disabled={submitting}>
                                            {submitting ? 'Creating...' : 'Launch Quiz'}
                                        </CartoonButton>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quizzes.length > 0 ? (
                            quizzes.map((quiz, i) => (
                                <motion.div
                                    key={quiz._id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-6 flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 text-xl">
                                                <FiHelpCircle />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">{quiz.topic}</h3>
                                                <p className="text-xs text-gray-400 capitalize">{quiz.subject} • {quiz.difficulty}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${quiz.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {quiz.status}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-xl p-4 mb-6">
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <FiFileText /> {quiz.questions?.length || 0} Questions Total
                                        </p>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                        <p className="text-[10px] text-gray-400">Created on {new Date(quiz.created_at).toLocaleDateString()}</p>
                                        <div className="flex gap-2">
                                            <button className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center glass-card">
                                <span className="text-6xl mb-4 block">📝</span>
                                <h3 className="text-2xl font-bold text-gray-700">No quizzes yet</h3>
                                <p className="text-gray-500">Create your first quiz to challenge your students!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherQuizzes;
