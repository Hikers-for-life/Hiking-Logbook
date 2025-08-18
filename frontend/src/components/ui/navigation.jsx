import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Menu, X, Mountain, MapPin, Users, Trophy, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Login from "../auth/loginPage";
import { ProfileDropdown } from "../ui/profile-dropdown";
import { ProfileView } from "../ui/profile-view.jsx";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Logbook", icon: MapPin, href: "/" },
    { name: "Plan Hike", icon: Calendar, href: "/plan-hike" },
    { name: "Friends", icon: Users, href: "/friends" },
    { name: "Achievements", icon: Trophy, href: "/achievements" },
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleViewProfile = () => {
    setIsProfileOpen(true);
  };

  const handleEditProfile = () => {
    navigate("/edit-profile"); 
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Mountain className="h-8 w-8 text-forest" />
            <span className="text-xl font-bold text-foreground">Hiking Log</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 text-muted-foreground hover:text-forest transition-colors duration-200"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            {isLoggedIn ? (
              <ProfileDropdown onLogout={handleLogout} onViewProfile={handleViewProfile} onEditProfile={handleEditProfile} />
            ) : (
              <Button 
                variant="default" 
                className="bg-gradient-trail text-primary-foreground"
                onClick={() => setIsLoginOpen(true)}
              >
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                {isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Logged in as Alex</span>
                    <ProfileDropdown onLogout={handleLogout} onViewProfile={handleViewProfile} />
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full bg-gradient-trail text-primary-foreground"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Login 
        open={isLoginOpen} 
        onOpenChange={setIsLoginOpen}
        onLogin={handleLogin}
      />
      
      <ProfileView 
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />
    </nav>
  );
};