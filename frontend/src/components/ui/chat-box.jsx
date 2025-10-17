import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Avatar, AvatarFallback } from './avatar';
import { ScrollArea } from './scroll-area';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';
import { Send, Loader2 } from 'lucide-react';

export const ChatBox = ({ open, onOpenChange, otherUser }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation and messages when chat opens
  useEffect(() => {
    if (!open || !otherUser?.uid) return;

    const loadChat = async () => {
      try {
        setLoading(true);

        // Get or create conversation
        const conv = await chatService.getConversation(otherUser.uid);
        setConversation(conv);

        // Get messages
        const msgs = await chatService.getMessages(conv.id);
        setMessages(msgs);

        // Mark messages as read
        await chatService.markMessagesAsRead(conv.id);
      } catch (error) {
        console.error('Error loading chat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [open, otherUser]);

  // Poll for new messages every 5 seconds when chat is open (reduced frequency)
  useEffect(() => {
    if (!open || !conversation?.id) return;

    const interval = setInterval(async () => {
      try {
        const msgs = await chatService.getMessages(conversation.id);
        setMessages(msgs);
        await chatService.markMessagesAsRead(conversation.id);
      } catch (error) {
        console.error('Error refreshing messages:', error);
      }
    }, 5000); // Changed from 3000 to 5000ms

    return () => clearInterval(interval);
  }, [open, conversation?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversation || sending) return;

    try {
      setSending(true);

      // Send message
      const sentMessage = await chatService.sendMessage(
        conversation.id,
        otherUser.uid,
        newMessage.trim()
      );

      // Add to local messages immediately for better UX
      setMessages(prev => [...prev, sentMessage]);

      // Clear input
      setNewMessage('');

      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
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
    if (diffDays < 7) return `${diffDays}d ago`;

    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!otherUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl h-[80vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {otherUser.displayName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg">
                {otherUser.displayName || 'Unknown User'}
              </DialogTitle>
              {otherUser.location && (
                <p className="text-xs text-muted-foreground">
                  {otherUser.location}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-2">
                No messages yet
              </p>
              <p className="text-sm text-muted-foreground">
                Send a message to start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isSent = message.senderId === currentUser.uid;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isSent
                          ? 'bg-gradient-trail text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isSent ? 'text-white/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t bg-background"
        >
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending || loading}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending || loading}
              className="bg-gradient-trail hover:opacity-90"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChatBox;
