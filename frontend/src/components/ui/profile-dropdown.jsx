import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { userApiService } from '../../services/userService.js';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User, Settings, LogOut, Trash2 } from 'lucide-react';

export const ProfileDropdown = ({ onLogout, onViewProfile, onEditProfile}) => {
const [profile, setProfile] = useState(null);

const [isDeleting, setIsDeleting] = useState(false);

 const { currentUser, getUserProfile } = useAuth();

  useEffect(() => {
  if (!currentUser) return;


  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${currentUser.uid}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);  // now profile has bio, location, createdAt

    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, [currentUser]);


  const handleDeleteAccount = async () => {
    // First confirmation
    const firstConfirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data including hikes, plans, and profile information."
    );
    
    if (!firstConfirm) return;

    // Second confirmation with typing requirement
    const confirmText = prompt(
      'To confirm account deletion, please type "DELETE MY ACCOUNT" (in all caps):'
    );
    
    if (confirmText !== "DELETE MY ACCOUNT") {
      if (confirmText !== null) { // User didn't cancel
        alert("Confirmation text did not match. Account deletion cancelled.");
      }
      return;
    }

    try {
      setIsDeleting(true);
      
      // Call the delete account API
      await userApiService.deleteAccount(currentUser.uid);
      
      // Sign out the user from Firebase
      await onLogout();
      
      // Navigate to home page with success message
      // You can use React Router's navigate or window.location
      window.location.href = '/?deleted=true';
      
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert(`Failed to delete account: ${error.message}. Please try again or contact support.`);
    } finally {
      setIsDeleting(false);
    }
  };

  
  const user = {
    name: profile?.displayName || currentUser?.displayName || "Anonymous",
    email: profile?.email || currentUser?.email || "No email",
    avatar: "", // still empty, fallback initials will be shown
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-trail text-white">
              {user.name
                ? user.name.split(' ').map((n) => n[0]).join('')
                : "?"}
            </AvatarFallback>

          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-card/95 backdrop-blur-sm border-border"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-muted"
          onClick={onViewProfile}
        >
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer hover:bg-muted"
            onClick={onEditProfile}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Account</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-muted"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
