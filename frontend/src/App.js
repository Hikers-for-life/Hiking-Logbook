import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Index from './pages/Index.jsx';
import Logbook from './pages/Logbook.jsx';
import HikePlanner from './pages/HikePlanner.jsx';
import EditProfile from "./pages/EditProfile.jsx";
import NotFound from './pages/NotFound.jsx';
import Signup from './pages/Signup.jsx';
import LoginPage from './components/auth/loginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Friends from './pages/Friends.jsx';
import Achievements from './pages/Achievements.jsx';
import { API_BASE } from './api/api.js';//ANNAH
const App = () => {
  useEffect(() => {
    // Set default title
    document.title = 'Hiking Logbook';
  }, []);


  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />

          <Route path="/loginPage" element={<LoginPage />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/edit-profile" element={<EditProfile />} />

        {/* Protected Routes */}
        <Route
          path="/logbook"
          element={
            <ProtectedRoute>
              <Logbook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hike-planner"
          element={
            <ProtectedRoute>
              <HikePlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-feed"
          element={
            <ProtectedRoute>
              <Friends/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};


export default App;
