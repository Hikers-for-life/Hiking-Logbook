// src/components/FriendInviteDialog.jsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Search, UserPlus, Loader2, Users, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hikeInviteService } from '../services/hikeInviteService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const FriendInviteDialog = ({ open, onOpenChange, hike }) => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState(new Set());

  // Load friends list
  useEffect(() => {
    if (!open || !currentUser) return;

    const loadFriends = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/friends/${currentUser.uid}`);
        const data = await response.json();

        console.log('Friends API response:', data); // Debug log

        if (data.success) {
          // ✅ FIX: Use data.data instead of data.friends
          const friendsList = data.data || [];
          console.log('Friends list:', friendsList); // Debug log
          setFriends(friendsList);
          setFilteredFriends(friendsList);
        } else {
          console.error('Failed to load friends:', data.error);
          setFriends([]);
          setFilteredFriends([]);
        }
      } catch (error) {
        console.error('Error loading friends:', error);
        setFriends([]);
        setFilteredFriends([]);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
    setInvitedFriends(new Set());
    setSearchTerm('');
  }, [open, currentUser]);

  // Filter friends by search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFriends(friends);
      return;
    }

    const filtered = friends.filter((friend) =>
      friend.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFriends(filtered);
  }, [searchTerm, friends]);

  const handleInviteFriend = async (friend) => {
    if (!hike || invitedFriends.has(friend.id)) return;

    try {
      setSending(true);

      // ✅ Use friend.id as the friendId parameter
      await hikeInviteService.sendHikeInvitation(hike.id, friend.id, {
        title: hike.title,
        location: hike.location,
        date: hike.date || hike.jsDate?.toISOString(),
        distance: hike.distance,
        difficulty: hike.difficulty,
        description: hike.description,
        notes: hike.notes,
        startTime: hike.startTime
      });

      // Mark friend as invited
      setInvitedFriends(prev => new Set([...prev, friend.id]));
      
      // Show success message
      alert(`Invitation sent to ${friend.displayName}!`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-forest" />
            Invite Friends to Hike
          </DialogTitle>
          <DialogDescription>
            {hike && (
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{hike.title}</p>
                <p className="text-sm text-muted-foreground">{hike.location}</p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Friends List */}
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? 'No friends found'
                  : 'No friends to invite yet'}
              </p>
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const isInvited = invitedFriends.has(friend.id);
              
              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {friend.displayName
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {friend.displayName || 'Unknown User'}
                      </p>
                      {friend.location && (
                        <p className="text-xs text-muted-foreground">
                          {friend.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {isInvited ? (
                    <Badge className="bg-green-600 text-white">
                      <Check className="h-3 w-3 mr-1" />
                      Invited
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleInviteFriend(friend)}
                      disabled={sending}
                      className="bg-forest hover:bg-forest/90 text-white"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Invite
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendInviteDialog;