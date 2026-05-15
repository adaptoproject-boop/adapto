import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { mockUser, mockLessonResults, decideNextLevel, decideContentStyle, calculateStars } from '../mockData';
import { useAuth } from './AuthContext';
import { translations } from '../translations';

const LearningContext = createContext({});

export const LearningProvider = ({ children }) => {
    const { userInfo, logout } = useAuth();

    // Get the storage key for the current user
    const getStorageKey = (uid) => `learningProgress_${uid || 'guest'}`;
    const getVideoKey = (uid) => `videoProgress_${uid || 'guest'}`;

    // Initialize state - try to load from storage if we have a user, else default
    const [userProgress, setUserProgress] = useState(() => {
        // We can't know the user ID yet on first render if it comes from AuthContext async
        // So we default to a temporary state, and useEffect will fetch the real one
        return {
            userId: mockUser._id,
            name: mockUser.name,
            totalStars: mockUser.stars || 0,
            points: mockUser.points || 0,
            badges: mockUser.badges || [],
            currentLevels: { ...mockUser.currentLevels },
            completedLessons: [],
            lessonResults: [...mockLessonResults],
            currentEmotion: "happy",
            language: "en"
        };
    });

    const [videoProgress, setVideoProgress] = useState({});
    const [teacherMaterials, setTeacherMaterials] = useState([]);
    const [teacherQuizzes, setTeacherQuizzes] = useState([]);

    const fetchServerProgress = async () => {
        if (!userInfo) return;

        const storageKey = getStorageKey(userInfo._id || userInfo.id);
        const token = userInfo.token || (JSON.parse(localStorage.getItem('userInfo') || '{}').token);

        try {
            if (token) {
                const response = await axios.get('http://localhost:5612/api/users/my-progress', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data) {
                    console.log("Synced progress from server:", response.data);
                    setUserProgress(prev => ({
                        ...prev,
                        ...response.data,
                        userId: userInfo._id || userInfo.id,
                        name: userInfo.name
                    }));
                    localStorage.setItem(storageKey, JSON.stringify(response.data));
                    
                    const vKey = getVideoKey(userInfo._id || userInfo.id);
                    const savedVideos = localStorage.getItem(vKey);
                    setVideoProgress(savedVideos ? JSON.parse(savedVideos) : {});
                    return;
                }
            }
        } catch (error) {
            console.warn("Could not fetch server progress:", error);
        }
    };

    // Sync Authenticated User to Learning Progress
    useEffect(() => {
        fetchServerProgress();
        fetchTeacherMaterials();
        fetchTeacherQuizzes();
    }, [userInfo]);

    // Save to localStorage on change (using current userId)
    useEffect(() => {
        if (userProgress.userId) {
            const key = getStorageKey(userProgress.userId);
            localStorage.setItem(key, JSON.stringify(userProgress));
        }
    }, [userProgress]);

    useEffect(() => {
        if (userProgress.userId) {
            const vKey = getVideoKey(userProgress.userId);
            localStorage.setItem(vKey, JSON.stringify(videoProgress));
        }
    }, [videoProgress]);

    // Mark video as complete
    const markVideoComplete = (lessonId, videoLevel, contentStyle) => {
        setVideoProgress(prev => ({
            ...prev,
            [lessonId]: {
                completed: true,
                timestamp: new Date().toISOString(),
                videoLevel: videoLevel || getCurrentLevel(getSubjectForLesson(lessonId)),
                contentStyle: contentStyle || decideContentStyle(userProgress.currentEmotion)
            }
        }));
    };

    // Helper to get subject from lessonId
    const getSubjectForLesson = (lessonId) => {
        // 1. Check Mock Lessons first
        const mockSubjects = {
            "1": "Alphabets", "2": "Numbers", "3": "Colors",
            "4": "Shapes", "5": "Plants", "6": "Flowers",
            "L1": "Alphabets", "G1": "General Awareness"
        };
        if (mockSubjects[lessonId]) return mockSubjects[lessonId];

        // 2. Check Teacher Added Materials
        const material = teacherMaterials.find(m => m._id === lessonId);
        if (material) return material.subject;

        return "Alphabets";
    };

    // Check if video is complete
    const isVideoComplete = (lessonId) => {
        return videoProgress[lessonId]?.completed || false;
    };

    // Get video progress details
    const getVideoProgress = (lessonId) => {
        return videoProgress[lessonId] || { completed: false, videoLevel: 'easy', contentStyle: 'normal' };
    };

    // Submit quiz and update levels
    const fetchTeacherMaterials = async () => {
        try {
            // No auth required for GET /study-materials in current routes
            const response = await axios.get('http://localhost:5612/api/teacher/study-materials');
            if (response.data && response.data.materials) {
                setTeacherMaterials(response.data.materials);
            }
        } catch (error) {
            console.error("Failed to fetch teacher materials:", error);
        }
    };

    const fetchTeacherQuizzes = async () => {
        try {
            const response = await axios.get('http://localhost:5612/api/teacher/quizzes');
            if (response.data && response.data.quizzes) {
                setTeacherQuizzes(response.data.quizzes);
            }
        } catch (error) {
            console.error("Failed to fetch teacher quizzes:", error);
        }
    };

    const submitQuizResult = async (
        lessonId, lessonTitle, score, correctAnswers, totalQuestions,
        subject, emotion, responseTimes = [], lessonIdFromDataset = null,
        { retries = 0, videoCompletion = 1.0, confusedRatio = 0.0, streakWrong: swIn = null, streakCorrect: scIn = null } = {}
    ) => {
        const previousLevel = userProgress.currentLevels[subject] || 'easy';
        let nextLevel = decideNextLevel(score); // Default local logic
        const starsEarned = calculateStars(score);
        const passed = score >= 50;
        const videoData = getVideoProgress(lessonId);
        let thisNextTopic = null;
        let thisNextLesson = null;
        let nextAction = score >= 80 ? 'NEXT_TOPIC' : (score >= 50 ? 'SIMILAR' : 'REVISION');
        let thisEncouragement;
        let thisLevelUp;
        let thisNextDifficulty;

        // Streak tracking — prefer values passed directly from Quiz.jsx live tracking
        const streakKey = `streaks_${userProgress.userId}_${subject}`;
        const savedStreaks = JSON.parse(localStorage.getItem(streakKey) || '{"wrong":0,"correct":0}');
        let streakWrong   = swIn !== null ? swIn  : (score < 50  ? savedStreaks.wrong  + 1 : 0);
        let streakCorrect = scIn !== null ? scIn  : (score >= 80 ? savedStreaks.correct + 1 : 0);
        localStorage.setItem(streakKey, JSON.stringify({ wrong: streakWrong, correct: streakCorrect }));

        // Call Backend Orchestrator
        try {
            // Persist Quiz Result to DB
            let token = userInfo?.token;
            if (!token) {
                const stored = localStorage.getItem('userInfo');
                if (stored) token = JSON.parse(stored).token;
            }

            if (token) {
                await axios.post('http://localhost:5612/api/quiz/submit', {
                    lessonId:        lessonId,
                    lessonTitle:     lessonTitle,
                    subject:         subject,
                    score:           score,
                    totalQuestions:  totalQuestions,
                    level:           previousLevel,
                    emotion:         emotion || userProgress.currentEmotion,
                    responseTimes:   responseTimes,
                    // Full ML signal payload
                    streakWrong:     streakWrong,
                    streakCorrect:   streakCorrect,
                    retries:         retries,
                    videoCompletion: videoCompletion,
                    confusedRatio:   confusedRatio
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // Orchestrator: full ML signal payload → returns next_difficulty, next_lesson, encouragement, level_up
            const response = await axios.post('http://localhost:5612/api/learning/next-step', {
                user_id:          userProgress.userId,
                subject:          subject,
                topic:            lessonTitle,
                lesson_id:        lessonIdFromDataset || '',
                quiz_score:       score,
                current_level:    previousLevel,
                emotion:          emotion || userProgress.currentEmotion,
                response_times:   responseTimes,
                streak_wrong:     streakWrong,
                streak_correct:   streakCorrect,
                retries:          retries,
                video_completion: videoCompletion,
                confused_ratio:   confusedRatio
            });

            if (response.data && response.data.next_level) {
                console.log('Orchestrator decision:', response.data);
                nextLevel      = response.data.next_level.toLowerCase();
                thisNextTopic  = response.data.next_topic;
                thisNextLesson = response.data.next_lesson || null;
                nextAction     = response.data.next_action || nextAction;
                // Expose adaptive signals for Result.jsx
                thisEncouragement = !!response.data.encouragement;
                thisLevelUp       = !!response.data.level_up;
                thisNextDifficulty = response.data.next_difficulty || 'same';
            }

            // ── FALLBACK LOGIC TO BREAK LOOPS ──
            // If we don't have a specific next lesson from backend, find the next one in sequence
            if (!thisNextLesson && score >= 70) {
                const subjectLessons = teacherMaterials.filter(m => m.subject === subject);
                if (subjectLessons.length > 0) {
                    const currentIndex = subjectLessons.findIndex(m => m._id === lessonId || m.id === lessonId);
                    if (currentIndex !== -1 && currentIndex + 1 < subjectLessons.length) {
                        thisNextLesson = subjectLessons[currentIndex + 1];
                        nextAction = 'NEXT_TOPIC';
                    }
                }
            }
        } catch (error) {
            // Silent fail — never show alert to kids; local progress still updates
            console.warn('Orchestrator/Persistence sync failed (local progress preserved):', error?.message);
            if (error?.response?.status === 401) {
                logout();
                return;
            }
        }

        // Adaptive signal defaults (set inside try if orchestrator succeeded)
        if (thisEncouragement === undefined) thisEncouragement = score < 50;
        if (thisLevelUp === undefined) thisLevelUp = score >= 80;
        if (thisNextDifficulty === undefined) thisNextDifficulty = score < 50 ? 'easy' : score >= 80 ? 'hard' : 'same';

        const newResult = {
            id: `result_${Date.now()}`,
            lessonId,
            lessonTitle,
            userId: userProgress.userId,
            videoSource: "YouTube",
            videoLevel: videoData.videoLevel || previousLevel,
            contentStyle: videoData.contentStyle || "normal",
            videoCompleted: true,
            quizScore: score,
            correctAnswers,
            totalQuestions,
            emotion: emotion || userProgress.currentEmotion,
            previousLevel,
            nextLevel,
            timestamp: new Date().toISOString(),
            passed,
            starsEarned
        };

        setUserProgress(prev => ({
            ...prev,
            totalStars: prev.totalStars + starsEarned,
            currentLevels: {
                ...prev.currentLevels,
                [subject]: nextLevel
            },
            completedLessons: [...prev.completedLessons, lessonId],
            lessonResults: [...prev.lessonResults, newResult]
        }));

        // Trigger a fresh fetch from server to ensure sync
        setTimeout(fetchServerProgress, 500);

        return {
            nextLevel,
            nextTopic:      thisNextTopic || lessonTitle,
            nextLesson:     thisNextLesson,
            nextAction,
            starsEarned,
            passed,
            newResult,
            encouragement:  thisEncouragement,
            levelUp:        thisLevelUp,
            nextDifficulty: thisNextDifficulty,
            streakWrong,
            streakCorrect
        };
    };

    // New: Generate AI Quiz from Backend
    const generateAiQuiz = async (subject, topic, difficulty) => {
        try {
            let token = userInfo?.token;
            if (!token) {
                const stored = localStorage.getItem('userInfo');
                if (stored) token = JSON.parse(stored).token;
            }

            const response = await axios.post('http://localhost:5612/api/quiz/generate', {
                subject,
                topic,
                difficulty: difficulty || getCurrentLevel(subject)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.success) {
                return {
                    lessonTitle: topic,
                    subject: subject,
                    level: difficulty || "Dynamic",
                    questions: response.data.questions
                };
            }
            return null;
        } catch (error) {
            console.error("AI Quiz Generation Failed:", error);
            return null;
        }
    };

    // Get current level for a subject
    const getCurrentLevel = (subject) => {
        return userProgress.currentLevels?.[subject] || "easy";
    };

    // Get content style based on current emotion
    const getContentStyle = () => {
        return decideContentStyle(userProgress.currentEmotion);
    };

    // Get lesson results for parent dashboard
    const getLessonResults = () => {
        return userProgress.lessonResults || [];
    };

    // Update emotion
    const setEmotion = (emotion) => {
        setUserProgress(prev => ({
            ...prev,
            currentEmotion: emotion
        }));
    };

    // Set Language
    const setLanguage = (lang) => {
        setUserProgress(prev => ({
            ...prev,
            language: lang
        }));
    };
    
    // Log emotion reading to backend (called every 5s)
    const logEmotion = async (emotion) => {
        if (!userProgress.userId) return;
        try {
            const response = await axios.post('http://localhost:5612/api/emotion/log', {
                kid_id: userProgress.userId,
                session_id: `session_${userProgress.userId}_${new Date().toDateString()}`,
                emotion: emotion || 'engaged',
                timestamp: new Date().toISOString()
            });
            if (response.data && response.data.confused_ratio !== undefined) {
                return response.data.confused_ratio;
            }
        } catch (error) {
            console.warn("Emotion log failed:", error.message);
        }
        return 0;
    };

    // Log video interaction event (play/pause/replay)
    const logVideoEvent = async (event, details = {}) => {
        try {
            await axios.post('http://localhost:5612/api/learning/video-event', {
                event,
                session_id: `session_${userProgress.userId}_${new Date().toDateString()}`,
                ...details
            });
        } catch (error) {
            console.warn("Video event log failed:", error.message);
        }
    };

    // Translation Helper
    const t = (key) => {
        const lang = userProgress.language || 'en';
        return translations[lang]?.[key] || translations['en'][key] || key;
    };

    // Reset progress (for testing)
    const resetProgress = () => {
        const key = getStorageKey(userProgress.userId);
        const vKey = getVideoKey(userProgress.userId);

        localStorage.removeItem(key);
        localStorage.removeItem(vKey);

        const baseUser = userInfo ? { _id: userInfo._id, name: userInfo.name } : mockUser;

        setUserProgress({
            userId: baseUser._id,
            name: baseUser.name,
            totalStars: 0,
            currentLevels: {
                "Alphabets": "easy",
                "Numbers": "easy",
                "Colors": "easy",
                "Shapes": "easy",
                "Plants": "easy",
                "Flowers": "easy"
            },
            completedLessons: [],
            lessonResults: [],
            currentEmotion: "happy",
            language: "en"
        });
        setVideoProgress({});
    };

    return (
        <LearningContext.Provider value={{
            userProgress,
            videoProgress,
            markVideoComplete,
            isVideoComplete,
            getVideoProgress,
            submitQuizResult,
            getCurrentLevel,
            getContentStyle,
            getLessonResults,
            setEmotion,
            setLanguage,
            t,
            resetProgress,
            generateAiQuiz,
            logEmotion,
            logVideoEvent,
            teacherMaterials,
            teacherQuizzes
        }}>
            {children}
        </LearningContext.Provider>
    );
};

export const useLearning = () => useContext(LearningContext);
