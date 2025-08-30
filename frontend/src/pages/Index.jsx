import { useState, useEffect } from 'react';
import { Navigation } from '../components/ui/navigation';
import { HeroSection } from '../components/hero-section';
import { FeaturesSection } from '../components/features-section';
import { LogbookSection } from '../components/logbook-section';
import Login from '../components/auth/loginPage.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const Index = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'login') {
      setIsLoginOpen(true);
    }
  }, [location]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with integrated login functionality */}
      <HeroSection onGetStarted={handleLoginOpen} />

      {/* Logbook Section - Now comes right after hero */}
      <LogbookSection />

      {/* Features Section - Now comes after logbook */}
      <FeaturesSection />

      <Login
        open={isLoginOpen}
        onOpenChange={handleLoginClose}
        onLogin={(email) => console.log('Logged in as', email)} // Placeholder
        onSignup={handleSignupRedirect}
      />
    </div>
  );
};

export default Index;
