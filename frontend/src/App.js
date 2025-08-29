import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Index from './pages/Index.jsx';
import EditProfile from "./pages/EditProfile.jsx";
import NotFound from './pages/NotFound.jsx';
import Signup from './pages/Signup.jsx';
import LoginPage from './components/auth/loginPage.jsx';
//import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        {/*<Route path="/login" element={<Login />} />*/}
        <Route path = "/loginPage" element ={<LoginPage/>}/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* Protected Routes */}
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

export default App;
