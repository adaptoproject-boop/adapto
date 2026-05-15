import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import CartoonButton from '../components/CartoonButton';
import EmotionTracker from '../components/EmotionTracker';
import { FaChevronLeft, FaCheck, FaTimes, FaStar, FaLock, FaFire } from 'react-icons/fa';
import { mockQuizzes, mockLessons } from '../mockData';
import { useLearning } from '../context/LearningContext';
import Mascot from '../components/Mascot';

const Quiz = () => {
    const { id, subjectName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isVideoComplete, submitQuizResult, generateAiQuiz, getCurrentLevel, teacherMaterials, teacherQuizzes } = useLearning();

    const [quizData, setQuizData] = useState(null);
    const [lessonData, setLessonData] = useState(null);

    const searchParams = new URLSearchParams(location.search);
    const videoCompletion = parseFloat(searchParams.get('videoCompletion') || '1.0');
    const initialConfusedRatio = parseFloat(searchParams.get('confusedRatio') || '0.0');
    const [liveConfusedRatio, setLiveConfusedRatio] = useState(initialConfusedRatio);

    useEffect(() => {
        const fetchQuizData = async () => {
            if (subjectName) {
                const subjectQuizzes = Object.values(mockQuizzes).filter(q => q.subject === subjectName);
                const allQuestions = subjectQuizzes.flatMap(q => q.questions);

                if (allQuestions.length > 0) {
                    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
                    setQuizData({
                        lessonTitle: `${subjectName} Mega Quiz`,
                        subject: subjectName,
                        level: "Master",
                        questions: shuffled.slice(0, 10)
                    });
                    setLessonData({ title: `${subjectName} Mega Quiz`, subject: subjectName, _id: `subject-${subjectName}` });
                } else {
                    const aiQuiz = await generateAiQuiz(subjectName, "General Knowledge", "Medium");
                    if (aiQuiz) {
                        setQuizData(aiQuiz);
                        setLessonData({ title: `${subjectName} Mega Quiz`, subject: subjectName, _id: `subject-${subjectName}` });
                    }
                }
            } else if (id) {
                const material = teacherMaterials?.find(m => m._id === id || m.id === id);
                if (material && material.quiz_data) {
                    setLessonData({ title: material.topic, subject: material.subject, _id: material.id || material._id });
                    
                    const rawQuestions = typeof material.quiz_data === 'string' 
                        ? JSON.parse(material.quiz_data) 
                        : material.quiz_data;

                    const formattedQuestions = rawQuestions.map((q, i) => ({
                        id: `db_${i}`,
                        question: q.question || q.text,
                        options: q.options,
                        correctAnswer: typeof q.answer === 'string' 
                            ? q.options.indexOf(q.answer) 
                            : (q.correctAnswer ?? q.answer),
                        explanation: q.explanation
                    }));

                    setQuizData({
                        lessonTitle: material.topic,
                        subject: material.subject,
                        level: material.difficulty || 'Easy',
                        questions: formattedQuestions
                    });
                    return;
                }

                const teacherQuiz = teacherQuizzes?.find(q => q._id === id);
                if (teacherQuiz) {
                    setLessonData({ title: teacherQuiz.topic, subject: teacherQuiz.subject, _id: teacherQuiz._id });

                    const formattedQuestions = teacherQuiz.questions.map((q, i) => ({
                        id: `tq_${i}`,
                        text: q.question,
                        options: q.options,
                        correctAnswer: q.correct_answer,
                        explanation: `The correct answer is ${q.options[q.correct_answer]}`
                    }));

                    setQuizData({
                        lessonTitle: teacherQuiz.topic,
                        subject: teacherQuiz.subject,
                        level: teacherQuiz.difficulty || 'Easy',
                        questions: formattedQuestions
                    });
                    return;
                }

                let lookupId = decodeURIComponent(id).trim();
                const cleanLookup = lookupId.toLowerCase();
                if (cleanLookup === "body parts") lookupId = "G1";
                if (cleanLookup === "phonics") lookupId = "L1";

                const paramTopic = searchParams.get('topic');
                const paramSubject = searchParams.get('subject');

                const topicToUse = paramTopic || lookupId;

                const matchedLesson = mockLessons.find(l => l._id === lookupId || l.title === topicToUse || l.title === lookupId);
                if (matchedLesson) lookupId = matchedLesson._id;

                const lesson = matchedLesson || (teacherMaterials && teacherMaterials.find(m => m._id === lookupId));
                setLessonData(lesson || { title: topicToUse, subject: paramSubject || "General" });

                const subjectToUse = paramSubject || (lesson ? lesson.subject : "General");

                if (topicToUse) {
                    const aiQuiz = await generateAiQuiz(subjectToUse, topicToUse, getCurrentLevel(subjectToUse));
                    if (aiQuiz && aiQuiz.questions && aiQuiz.questions.length > 0) {
                        setQuizData(aiQuiz);
                    } else if (mockQuizzes[lookupId] && mockQuizzes[lookupId].questions) {
                        setQuizData(mockQuizzes[lookupId]);
                    } else {
                        setQuizData({
                            lessonTitle: topicToUse,
                            subject: subjectToUse,
                            level: "Easy",
                            questions: [{
                                id: "fallback_1",
                                question: `What is the main topic of ${topicToUse}?`,
                                options: [topicToUse, "Nothing", "I don't know", "Wait"],
                                correctAnswer: 0,
                                explanation: "This is a fallback question."
                            }]
                        });
                    }
                } else {
                    setQuizData(mockQuizzes[lookupId]);
                }
            }
        };

        fetchQuizData();
    }, [id, subjectName]);

    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [startTime, setStartTime] = useState(Date.now());
    const [responseTimes, setResponseTimes] = useState([]);

    const [liveStreakCorrect, setLiveStreakCorrect] = useState(0);
    const [liveStreakWrong,   setLiveStreakWrong]   = useState(0);
    const [retries,           setRetries]           = useState(0);
    const lastWasWrong = useRef(false);

    useEffect(() => {
        setStartTime(Date.now());
        lastWasWrong.current = false;
    }, [current]);

    const handleAnswer = (index) => {
        if (feedback !== null) return;

        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        const newResponseTimes = [...responseTimes, timeTaken];
        setResponseTimes(newResponseTimes);

        setSelected(index);
        const isCorrect = index === question?.correctAnswer;
        setFeedback(isCorrect ? 'correct' : 'wrong');

        const newAnswers = [...answers, { questionId: question?.id, selected: index, correct: isCorrect }];
        setAnswers(newAnswers);

        let newStreakCorrect = liveStreakCorrect;
        let newStreakWrong   = liveStreakWrong;
        let newRetries       = retries;

        if (isCorrect) {
            setScore(s => s + 1);
            newStreakCorrect = liveStreakCorrect + 1;
            newStreakWrong   = 0;
            lastWasWrong.current = false;
        } else {
            newStreakWrong   = liveStreakWrong + 1;
            newStreakCorrect = 0;
            if (lastWasWrong.current) newRetries = retries + 1;
            lastWasWrong.current = true;
        }
        setLiveStreakCorrect(newStreakCorrect);
        setLiveStreakWrong(newStreakWrong);
        setRetries(newRetries);

        setTimeout(async () => {
            setFeedback(null);
            setSelected(null);
            if (current + 1 < totalQuestions) {
                setCurrent(current + 1);
            } else {
                const finalScore = score + (isCorrect ? 1 : 0);
                const scorePercent = Math.round((finalScore / totalQuestions) * 100);

                let scoreEmotion = 'happy';
                if (scorePercent < 40)      scoreEmotion = 'sad';
                else if (scorePercent < 80) scoreEmotion = 'confused';

                let result = {};
                try {
                    result = await submitQuizResult(
                        id || `subject-${subjectName}`,
                        lessonData.title || lessonData.topic,
                        scorePercent,
                        finalScore,
                        totalQuestions,
                        lessonData.subject,
                        scoreEmotion,
                        newResponseTimes,
                        null,
                        {
                            retries:         newRetries,
                            videoCompletion: videoCompletion,
                            confusedRatio:   liveConfusedRatio,
                            streakWrong:     newStreakWrong,
                            streakCorrect:   newStreakCorrect
                        }
                    ) || {};
                } catch (err) {
                    console.error('Quiz submission error (navigating anyway):', err);
                }

                navigate('/result', {
                    state: {
                        score:        finalScore,
                        total:        totalQuestions,
                        scorePercent,
                        lessonTitle:  lessonData.title || lessonData.topic,
                        lessonId:     id || `subject-${subjectName}`,
                        subject:      lessonData.subject,
                        responseTimes: newResponseTimes,
                        questions:    quizData.questions,
                        userAnswers:  newAnswers,
                        passed:       scorePercent >= 50,
                        starsEarned:  scorePercent >= 80 ? 3 : scorePercent >= 50 ? 2 : 1,
                        ...result
                    }
                });
            }
        }, 1500);
    };

    const question = quizData?.questions[current];
    const totalQuestions = quizData?.questions?.length || 0;

    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        return (
            <div className="min-h-screen bg-pastel-gradient flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-coral border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-bold">Preparing your quiz aventura... 🚀</p>
                {!quizData && <p className="text-xs text-gray-400 mt-2">Loading data...</p>}
                {quizData && (!quizData.questions || quizData.questions.length === 0) && (
                    <div className="mt-4 text-center">
                        <p className="text-sm font-bold text-red-500 mb-2">Oops! No questions were found for this topic.</p>
                        <CartoonButton variant="primary" onClick={() => window.location.reload()} className="text-xs px-4 py-2">
                            Try Again
                        </CartoonButton>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pastel-gradient flex flex-col pt-8 pb-12 px-6 relative overflow-hidden text-center">
            {/* Decorative Blobs */}
            <div className="deco-blob deco-blob-pink w-[300px] h-[300px] -top-20 -right-20 opacity-30" />
            <div className="deco-blob deco-blob-purple w-[200px] h-[200px] bottom-0 -left-10 opacity-20" />

            {/* Floating Decorations */}
            <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="fixed top-24 right-12 text-4xl opacity-50 pointer-events-none"
            >☁️</motion.div>
            <motion.div
                animate={{ y: [0, -8, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                className="fixed bottom-40 left-12 text-3xl opacity-60 pointer-events-none"
            >⭐</motion.div>

            <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
                <div className="flex-1 w-full relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            to={id ? `/lesson/${id}` : `/subject/${subjectName}`}
                            className="w-12 h-12 glass-card flex items-center justify-center text-gray-500 hover:text-coral transition-colors"
                        >
                            <FaChevronLeft />
                        </Link>

                        <div className="glass-card px-6 py-3 flex items-center gap-3">
                            <span className="text-2xl">📝</span>
                            <div>
                                <span className="font-bold text-gray-700 block">{lessonData?.title || 'Quiz'}</span>
                                <span className="text-xs text-gray-400">Level: {quizData.level}</span>
                            </div>
                        </div>

                        <div className="glass-card px-4 py-2 flex items-center gap-2">
                            <span className="text-coral font-bold">{current + 1}</span>
                            <span className="text-gray-400">/{totalQuestions}</span>
                            {liveStreakCorrect >= 2 && (
                                <span className="flex items-center gap-1 text-orange-500 font-black text-xs ml-2">
                                    <FaFire className="animate-pulse" />{liveStreakCorrect}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress Stars */}
                    <div className="flex justify-center gap-2 mb-8">
                        {quizData.questions.map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.8 }}
                                animate={{
                                    scale: i === current ? 1.2 : 1,
                                    backgroundColor: i < current
                                        ? (answers[i]?.correct ? '#4ade80' : '#f87171')
                                        : i === current
                                            ? '#FF7B6B'
                                            : '#e5e5e5'
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-300`}
                            >
                                {(i < current || (i === current && feedback !== null)) ? (
                                    (answers[i]?.correct ?? (i === current && feedback === 'correct')) ? <FaCheck size={10} /> : <FaTimes size={10} />
                                ) : i + 1}
                            </motion.div>
                        ))}
                    </div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="glass-card p-8"
                        >
                            {/* Question */}
                            <div className="text-center mb-8">
                                {question.emoji && (
                                    <motion.span
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="text-6xl block mb-4"
                                    >
                                        {question.emoji}
                                    </motion.span>
                                )}
                                <h2 className="text-2xl font-bold text-gray-700">
                                    {question?.question || question?.text || "Unknown Question"}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-2 gap-4">
                                {question?.options?.map((option, index) => {
                                    let bgColor = 'bg-white/80 hover:bg-white border-gray-100 hover:border-gray-200';
                                    let textColor = 'text-gray-700';

                                    if (feedback && index === question.correctAnswer) {
                                        bgColor = 'bg-green-100 border-green-400';
                                        textColor = 'text-green-700';
                                    } else if (feedback === 'wrong' && index === selected) {
                                        bgColor = 'bg-red-100 border-red-400';
                                        textColor = 'text-red-700';
                                    } else if (selected === index && !feedback) {
                                        bgColor = 'bg-coral/10 border-coral';
                                    }

                                    return (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: feedback ? 1 : 1.03 }}
                                            whileTap={{ scale: feedback ? 1 : 0.98 }}
                                            onClick={() => handleAnswer(index)}
                                            disabled={feedback !== null}
                                            className={`p-5 rounded-2xl border-2 font-bold text-lg transition-all ${bgColor} ${textColor}`}
                                        >
                                            <span className="text-gray-400 mr-2 font-normal">{String.fromCharCode(65 + index)}.</span>
                                            {option}
                                            {feedback && index === question.correctAnswer && (
                                                <FaCheck className="inline ml-2 text-green-500" />
                                            )}
                                            {feedback === 'wrong' && index === selected && (
                                                <FaTimes className="inline ml-2 text-red-500" />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Feedback Message */}
                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        className={`mt-6 p-4 rounded-2xl text-center font-bold ${feedback === 'correct'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {feedback === 'correct' ? (
                                            <div className="flex items-center justify-center gap-4">
                                                <Mascot type="lion" size="sm" />
                                                <span>🎉 Great job! That's correct!</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-4">
                                                <Mascot type="owl" size="sm" />
                                                <span>😅 Oops! The correct answer was: {question?.options?.[question.correctAnswer] || "N/A"}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </AnimatePresence>

                    {/* Score Preview */}
                    <div className="text-center mt-8">
                        <span className="text-gray-500">Current Score: </span>
                        <span className="text-2xl font-bold text-yellow-500">{score} / {totalQuestions} ⭐</span>
                    </div>

                    {/* Progress info */}
                    <div className="text-center mt-4">
                        <span className="text-sm text-gray-400">
                            Question {current + 1} of {totalQuestions} • {lessonData?.subject}
                        </span>
                    </div>
                </div>
            </div>

            {/* Adaptive Brain Signals */}
            <EmotionTracker 
                isActive={current < totalQuestions} 
                onConfusedRatioUpdate={(ratio) => setLiveConfusedRatio(ratio)}
            />
        </div>
    );
};

export default Quiz;
