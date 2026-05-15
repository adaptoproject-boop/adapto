// ==========================================
// MOCK DATA - Adaptive E-Learning System
// YouTube Video Integration
// ==========================================

// Lessons with YouTube videos categorized by difficulty and content style
// Lessons with categorized by subject. 
// YouTube URLs removed as we prioritize AI Video Generation.
export const mockLessons = [
    // --- 1) LANGUAGE BASICS ---
    {
        _id: "L1",
        title: "Phonics (Letter Sounds)",
        subject: "Language Basics",
        emoji: "🗣️",
        color: "bg-blue-100",
        textColor: "text-blue-600",
        progress: 0,
        description: "Learn how letters make sounds and start reading!"
    },
    {
        _id: "L2",
        title: "Simple Words (cat, bat, ball)",
        subject: "Language Basics",
        emoji: "🐱",
        color: "bg-blue-50",
        textColor: "text-blue-500",
        progress: 0,
        description: "Practice short words that are easy and fun."
    },
    {
        _id: "L3",
        title: "Rhymes & Storytelling",
        subject: "Language Basics",
        emoji: "🎭",
        color: "bg-blue-100",
        textColor: "text-blue-600",
        progress: 0,
        description: "Listen to magical stories and sing fun rhymes!"
    },

    // --- 2) NUMBERS & MATH ---
    {
        _id: "N1",
        title: "Number Recognition",
        subject: "Numbers & Math",
        emoji: "1️⃣",
        color: "bg-yellow-100",
        textColor: "text-yellow-600",
        progress: 0,
        description: "Recognize numbers 1 to 20 with colorful objects."
    },
    {
        _id: "N2",
        title: "Basic Addition & Subtraction",
        subject: "Numbers & Math",
        emoji: "➕",
        color: "bg-yellow-50",
        textColor: "text-yellow-500",
        progress: 0,
        description: "Learn to add and take away things easily."
    },
    {
        _id: "N3",
        title: "Bigger vs Smaller",
        subject: "Numbers & Math",
        emoji: "⚖️",
        color: "bg-yellow-100",
        textColor: "text-yellow-600",
        progress: 0,
        description: "Compare sizes and learn which is more or less."
    },

    // --- 3) LOGICAL THINKING ---
    {
        _id: "LO1",
        title: "Patterns",
        subject: "Logical Thinking",
        emoji: "🧬",
        color: "bg-purple-100",
        textColor: "text-purple-600",
        progress: 0,
        description: "Find the sequence and solve fun color patterns."
    },
    {
        _id: "LO2",
        title: "Match the Following",
        subject: "Logical Thinking",
        emoji: "🔗",
        color: "bg-purple-50",
        textColor: "text-purple-500",
        progress: 0,
        description: "Connect things that belong together!"
    },
    {
        _id: "LO3",
        title: "Find the Odd One Out",
        subject: "Logical Thinking",
        emoji: "🧐",
        color: "bg-purple-100",
        textColor: "text-purple-600",
        progress: 0,
        description: "Spot the difference in a group of objects."
    },

    // --- 4) ENVIRONMENT & NATURE ---
    {
        _id: "E1",
        title: "Animals & Their Sounds",
        subject: "Environment & Nature",
        emoji: "🦁",
        color: "bg-green-100",
        textColor: "text-green-600",
        progress: 0,
        description: "What does the cow say? Let's meet animal friends!"
    },
    {
        _id: "E2",
        title: "Fruits & Vegetables",
        subject: "Environment & Nature",
        emoji: "🍎",
        color: "bg-green-50",
        textColor: "text-green-500",
        progress: 0,
        description: "Learn about healthy food from mother nature."
    },
    {
        _id: "E3",
        title: "Seasons & Weather",
        subject: "Environment & Nature",
        emoji: "☀️",
        color: "bg-green-100",
        textColor: "text-green-600",
        progress: 0,
        description: "Sunny, Rainy or Snowy? Explore all seasons!"
    },

    // --- 5) SHAPES & COLORS ---
    {
        _id: "S1",
        title: "Basic Shapes",
        subject: "Shapes & Colors",
        emoji: "⭕",
        color: "bg-pink-100",
        textColor: "text-pink-600",
        progress: 0,
        description: "Learn about Circles, Squares and Triangles."
    },
    {
        _id: "S2",
        title: "Advanced Shapes",
        subject: "Shapes & Colors",
        emoji: "⭐",
        color: "bg-pink-50",
        textColor: "text-pink-500",
        progress: 0,
        description: "Discover Stars, Ovals and Rectangles!"
    },
    {
        _id: "S3",
        title: "Colors Recognition",
        subject: "Shapes & Colors",
        emoji: "🌈",
        color: "bg-pink-100",
        textColor: "text-pink-600",
        progress: 0,
        description: "Explore the beautiful colors of the rainbow."
    },

    // --- 6) GENERAL AWARENESS ---
    {
        _id: "G1",
        title: "Body Parts",
        subject: "General Awareness",
        emoji: "👀",
        color: "bg-orange-100",
        textColor: "text-orange-600",
        progress: 0,
        description: "Know your eyes, ears, hands and feet!"
    },
    {
        _id: "G2",
        title: "Family Members",
        subject: "General Awareness",
        emoji: "👨‍👩‍👧",
        color: "bg-orange-50",
        textColor: "text-orange-500",
        progress: 0,
        description: "Let's meet Daddy, Mommy, Brother and Sister."
    },
    {
        _id: "G3",
        title: "Good Habits",
        subject: "General Awareness",
        emoji: "✨",
        color: "bg-orange-100",
        textColor: "text-orange-600",
        progress: 0,
        description: "Learn about hygiene, brushing and sharing."
    }
];


// Quiz questions per lesson
export const mockQuizzes = {
    "L1": {
        lessonId: "L1",
        lessonTitle: "Phonics (Letter Sounds)",
        subject: "Language Basics",
        level: "easy",
        questions: [
            { id: 1, question: "Which letter makes the 'ah' sound? 🍎", options: ["A", "B", "C", "D"], correctAnswer: 0, emoji: "🍎" },
            { id: 2, question: "What is the sound of letter 'B'? ⚽", options: ["Buh", "Ah", "Cuh", "Duh"], correctAnswer: 0, emoji: "⚽" },
            { id: 3, question: "Cat starts with which sound? 🐱", options: ["Cuh", "Ah", "Tuh", "Suh"], correctAnswer: 0, emoji: "🐱" },
            { id: 4, question: "Dog starts with which sound? 🐶", options: ["Duh", "Ah", "Guh", "Ouh"], correctAnswer: 0, emoji: "🐶" },
            { id: 5, question: "Elephant starts with? 🐘", options: ["Eh", "Ah", "Cuh", "Duh"], correctAnswer: 0, emoji: "🐘" }
        ]
    },
    "N1": {
        lessonId: "N1",
        lessonTitle: "Number Recognition",
        subject: "Numbers & Math",
        level: "easy",
        questions: [
            { id: 1, question: "How many apples? 🍎🍎🍎", options: ["2", "3", "4", "5"], correctAnswer: 1 },
            { id: 2, question: "Which number is this? 5️⃣", options: ["4", "5", "6", "7"], correctAnswer: 1 },
            { id: 3, question: "What comes after 7?", options: ["6", "9", "8", "10"], correctAnswer: 2 },
            { id: 4, question: "Count: 🐘🐘🐘🐘🐘", options: ["3", "4", "5", "6"], correctAnswer: 2 },
            { id: 5, question: "Which number comes first?", options: ["4", "2", "3", "5"], correctAnswer: 1 }
        ]
    },
    "G1": {
        lessonId: "G1",
        lessonTitle: "Body Parts",
        subject: "General Awareness",
        level: "easy",
        questions: [
            { id: 1, question: "What do we use to see? 👀", options: ["Nose", "Eyes", "Ears", "Hands"], correctAnswer: 1, emoji: "👀" },
            { id: 2, question: "What do we use to hear sounds? 👂", options: ["Eyes", "Nose", "Ears", "Mouth"], correctAnswer: 2, emoji: "👂" },
            { id: 3, question: "We walk with our...? 🦶", options: ["Hands", "Feet", "Arms", "Head"], correctAnswer: 1, emoji: "🦶" },
            { id: 4, question: "How many fingers do we have on one hand? 🖐️", options: ["4", "5", "6", "10"], correctAnswer: 1, emoji: "🖐️" },
            { id: 5, question: "Where is your nose? 👃", options: ["On your head", "On your face", "On your hand", "On your foot"], correctAnswer: 1, emoji: "👃" }
        ]
    },
    // Adding fallbacks for others
    "E1": {
        lessonId: "E1",
        lessonTitle: "Animals & Their Sounds",
        subject: "Environment & Nature",
        level: "easy",
        questions: [
            { id: 1, question: "What sound does a Lion make? 🦁", options: ["Meow", "Roar", "Moo", "Bark"], correctAnswer: 1 },
            { id: 2, question: "Which animal says 'Moo'? 🐄", options: ["Dog", "Cat", "Cow", "Sheep"], correctAnswer: 2 },
            { id: 3, question: "A monkey loves to eat? 🐒", options: ["Fish", "Meat", "Banana", "Grass"], correctAnswer: 2 },
            { id: 4, question: "Who has a long trunk? 🐘", options: ["Tiger", "Lion", "Elephant", "Giraffe"], correctAnswer: 2 },
            { id: 5, question: "What sound does a duck make? 🦆", options: ["Quack", "Tweet", "Moo", "Oink"], correctAnswer: 0 }
        ]
    },
    "S1": {
        lessonId: "S1",
        lessonTitle: "Basic Shapes",
        subject: "Shapes & Colors",
        level: "easy",
        questions: [
            { id: 1, question: "Which shape has 3 sides? 🔺", options: ["Square", "Circle", "Triangle", "Rectangle"], correctAnswer: 2 },
            { id: 2, question: "A ball is shaped like a? ⚽", options: ["Square", "Triangle", "Circle", "Oval"], correctAnswer: 2 },
            { id: 3, question: "How many sides does a square have? 🟦", options: ["3", "4", "5", "6"], correctAnswer: 1 },
            { id: 4, question: "What shape is a window? 🪟", options: ["Circle", "Triangle", "Square", "Star"], correctAnswer: 2 },
            { id: 5, question: "A sun is shaped like a? ☀️", options: ["Triangle", "Circle", "Oval", "Square"], correctAnswer: 1 }
        ]
    },
    "LO1": {
        lessonId: "LO1",
        lessonTitle: "Patterns",
        subject: "Logical Thinking",
        level: "easy",
        questions: [
            { id: 1, question: "Red, Blue, Red, ...? 🔴🔵🔴", options: ["Yellow", "Blue", "Green", "White"], correctAnswer: 1 },
            { id: 2, question: "1, 2, 1, 2, ...?", options: ["3", "1", "4", "5"], correctAnswer: 1 },
            { id: 3, question: "Apple, Banana, Apple, ...? 🍎🍌🍎", options: ["Orange", "Banana", "Grape", "Apple"], correctAnswer: 1 },
            { id: 4, question: "Up, Down, Up, ...? ⬆️⬇️⬆️", options: ["Left", "Right", "Down", "Up"], correctAnswer: 2 },
            { id: 5, question: "Big, Small, Big, ...?", options: ["Small", "Tiny", "Big", "Huge"], correctAnswer: 0 }
        ]
    }
};

// User data with learning state
export const mockUser = {
    _id: "user123",
    name: "Leo",
    level: "Explorer",
    points: 1250,
    stars: 14,
    avatar: "🦁",
    currentLevels: {
        "Alphabets": "easy",
        "Numbers": "easy",
        "Colors": "easy",
        "Shapes": "easy",
        "Plants": "easy",
        "Flowers": "easy"
    },
    emotion: "happy"
};

// Lesson results history
export const mockLessonResults = [
    {
        id: "result1",
        lessonId: "1",
        lessonTitle: "A for Apple",
        subject: "Alphabets",
        userId: "user123",
        videoSource: "YouTube",
        videoLevel: "easy",
        contentStyle: "normal",
        videoCompleted: true,
        quizScore: 80,
        correctAnswers: 4,
        totalQuestions: 5,
        emotion: "happy",
        previousLevel: "easy",
        nextLevel: "medium",
        timestamp: "2025-01-15T10:30:00Z",
        passed: true,
        starsEarned: 4
    }
];

// ==========================================
// ADAPTIVE LOGIC FUNCTIONS
// ==========================================

// Decide video difficulty based on quiz score
export const decideNextLevel = (score) => {
    if (score > 80) return "hard";
    if (score >= 50) return "medium";
    return "easy";
};

// Decide content style based on detected emotion
export const decideContentStyle = (emotion) => {
    if (emotion === "bored" || emotion === "distracted") return "fun";
    if (emotion === "confused" || emotion === "frustrated") return "easy_explanation";
    return "normal";
};

// Calculate stars earned from score
export const calculateStars = (score) => {
    if (score >= 90) return 5;
    if (score >= 70) return 4;
    if (score >= 50) return 3;
    if (score >= 30) return 2;
    return 1;
};

// Get video URL for lesson based on level and content style
export const getVideoUrl = (lesson, level = "easy", contentStyle = "normal") => {
    if (!lesson || !lesson.videos) {
        console.warn("No lesson or videos found", lesson);
        return null;
    }

    // Normalize level to lowercase
    const normalizedLevel = level.toLowerCase();

    // Get videos for the specified level, fallback to easy
    const levelVideos = lesson.videos[normalizedLevel] || lesson.videos.easy;

    if (!levelVideos) {
        console.warn("No videos found for level:", normalizedLevel);
        return null;
    }

    // Get video URL for content style, fallback to normal
    const videoUrl = levelVideos[contentStyle] || levelVideos.normal;

    if (!videoUrl) {
        console.warn("No video URL found for:", { level: normalizedLevel, contentStyle });
    }

    return videoUrl;
};

// Content style display labels
export const contentStyleLabels = {
    normal: { emoji: "📹", label: "Standard" },
    fun: { emoji: "🎉", label: "Fun & Engaging" },
    easy_explanation: { emoji: "🐢", label: "Easy Explanation" }
};

// Emotion options for prototype selection
export const emotionOptions = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "focused", emoji: "🧐", label: "Focused" },
    { value: "bored", emoji: "😴", label: "Bored" },
    { value: "confused", emoji: "😕", label: "Confused" },
    { value: "frustrated", emoji: "😤", label: "Frustrated" }
];
