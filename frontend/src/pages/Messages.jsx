import { useState, useEffect } from 'react';
import { Navigation } from '../components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ChatBox } from '../components/ui/chat-box';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Search, Loader2, Inbox } from 'lucide-react';

const Messages = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

    // Refresh conversations every 30 seconds (reduced from 10)
    const interval = setInterval(loadConversations, 1200000);

    return () => clearInterval(interval);
  }, [currentUser]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Messages
              </h1>
              <p className="text-muted-foreground">
                Chat with your hiking friends
              </p>
            </div>
            
          </div>
        </div>

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
