import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LearningProvider } from './context/LearningContext';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import KidDashboard from './pages/KidDashboard';
import LessonDetail from './pages/LessonDetail';
import InteractiveLearning from './pages/InteractiveLearning';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherStudents from './pages/TeacherStudents';
import TeacherMaterials from './pages/TeacherMaterials';
import TeacherQuizzes from './pages/TeacherQuizzes';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherStudentDetail from './pages/TeacherStudentDetail';
import TouchLearning from './pages/TouchLearning';
import SubjectDetail from './pages/SubjectDetail';
import TeacherLessons from './pages/TeacherLessons';
import TeacherEditLesson from './pages/TeacherEditLesson';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ duration: 0.4 }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

const PrivateRoute = ({ children, role }) => {
  const { userInfo } = useAuth();
  if (!userInfo) return <Navigate to="/login" />;

  // Allow "kid" role to access "parent" pages (Family Account)
  if (role === 'parent' && userInfo.role === 'kid') {
    return children;
  }

  if (role && userInfo.role !== role) return <Navigate to="/" />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Welcome /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />

        <Route path="/dashboard" element={
          <PrivateRoute role="kid">
            <PageTransition><KidDashboard /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/learning/touch" element={
          <PrivateRoute role="kid">
            <PageTransition><TouchLearning /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/lesson/:id" element={
          <PrivateRoute role="kid">
            <PageTransition><LessonDetail /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/subject/:subjectName" element={
          <PrivateRoute role="kid">
            <PageTransition><SubjectDetail /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/interactive" element={
          <PrivateRoute role="kid">
            <PageTransition><InteractiveLearning /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/quiz/:id" element={
          <PrivateRoute role="kid">
            <PageTransition><Quiz /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/quiz/subject/:subjectName" element={
          <PrivateRoute role="kid">
            <PageTransition><Quiz /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/result" element={
          <PrivateRoute role="kid">
            <PageTransition><Result /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/parent" element={
          <PrivateRoute role="parent">
            <PageTransition><ParentDashboard /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/teacher/dashboard" element={
          <PrivateRoute role="teacher">
            <PageTransition><TeacherDashboard /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/teacher/students" element={
          <PrivateRoute role="teacher">
            <PageTransition><TeacherStudents /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/teacher/student-progress/:id" element={
          <PrivateRoute role="teacher">
            <PageTransition><TeacherStudentDetail /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/teacher/materials" element={
          <PrivateRoute role="teacher">
            <PageTransition><TeacherMaterials /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/teacher/quizzes" element={
          <PrivateRoute role="teacher">
            <PageTransition><TeacherQuizzes /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/teacher/analytics" element={
          <PrivateRoute role="teacher">
            <PageTransition><TeacherAnalytics /></PageTransition>
          </PrivateRoute>
        } />
        
        <Route path="/teacher/lessons" element={
          <PrivateRoute role="teacher">
            <PageTransition><TeacherLessons /></PageTransition>
          </PrivateRoute>
        } />

        <Route path="/teacher/edit-lesson/:id" element={
          <PrivateRoute role="teacher">
            <PageTransition><TeacherEditLesson /></PageTransition>
          </PrivateRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <LearningProvider>
        <Router>
          <div className="min-h-screen font-body bg-slate-50">
            <Navbar />
            <AnimatedRoutes />
          </div>
        </Router>
      </LearningProvider>
    </AuthProvider>
  );
}

export default App;
