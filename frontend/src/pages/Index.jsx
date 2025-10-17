import { useState, useEffect } from 'react';
import { Navigation } from '../components/ui/navigation';
import { HeroSection } from '../components/hero-section';
import { LogbookSection } from '../components/logbook-section';
import Login from '../components/auth/loginPage.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Index = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'login') {
      setIsLoginOpen(true);
    }
  }, [location]);

  // Redirect logged-in users to Dashboard (skip in test environment)
  useEffect(() => {
    if (currentUser && process.env.NODE_ENV !== 'test') {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLoginOpen = () => {
    setIsLoginOpen(true);
  };

  const handleLoginClose = () => {
    setIsLoginOpen(false);
    navigate(location.pathname, { replace: true }); // Clean URL
  };

  const handleSignupRedirect = () => {
    navigate('/signup');
  };

  const handleViewSampleLog = () => {
    const logbookSection = document.getElementById('logbook');
    if (logbookSection) {
      logbookSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with integrated login functionality */}
      <HeroSection
        onGetStarted={handleLoginOpen}
        onViewSampleLog={handleViewSampleLog}
      />

      {/* Logbook Section - Now comes right after hero */}
      <LogbookSection />

      {/* Features Section - Now comes after logbook */}
      {/* <FeaturesSection /> */}

      <Login
        open={isLoginOpen}
        onOpenChange={handleLoginClose}
        onLogin={() => {}} // Placeholder
        onSignup={handleSignupRedirect}
      />
    </div>
  );
};

export default Index;
