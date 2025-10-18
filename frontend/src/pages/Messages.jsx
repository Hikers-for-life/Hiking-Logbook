import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '../components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ChatBox } from '../components/ui/chat-box';
import { chatService } from '../services/chatService';
import { hikeInviteService } from '../services/hikeInviteService';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Search, Loader2, Inbox, Mountain, MapPin, Calendar, Check, X, Users, RefreshCw } from 'lucide-react';

const Messages = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Hike invitations state
  const [hikeInvitations, setHikeInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [processingInvite, setProcessingInvite] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load hike invitations - memoized with useCallback
  const loadInvitations = useCallback(async () => {
    if (!currentUser) return;

    try {
      setInvitationsLoading(true);
      console.log('🔄 Loading invitations for user:', currentUser.uid);
      
      const invites = await hikeInviteService.getPendingInvitations();
      
      console.log('📨 Loaded invitations:', invites);
      setHikeInvitations(invites);
    } catch (error) {
      console.error('❌ Error loading invitations:', error);
      // Don't show error to user, just log it
    } finally {
      setInvitationsLoading(false);
    }
  }, [currentUser]);

  // Load conversations
  useEffect(() => {
    if (!currentUser) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const convs = await chatService.getConversations();
        setConversations(convs);
        setFilteredConversations(convs);

        // Get unread count
        const count = await chatService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Refresh conversations every 30 seconds
    const interval = setInterval(loadConversations, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Load invitations on mount and set up auto-refresh
  useEffect(() => {
    if (!currentUser) return;

    // Initial load
    loadInvitations();

    // Auto-refresh every 10 seconds for more responsive updates
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing invitations...');
      loadInvitations();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser, loadInvitations]);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInvitations();
    setRefreshing(false);
  };

  // Filter conversations by search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter((conv) =>
      conv.otherUser.displayName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  const handleOpenChat = (conversation) => {
    setSelectedChat(conversation.otherUser);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedChat(null);

    // Refresh conversations when chat closes
    chatService.getConversations().then((convs) => {
      setConversations(convs);
      setFilteredConversations(convs);
    });
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      setProcessingInvite(invitationId);
      console.log('✅ Accepting invitation:', invitationId);
      
      await hikeInviteService.acceptInvitation(invitationId);
      
      // Remove from list
      setHikeInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      // Show success message
      alert('Hike added to your planner! Check your Hike Planner to see it.');
    } catch (error) {
      console.error('❌ Error accepting invitation:', error);
      alert(`Failed to accept invitation: ${error.message}`);
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      setProcessingInvite(invitationId);
      console.log('❌ Rejecting invitation:', invitationId);
      
      await hikeInviteService.rejectInvitation(invitationId);
      
      // Remove from list
      setHikeInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      alert('Invitation rejected.');
    } catch (error) {
      console.error('❌ Error rejecting invitation:', error);
      alert(`Failed to reject invitation: ${error.message}`);
    } finally {
      setProcessingInvite(null);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';

    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatHikeDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Messages & Invitations
              </h1>
              <p className="text-muted-foreground">
                Chat with friends and manage hike invitations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {hikeInvitations.length > 0 && (
                <Badge className="bg-forest text-white">
                  {hikeInvitations.length} Pending
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Hike Invitations Section */}
        {(invitationsLoading || hikeInvitations.length > 0) && (
          <Card className="bg-gradient-card border-border shadow-elevation mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-forest" />
                Hike Invitations
                {invitationsLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invitationsLoading && hikeInvitations.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading invitations...</span>
                </div>
              ) : hikeInvitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Mountain className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No pending hike invitations
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hikeInvitations.map((invitation) => (
                    <Card key={invitation.id} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {invitation.fromUser?.displayName
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {invitation.fromUser?.displayName || 'Unknown User'} invited you to a hike
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(invitation.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted rounded-lg p-4 mb-4">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {invitation.hikeDetails?.title || 'Untitled Hike'}
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2 text-forest" />
                              {invitation.hikeDetails?.location || 'Location not specified'}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-2 text-trail" />
                              {formatHikeDate(invitation.hikeDetails?.date)}
                              {invitation.hikeDetails?.startTime && ` at ${invitation.hikeDetails.startTime}`}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Mountain className="h-4 w-4 mr-2 text-summit" />
                              {invitation.hikeDetails?.distance || 'Distance not specified'} • {invitation.hikeDetails?.difficulty || 'Easy'}
                            </div>
                            {invitation.hikeDetails?.description && (
                              <p className="text-muted-foreground text-xs mt-2">
                                {invitation.hikeDetails.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectInvitation(invitation.id)}
                            disabled={processingInvite === invitation.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {processingInvite === invitation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Decline
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvitation(invitation.id)}
                            disabled={processingInvite === invitation.id}
                            className="bg-forest hover:bg-forest/90 text-white"
                          >
                            {processingInvite === invitation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Conversations List */}
        <Card className="bg-card border-border shadow-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-forest" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'No conversations found' : 'No messages yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? 'Try searching for a different name'
                    : 'Start chatting with friends from the Friends page!'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => {
                  const isUnread =
                    conversation.lastMessageSender !== currentUser.uid &&
                    conversation.lastMessage;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => handleOpenChat(conversation)}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                        isUnread
                          ? 'bg-gradient-trail hover:bg-accent/80'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">
                          {conversation.otherUser.displayName
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={`font-medium text-foreground truncate ${
                              isUnread ? 'font-bold' : ''
                            }`}
                          >
                            {conversation.otherUser.displayName ||
                              'Unknown User'}
                          </h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {conversation.lastMessageSender === currentUser.uid
                            ? 'You: '
                            : ''}
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Chat Dialog */}
      <ChatBox
        open={isChatOpen}
        onOpenChange={handleCloseChat}
        otherUser={selectedChat}
      />
    </div>
  );
};

export default Messages;