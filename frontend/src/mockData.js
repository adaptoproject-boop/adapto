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
    // =============================================
    // LANGUAGE BASICS (L1, L2, L3)
    // =============================================
    "L1": {
        lessonId: "L1",
        lessonTitle: "Phonics (Letter Sounds)",
        subject: "Language Basics",
        level: "easy",
        questions: [
            { id: 1, question: "Which letter makes the 'ah' sound? 🍎", options: ["B", "A", "D", "C"], correctAnswer: 1, emoji: "🍎" },
            { id: 2, question: "What sound does the letter 'B' make? ⚽", options: ["Cuh", "Duh", "Buh", "Ah"], correctAnswer: 2, emoji: "⚽" },
            { id: 3, question: "'Cat' starts with which sound? 🐱", options: ["Tuh", "Suh", "Ah", "Cuh"], correctAnswer: 3, emoji: "🐱" },
            { id: 4, question: "'Dog' starts with which sound? 🐶", options: ["Guh", "Duh", "Ouh", "Ah"], correctAnswer: 1, emoji: "🐶" },
            { id: 5, question: "Which word starts with the 'Eh' sound? 🐘", options: ["Apple", "Banana", "Elephant", "Dog"], correctAnswer: 2, emoji: "🐘" }
        ]
    },
    "L2": {
        lessonId: "L2",
        lessonTitle: "Simple Words (cat, bat, ball)",
        subject: "Language Basics",
        level: "easy",
        questions: [
            { id: 1, question: "Which word rhymes with 'cat'? 🐱", options: ["Dog", "Bat", "Cup", "Sun"], correctAnswer: 1, emoji: "🐱" },
            { id: 2, question: "What does 'B-A-L-L' spell? ⚽", options: ["Bell", "Bull", "Ball", "Bill"], correctAnswer: 2, emoji: "⚽" },
            { id: 3, question: "Which is a real word?", options: ["Zat", "Mup", "Hat", "Bof"], correctAnswer: 2, emoji: "🎩" },
            { id: 4, question: "Fill in: C _ T 🐱", options: ["O", "A", "U", "I"], correctAnswer: 1, emoji: "🐱" },
            { id: 5, question: "Which word has 3 letters?", options: ["Ball", "Sun", "Elephant", "Apple"], correctAnswer: 1, emoji: "☀️" }
        ]
    },
    "L3": {
        lessonId: "L3",
        lessonTitle: "Rhymes & Storytelling",
        subject: "Language Basics",
        level: "easy",
        questions: [
            { id: 1, question: "Which word rhymes with 'star'? ⭐", options: ["Sun", "Moon", "Car", "Sky"], correctAnswer: 2, emoji: "⭐" },
            { id: 2, question: "'Twinkle Twinkle Little ___' ✨", options: ["Moon", "Sun", "Star", "Cloud"], correctAnswer: 2, emoji: "✨" },
            { id: 3, question: "Which two words rhyme? 🎵", options: ["Cat & Dog", "Hat & Bat", "Sun & Moon", "Ball & Star"], correctAnswer: 1, emoji: "🎵" },
            { id: 4, question: "'Jack and Jill went up the ___' ⛰️", options: ["Road", "Hill", "River", "Tree"], correctAnswer: 1, emoji: "⛰️" },
            { id: 5, question: "What rhymes with 'cake'? 🎂", options: ["Cup", "Plate", "Lake", "Pie"], correctAnswer: 2, emoji: "🎂" }
        ]
    },

    // =============================================
    // NUMBERS & MATH (N1, N2, N3)
    // =============================================
    "N1": {
        lessonId: "N1",
        lessonTitle: "Number Recognition",
        subject: "Numbers & Math",
        level: "easy",
        questions: [
            { id: 1, question: "How many apples? 🍎🍎🍎", options: ["2", "4", "3", "5"], correctAnswer: 2, emoji: "🍎" },
            { id: 2, question: "Which number is this? 5️⃣", options: ["4", "5", "6", "7"], correctAnswer: 1, emoji: "5️⃣" },
            { id: 3, question: "What comes after 7?", options: ["6", "9", "8", "10"], correctAnswer: 2, emoji: "🔢" },
            { id: 4, question: "Count the elephants: 🐘🐘🐘🐘", options: ["3", "5", "2", "4"], correctAnswer: 3, emoji: "🐘" },
            { id: 5, question: "Which is the smallest number?", options: ["5", "3", "1", "9"], correctAnswer: 2, emoji: "🔢" }
        ]
    },
    "N2": {
        lessonId: "N2",
        lessonTitle: "Basic Addition & Subtraction",
        subject: "Numbers & Math",
        level: "easy",
        questions: [
            { id: 1, question: "What is 1 + 1? ✌️", options: ["1", "3", "2", "4"], correctAnswer: 2, emoji: "✌️" },
            { id: 2, question: "What is 3 + 2? 🖐️", options: ["4", "5", "6", "3"], correctAnswer: 1, emoji: "🖐️" },
            { id: 3, question: "If you have 4 candies and eat 1, how many are left? 🍬", options: ["2", "4", "3", "5"], correctAnswer: 2, emoji: "🍬" },
            { id: 4, question: "What is 2 + 3? 🧮", options: ["6", "4", "3", "5"], correctAnswer: 3, emoji: "🧮" },
            { id: 5, question: "5 birds are sitting on a tree. 2 fly away. How many are left? 🐦", options: ["3", "2", "4", "1"], correctAnswer: 0, emoji: "🐦" }
        ]
    },
    "N3": {
        lessonId: "N3",
        lessonTitle: "Bigger vs Smaller",
        subject: "Numbers & Math",
        level: "easy",
        questions: [
            { id: 1, question: "Which number is bigger: 3 or 7? 📏", options: ["3", "They are equal", "7", "Neither"], correctAnswer: 2, emoji: "📏" },
            { id: 2, question: "Which animal is bigger? 🐘🐱", options: ["Cat", "Elephant", "Both same", "Neither"], correctAnswer: 1, emoji: "🐘" },
            { id: 3, question: "Which is smaller: 9 or 2? 🔢", options: ["9", "2", "Both same", "10"], correctAnswer: 1, emoji: "🔢" },
            { id: 4, question: "Put in order: 5, 1, 3. Which comes first?", options: ["5", "3", "1", "None"], correctAnswer: 2, emoji: "📊" },
            { id: 5, question: "Which group has MORE? 🍎🍎🍎 or 🍌🍌", options: ["Bananas", "They are equal", "Apples", "Neither"], correctAnswer: 2, emoji: "🍎" }
        ]
    },

    // =============================================
    // LOGICAL THINKING (LO1, LO2, LO3)
    // =============================================
    "LO1": {
        lessonId: "LO1",
        lessonTitle: "Patterns",
        subject: "Logical Thinking",
        level: "easy",
        questions: [
            { id: 1, question: "Red, Blue, Red, Blue, ...? 🔴🔵", options: ["Green", "Yellow", "Red", "White"], correctAnswer: 2, emoji: "🔴" },
            { id: 2, question: "1, 2, 1, 2, ...? What comes next?", options: ["3", "1", "4", "2"], correctAnswer: 1, emoji: "🔢" },
            { id: 3, question: "🍎🍌🍎🍌🍎 ... What comes next?", options: ["🍎", "🍇", "🍌", "🍊"], correctAnswer: 2, emoji: "🍌" },
            { id: 4, question: "⬆️⬇️⬆️⬇️ ... What comes next?", options: ["⬅️", "➡️", "⬆️", "⬇️"], correctAnswer: 2, emoji: "⬆️" },
            { id: 5, question: "Big, Small, Big, Small, ...?", options: ["Tiny", "Big", "Huge", "Medium"], correctAnswer: 1, emoji: "📐" }
        ]
    },
    "LO2": {
        lessonId: "LO2",
        lessonTitle: "Match the Following",
        subject: "Logical Thinking",
        level: "easy",
        questions: [
            { id: 1, question: "Which animal gives us milk? 🥛", options: ["Dog", "Lion", "Cow", "Cat"], correctAnswer: 2, emoji: "🥛" },
            { id: 2, question: "Match: Pen is used for ___", options: ["Eating", "Writing", "Running", "Sleeping"], correctAnswer: 1, emoji: "🖊️" },
            { id: 3, question: "Match: A fish lives in ___? 🐟", options: ["Tree", "Sky", "Land", "Water"], correctAnswer: 3, emoji: "🐟" },
            { id: 4, question: "Which goes with a Lock? 🔒", options: ["Pen", "Spoon", "Key", "Book"], correctAnswer: 2, emoji: "🔒" },
            { id: 5, question: "Rain comes from ___? 🌧️", options: ["Ground", "Trees", "Clouds", "Mountains"], correctAnswer: 2, emoji: "🌧️" }
        ]
    },
    "LO3": {
        lessonId: "LO3",
        lessonTitle: "Find the Odd One Out",
        subject: "Logical Thinking",
        level: "easy",
        questions: [
            { id: 1, question: "Which one is different? 🐱🐶🐠🐰", options: ["Cat", "Dog", "Fish", "Rabbit"], correctAnswer: 2, emoji: "🐠" },
            { id: 2, question: "Find the odd one: 🍎🍌🍇🚗", options: ["Apple", "Banana", "Grapes", "Car"], correctAnswer: 3, emoji: "🚗" },
            { id: 3, question: "Which does NOT fly? 🐦🦅🐢🦜", options: ["Bird", "Eagle", "Turtle", "Parrot"], correctAnswer: 2, emoji: "🐢" },
            { id: 4, question: "Odd one out: Red, Blue, Green, Pizza 🍕", options: ["Red", "Blue", "Green", "Pizza"], correctAnswer: 3, emoji: "🍕" },
            { id: 5, question: "Which is NOT a fruit? 🍎🥕🍌🍇", options: ["Apple", "Carrot", "Banana", "Grapes"], correctAnswer: 1, emoji: "🥕" }
        ]
    },

    // =============================================
    // ENVIRONMENT & NATURE (E1, E2, E3)
    // =============================================
    "E1": {
        lessonId: "E1",
        lessonTitle: "Animals & Their Sounds",
        subject: "Environment & Nature",
        level: "easy",
        questions: [
            { id: 1, question: "What sound does a Lion make? 🦁", options: ["Meow", "Bark", "Roar", "Moo"], correctAnswer: 2, emoji: "🦁" },
            { id: 2, question: "Which animal says 'Moo'? 🐄", options: ["Dog", "Cow", "Cat", "Sheep"], correctAnswer: 1, emoji: "🐄" },
            { id: 3, question: "A monkey loves to eat ___? 🐒", options: ["Fish", "Banana", "Grass", "Meat"], correctAnswer: 1, emoji: "🐒" },
            { id: 4, question: "Who has a long trunk? 🐘", options: ["Tiger", "Giraffe", "Lion", "Elephant"], correctAnswer: 3, emoji: "🐘" },
            { id: 5, question: "What sound does a duck make? 🦆", options: ["Tweet", "Oink", "Quack", "Moo"], correctAnswer: 2, emoji: "🦆" }
        ]
    },
    "E2": {
        lessonId: "E2",
        lessonTitle: "Fruits & Vegetables",
        subject: "Environment & Nature",
        level: "easy",
        questions: [
            { id: 1, question: "Which one is a fruit? 🍎", options: ["Potato", "Carrot", "Apple", "Onion"], correctAnswer: 2, emoji: "🍎" },
            { id: 2, question: "What color is a banana? 🍌", options: ["Red", "Yellow", "Green", "Blue"], correctAnswer: 1, emoji: "🍌" },
            { id: 3, question: "Which vegetable is orange? 🥕", options: ["Tomato", "Spinach", "Carrot", "Brinjal"], correctAnswer: 2, emoji: "🥕" },
            { id: 4, question: "Which fruit is round and red?", options: ["Banana", "Mango", "Grapes", "Apple"], correctAnswer: 3, emoji: "🍎" },
            { id: 5, question: "Which grows under the ground? 🥔", options: ["Apple", "Potato", "Mango", "Grapes"], correctAnswer: 1, emoji: "🥔" }
        ]
    },
    "E3": {
        lessonId: "E3",
        lessonTitle: "Seasons & Weather",
        subject: "Environment & Nature",
        level: "easy",
        questions: [
            { id: 1, question: "In which season does it snow? ❄️", options: ["Summer", "Winter", "Spring", "Autumn"], correctAnswer: 1, emoji: "❄️" },
            { id: 2, question: "What do we use when it rains? 🌧️", options: ["Sunglasses", "Scarf", "Umbrella", "Hat"], correctAnswer: 2, emoji: "🌧️" },
            { id: 3, question: "The sun gives us ___? ☀️", options: ["Rain", "Snow", "Light and warmth", "Wind"], correctAnswer: 2, emoji: "☀️" },
            { id: 4, question: "In summer, the weather is ___?", options: ["Cold", "Freezing", "Cool", "Hot"], correctAnswer: 3, emoji: "🌞" },
            { id: 5, question: "Flowers bloom in which season? 🌸", options: ["Winter", "Spring", "Autumn", "None"], correctAnswer: 1, emoji: "🌸" }
        ]
    },

    // =============================================
    // SHAPES & COLORS (S1, S2, S3)
    // =============================================
    "S1": {
        lessonId: "S1",
        lessonTitle: "Basic Shapes",
        subject: "Shapes & Colors",
        level: "easy",
        questions: [
            { id: 1, question: "Which shape has 3 sides? 🔺", options: ["Square", "Circle", "Rectangle", "Triangle"], correctAnswer: 3, emoji: "🔺" },
            { id: 2, question: "A ball is shaped like a ___? ⚽", options: ["Square", "Triangle", "Circle", "Rectangle"], correctAnswer: 2, emoji: "⚽" },
            { id: 3, question: "How many sides does a square have? 🟦", options: ["3", "4", "5", "6"], correctAnswer: 1, emoji: "🟦" },
            { id: 4, question: "What shape is a pizza slice? 🍕", options: ["Circle", "Square", "Triangle", "Oval"], correctAnswer: 2, emoji: "🍕" },
            { id: 5, question: "A wheel is what shape? ☸️", options: ["Triangle", "Square", "Rectangle", "Circle"], correctAnswer: 3, emoji: "☸️" }
        ]
    },
    "S2": {
        lessonId: "S2",
        lessonTitle: "Advanced Shapes",
        subject: "Shapes & Colors",
        level: "easy",
        questions: [
            { id: 1, question: "Which shape looks like an egg? 🥚", options: ["Circle", "Oval", "Square", "Triangle"], correctAnswer: 1, emoji: "🥚" },
            { id: 2, question: "A rectangle has ___ sides?", options: ["3", "5", "4", "6"], correctAnswer: 2, emoji: "📦" },
            { id: 3, question: "How many points does a star have? ⭐", options: ["3", "4", "5", "6"], correctAnswer: 2, emoji: "⭐" },
            { id: 4, question: "A door is usually what shape? 🚪", options: ["Circle", "Triangle", "Rectangle", "Star"], correctAnswer: 2, emoji: "🚪" },
            { id: 5, question: "Which shape has NO corners?", options: ["Square", "Triangle", "Rectangle", "Circle"], correctAnswer: 3, emoji: "⭕" }
        ]
    },
    "S3": {
        lessonId: "S3",
        lessonTitle: "Colors Recognition",
        subject: "Shapes & Colors",
        level: "easy",
        questions: [
            { id: 1, question: "What color is the sky on a sunny day? ☀️", options: ["Red", "Green", "Blue", "Yellow"], correctAnswer: 2, emoji: "☀️" },
            { id: 2, question: "What color is grass? 🌿", options: ["Blue", "Green", "Red", "Yellow"], correctAnswer: 1, emoji: "🌿" },
            { id: 3, question: "What color do you get by mixing red and yellow? 🎨", options: ["Green", "Purple", "Orange", "Blue"], correctAnswer: 2, emoji: "🎨" },
            { id: 4, question: "A tomato is usually what color? 🍅", options: ["Yellow", "Blue", "Green", "Red"], correctAnswer: 3, emoji: "🍅" },
            { id: 5, question: "How many colors are in a rainbow? 🌈", options: ["5", "6", "7", "8"], correctAnswer: 2, emoji: "🌈" }
        ]
    },

    // =============================================
    // GENERAL AWARENESS (G1, G2, G3)
    // =============================================
    "G1": {
        lessonId: "G1",
        lessonTitle: "Body Parts",
        subject: "General Awareness",
        level: "easy",
        questions: [
            { id: 1, question: "What do we use to see? 👀", options: ["Nose", "Ears", "Eyes", "Hands"], correctAnswer: 2, emoji: "👀" },
            { id: 2, question: "What do we use to hear sounds? 👂", options: ["Eyes", "Ears", "Nose", "Mouth"], correctAnswer: 1, emoji: "👂" },
            { id: 3, question: "We walk with our ___? 🦶", options: ["Hands", "Head", "Feet", "Arms"], correctAnswer: 2, emoji: "🦶" },
            { id: 4, question: "How many fingers do we have on one hand? 🖐️", options: ["4", "6", "10", "5"], correctAnswer: 3, emoji: "🖐️" },
            { id: 5, question: "We smell with our ___? 👃", options: ["Eyes", "Ears", "Mouth", "Nose"], correctAnswer: 3, emoji: "👃" }
        ]
    },
    "G2": {
        lessonId: "G2",
        lessonTitle: "Family Members",
        subject: "General Awareness",
        level: "easy",
        questions: [
            { id: 1, question: "Your mother's mother is your ___? 👵", options: ["Aunt", "Grandmother", "Sister", "Cousin"], correctAnswer: 1, emoji: "👵" },
            { id: 2, question: "Who is your father's wife? 👩", options: ["Sister", "Aunt", "Mother", "Grandmother"], correctAnswer: 2, emoji: "👩" },
            { id: 3, question: "Your parent's son is your ___? 👦", options: ["Uncle", "Cousin", "Friend", "Brother"], correctAnswer: 3, emoji: "👦" },
            { id: 4, question: "What do we call our father's father? 👴", options: ["Uncle", "Grandfather", "Brother", "Father"], correctAnswer: 1, emoji: "👴" },
            { id: 5, question: "A baby girl in your family is your ___? 👶", options: ["Brother", "Friend", "Cousin", "Sister"], correctAnswer: 3, emoji: "👶" }
        ]
    },
    "G3": {
        lessonId: "G3",
        lessonTitle: "Good Habits",
        subject: "General Awareness",
        level: "easy",
        questions: [
            { id: 1, question: "When should you brush your teeth? 🪥", options: ["Only at night", "Never", "Morning and night", "Once a week"], correctAnswer: 2, emoji: "🪥" },
            { id: 2, question: "What should you say when someone helps you?", options: ["Bye", "Thank you", "Hello", "Sorry"], correctAnswer: 1, emoji: "🙏" },
            { id: 3, question: "What should you do before eating? 🧼", options: ["Sleep", "Run", "Watch TV", "Wash your hands"], correctAnswer: 3, emoji: "🧼" },
            { id: 4, question: "Sharing toys with friends is a ___ habit?", options: ["Bad", "Good", "Silly", "Scary"], correctAnswer: 1, emoji: "🤝" },
            { id: 5, question: "When should you sleep? 😴", options: ["Never", "All day", "At night", "At noon"], correctAnswer: 2, emoji: "😴" }
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
