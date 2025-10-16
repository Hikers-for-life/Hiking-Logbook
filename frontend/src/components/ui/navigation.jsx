import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Menu,
  X,
  Mountain,
  MapPin,
  Trophy,
  Calendar,
  Book,
  Activity,
  MessageSquare,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ProfileDropdown } from './profile-dropdown.jsx';
import { ProfileView } from './profile-view.jsx';
import { chatService } from '../../services/chatService';


export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { currentUser, logout } = useAuth();

  const navigate = useNavigate();

  // Fetch unread message count
  useEffect(() => {
    if (!currentUser) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await chatService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);


  // Define navigation items based on authentication state
  const publicNavItems = [
    { name: 'Home', icon: MapPin, href: '/' },
  ];

  const authenticatedNavItems = [
    { name: 'Logbook', icon: Book, href: '/logbook' },
    { name: 'Hike Planner', icon: Calendar, href: '/hike-planner' },
    { name: 'Activity Feed', icon: Activity, href: '/activity-feed' },
    { name: 'Messages', icon: MessageSquare, href: '/messages' },
    { name: 'Achievements', icon: Trophy, href: '/achievements' },
  ];

  // Choose navigation items based on authentication state
  const navItems = currentUser ? authenticatedNavItems : publicNavItems;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleViewProfile = () => {
    setIsProfileOpen(true);
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleSignup = () => {
    navigate('/?auth=login');

  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Mountain className="h-8 w-8 text-forest" />
            <Link
              to="/"
              className="text-xl font-bold text-foreground hover:text-forest transition-colors"
            >
              Hiking Logbook
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 text-muted-foreground hover:text-forest transition-colors duration-200 relative"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {item.name === 'Messages' && unreadCount > 0 && (
                  <span className="absolute -top-2 -left bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    className="bg-gradient-trail text-primary-foreground"
                  >
                    Dashboard
                  </Button>
                </Link>
                <ProfileDropdown
                  onLogout={handleLogout}
                  onViewProfile={handleViewProfile}
                  onEditProfile={handleEditProfile}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="default"
                  className="bg-gradient-trail text-primary-foreground"
                  onClick={handleSignup}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground min-h-[44px] min-w-[44px]"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-forest hover:bg-muted rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="px-3 py-2">
                {currentUser ? (
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-forest hover:bg-muted rounded-md transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <span>Dashboard</span>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground px-3">
                        Logged in as{' '}
                        {currentUser.displayName || currentUser.email}
                      </span>
                      <ProfileDropdown
                        onLogout={handleLogout}
                        onViewProfile={handleViewProfile}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="default"
                      className="w-full bg-gradient-trail text-primary-foreground"
                      onClick={() => {
                        handleSignup();
                        setIsOpen(false);
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ProfileView open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </nav>
  );
};
