import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminHome from "./pages/Adminhome";
import TeacherHome from "./pages/Teacherhome";
import StudentHome from "./pages/studenthome";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";
import { AuthProvider, useAuth } from "./context/Authcontext";
import ResetPassword from './pages/ResetPassword';
import CreateQuiz from "./pages/CreateQuiz";
import Quizzes from "./pages/Quizzes";
import AttemptQuiz from "./pages/AttemptQuiz";
import Result from "./pages/Result";
import AssignmentUpload from "./pages/AssignmentUpload";
import EmotionDetector from "./pages/EmotionDetector";
import Courses from "./pages/Courses";
import CourseView from "./pages/CourseView";
import Layout from "./components/Layout";
import ConceptBattles from "./components/ConceptBattles";
import ConceptBattleGame from "./components/ConceptBattleGame";

const PrivateRoute = ({ children, role }) => {
  const { user, role: userRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }
  if (userRole !== role) {
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

// For public routes that should still have the layout when logged in
const PublicRouteWithLayout = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Layout>{children}</Layout>;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/create-quiz" element={
            <PrivateRoute role="teacher">
              <CreateQuiz />
            </PrivateRoute>
          } />
          
          <Route path="/view-quiz" element={
            <PrivateRoute role="student">
              <Quizzes />
            </PrivateRoute>
          } />
          
          <Route path="/attempt/:courseId/:quizId" element={
            <PrivateRoute role="student">
              <AttemptQuiz />
            </PrivateRoute>
          } />
          
          <Route path="/result" element={
            <PrivateRoute role="student">
              <Result />
            </PrivateRoute>
          } />
          
          <Route path="/assignment" element={
            <PrivateRoute role="student">
              <AssignmentUpload />
            </PrivateRoute>
          } />
          
          <Route path="/focus" element={
            <PrivateRoute role="student">
              <EmotionDetector />
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <PrivateRoute role="admin">
              <AdminHome />
            </PrivateRoute>
          } />
          
          <Route path="/teacher" element={
            <PrivateRoute role="teacher">
              <TeacherHome />
            </PrivateRoute>
          } />

          <Route path="/courses" element={
            <PrivateRoute role="student">
              <Courses />
            </PrivateRoute>
          } />
          
          <Route path="/student" element={
            <PrivateRoute role="student">
              <StudentHome />
            </PrivateRoute>
          } />

          <Route path="/concept-battles" element={
            <PrivateRoute role="student">
              <ConceptBattles />
            </PrivateRoute>
          } />
          
          <Route path="/concept-battle/:levelId" element={
            <PrivateRoute role="student">
              <ConceptBattleGame />
            </PrivateRoute>
          } />

          <Route path="/course/:courseId" element={
            <PrivateRoute role="student">
              <CourseView />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
