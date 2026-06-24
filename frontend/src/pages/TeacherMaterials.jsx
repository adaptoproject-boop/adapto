import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiPlus, FiArrowLeft, FiYoutube, FiSearch, FiTrash2, FiExternalLink } from 'react-icons/fi';
import CartoonButton from '../components/CartoonButton';
import { API_URL } from '../api/config';

const TeacherMaterials = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        subject: 'Alphabets',
        topic: '',
        difficulty: 'Easy',
        content_type: 'Fun',
        youtube_url: '',
        description: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await fetch(`${API_URL}/teacher/study-materials`);
            const data = await response.json();
            setMaterials(data.materials || []);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const url = editMode 
                ? `${API_URL}/teacher/study-material/${editId}`
                : `${API_URL}/teacher/add-study-material`;
            const method = editMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setShowAddForm(false);
                setEditMode(false);
                setEditId(null);
                setFormData({
                    subject: 'Alphabets',
                    topic: '',
                    difficulty: 'Easy',
                    content_type: 'Fun',
                    youtube_url: '',
                    description: ''
                });
                fetchMaterials();
            } else {
                setError(data.error || 'Failed to add material');
            }
        } catch (error) {
            setError('Server error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (material) => {
        setFormData({
            subject: material.subject,
            topic: material.topic,
            difficulty: material.difficulty,
            content_type: material.content_type,
            youtube_url: material.youtube_url,
            description: material.description || ''
        });
        setEditMode(true);
        setEditId(material._id || material.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            const response = await fetch(`${API_URL}/teacher/study-material/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMaterials(materials.filter(m => m._id !== id));
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-pastel-gradient pt-32 px-8 pb-12 relative overflow-hidden">
            <div className="deco-blob deco-blob-purple w-64 h-64 -top-20 -right-20" />
            <div className="deco-blob deco-blob-blue w-72 h-72 bottom-0 left-0" />

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
                                <FiBook className="text-purple-500" /> Study Materials
                            </h1>
                            <p className="text-gray-500">Manage your YouTube lesson videos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search materials..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/70 backdrop-blur-sm pl-11 pr-4 py-3 rounded-2xl border border-white focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all w-64"
                            />
                        </div>
                        <CartoonButton variant="primary" onClick={() => {
                            setEditMode(false);
                            setEditId(null);
                            setFormData({
                                subject: 'Alphabets',
                                topic: '',
                                difficulty: 'Easy',
                                content_type: 'Fun',
                                youtube_url: '',
                                description: ''
                            });
                            setShowAddForm(true);
                        }}>
                            <FiPlus className="mr-2" /> Add New
                        </CartoonButton>
                    </div>
                </div>

                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm"
                        >
                            <div className="glass-card-solid w-full max-w-2xl p-8 relative">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                                >
                                    <FiPlus className="rotate-45" size={24} />
                                </button>

                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <FiYoutube className="text-red-500" /> {editMode ? 'Edit YouTube Material' : 'Add YouTube Material'}
                                </h2>

                                {error && (
                                    <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-2">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <form onSubmit={handleAddMaterial} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-600 uppercase ml-1">Subject</label>
                                            <select
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
                                            >
                                                {['Alphabets', 'Numbers', 'Colors', 'Shapes', 'Plants', 'Flowers'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-600 uppercase ml-1">Difficulty</label>
                                            <select
                                                value={formData.difficulty}
                                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                                className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
                                            >
                                                {['Easy', 'Medium', 'Hard'].map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">Topic Title</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Learning A for Apple"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">YouTube URL</label>
                                        <div className="relative">
                                            <FiYoutube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                required
                                                type="url"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                value={formData.youtube_url}
                                                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                                className="w-full bg-slate-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-600 uppercase ml-1">Content Style</label>
                                            <select
                                                value={formData.content_type}
                                                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                                                className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-200"
                                            >
                                                {['Fun', 'Explanation', 'Standard'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <CartoonButton
                                            variant="secondary"
                                            type="button"
                                            className="flex-1"
                                            onClick={() => setShowAddForm(false)}
                                        >
                                            Cancel
                                        </CartoonButton>
                                        <CartoonButton
                                            variant="primary"
                                            type="submit"
                                            className="flex-1"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Saving...' : (editMode ? 'Update Material' : 'Add Material')}
                                        </CartoonButton>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="bg-white/30 backdrop-blur-md rounded-3xl border border-white p-2">
                        <table className="w-full text-left">
                            <thead className="text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-white/50">
                                <tr>
                                    <th className="px-6 py-4">Topic</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Level</th>
                                    <th className="px-6 py-4">Style</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20">
                                {filteredMaterials.map((material, i) => (
                                    <motion.tr
                                        key={material._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-white/20 transition-all group"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500">
                                                    <FiYoutube />
                                                </div>
                                                <span className="font-bold text-gray-700">{material.topic}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-gray-500 border border-white">
                                                {material.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-xs font-bold ${material.difficulty === 'Easy' ? 'text-green-500' :
                                                    material.difficulty === 'Medium' ? 'text-blue-500' : 'text-purple-500'
                                                }`}>
                                                {material.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-gray-500 text-sm">{material.content_type}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <a
                                                    href={material.youtube_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-all shadow-sm"
                                                >
                                                    <FiExternalLink />
                                                </a>
                                                <button
                                                    onClick={() => handleEditClick(material)}
                                                    className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-all shadow-sm"
                                                    title="Edit Material"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(material._id || material.id)}
                                                    className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-sm"
                                                    title="Delete Material"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}

                                {filteredMaterials.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-gray-400">
                                            No study materials found. Start by adding one!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherMaterials;
