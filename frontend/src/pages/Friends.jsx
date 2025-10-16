
import { useState, useEffect } from "react";
import { getUserProfile } from '../services/userServices';
import { useLocation } from 'react-router-dom';
import { Navigation } from "../components/ui/navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { searchUsers } from "../services/userServices";
import { ProfileView } from "../components/ui/view-friend-profile";
import { fetchFeed, likeFeed, commentFeed, shareFeed, deleteCommentFeed, deleteFeed, updateFeed, getFeedById } from "../services/feed";//ANNAH HERE
import { discoverFriends, sendFriendRequest, getIncomingRequests, respondToRequest } from "../services/discover";//ANNAH HERE
import { getAuth } from "firebase/auth";//NOT SURE ABOUT THIS IMPORT//ANNA HERE
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from "../hooks/use-toast";
import { getUserStats } from "../services/statistics";
import { getFriendProfile } from "../services/friendService.js";


import {
  Search,
  UserPlus,
  MapPin,
  TrendingUp,
  Mountain,
  Clock,
  Medal,
  Users,
  Share2,
  Heart,
  MessageSquare,
  Edit3,
  Trash2,
  Camera
} from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Friends = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  //ANNAH HERE

  const [recentActivity, setRecentActivity] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [commentsMap] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  const [postToShare, setPostToShare] = useState(null);
  //ANNAH HERE

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [, setUserStats] = useState([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    const results = await searchUsers(searchTerm.trim());
    if (results.length === 0) {
      setSearchError("No hikers found with that name.");
      setSearchResults([]);
    } else {
      setSearchError("");
      setSearchResults(results);
    }
  };

  useEffect(() => {
    const loadFriendProfiles = async () => {
      if (!friends.length) return;

      const updatedFriends = await Promise.all(
        friends.map(async (f) => {
          const profile = await getFriendProfile(f.id); // pass friend UID
          if (profile.success) {
            return {
              ...f,
              totalHikes: profile.totalHikes,
              totalDistance: profile.totalDistance,
              totalElevation: profile.totalElevation,
              lastHike: profile.recentHikes[0]?.title || "No hikes yet",
              lastHikeDate: profile.recentHikes[0]?.date || "",
            };
          }
          return f; // fallback if fetch fails
        })
      );

      setFriends(updatedFriends);
    };

    loadFriendProfiles();
  }, [friends.length]);


  useEffect(() => {
    if (!currentUser) return;

    getUserStats(currentUser.uid).then((stats) => {
      console.log("User stats:", stats);
      setUserStats(stats); // { totalDistance: X, totalElevation: Y }
    });
  }, [currentUser]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/friends/${currentUser.uid}`);
        const data = await res.json();
        if (data.success) {
          setFriends(data.data);
        } else {
          console.error("Failed to fetch friends:", data.error);
        }
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    if (currentUser) fetchFriends();
  }, [currentUser]);


  console.log("Fetching friends:", friends);
  const handleBlockFriend = async (fid) => {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/${currentUser.uid}/block/${fid}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setFriends(prev => prev.filter(f => f.id !== fid)); // update UI
        toast({
          title: "User blocked",
          description: "Friendship removed successfully!",
        });
      } else {
        console.error("Failed to block friend:", data.error);
      }
    } catch (err) {
      console.error("Error blocking friend:", err);
    }
  };
  const handleViewProfile = async (personOrId, showAddFriend = false) => {
    // Accept either uid string or a person object
    try {
      let uid = null;
      let base = {};
      if (!personOrId) return;
      if (typeof personOrId === 'string') {
        uid = personOrId;
      } else {
        uid = personOrId.uid || personOrId.id || personOrId.userId || null;
        base = { ...(personOrId.displayName ? { displayName: personOrId.displayName } : {}), ...(personOrId.name ? { displayName: personOrId.name } : {}), avatar: personOrId.avatar || personOrId?.displayName?.[0] };
      }

      if (uid) {
        // fetch profile basics from firestore via userServices.getUserProfile
        const up = await getUserProfile(uid);
        const person = {
          uid,
          displayName: up.userName || base.displayName || '',
          location: up.location || base.location || '',
          bio: up.bio || '',
          createdAt: up.joinDate || undefined,
          ...base,
        };
        setSelectedProfile({ ...person, showAddFriend });
        setIsProfileOpen(true);
        return;
      }

      // fallback: use provided object as-is
      setSelectedProfile({ ...base, ...(typeof personOrId === 'object' ? personOrId : {}), showAddFriend });
      setIsProfileOpen(true);
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast({ title: 'Profile error', description: 'Could not load user profile.' });
    }
  };

  //ANNAH HERE
  const auth = getAuth();

  // Determine which tab should be active based on the current route
  const location = useLocation();
  const initialTab = location.pathname && location.pathname.includes('/activity-feed') ? 'activity' : 'friends';
  const [activeTab, setActiveTab] = useState(initialTab);
  

  useEffect(() => {
    // If the route changes to /activity-feed, switch to the activity tab
    if (location.pathname && location.pathname.includes('/activity-feed')) {
      setActiveTab('activity');
    }
  }, [location.pathname]);


  useEffect(() => {
    let isMounted = true;

    const loadFeed = async (p = 1) => {
      try {
        if (p === 1) setLoading(true);
        else setLoadingMore(true);

        const data = await fetchFeed(p, limit); // fetches activities page
        if (!isMounted) return;

        const activities = (Array.isArray(data) ? data : data.activities || []).map(a => ({
          ...a,
          comments: a.comments || [],
        }));

        if (p === 1) {
          setRecentActivity(activities);
        } else {
          setRecentActivity(prev => [...prev, ...activities]);
        }

        // If fewer than limit returned, no more pages
        if (activities.length < limit) setHasMore(false);
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    loadFeed(page);
    return () => { isMounted = false; };
  }, []);


  // ---- Like handler ----
  const handleLike = async (activity) => {
    const uid = auth?.currentUser.uid;
    if (!uid) return;

    // Optimistic UI update
    setRecentActivity(prev => prev.map(a => {
      if (a.id === activity.id) {
        const likes = a.likes?.includes(uid)
          ? a.likes.filter(l => l !== uid)
          : [...(a.likes || []), uid];
        return { ...a, likes };
      }
      return a;
    }));

    try {
      const res = await likeFeed(activity.id, !activity.likes?.includes(uid));
      if (res && res.likes) {
        setRecentActivity(prev => prev.map(a => a.id === activity.id ? { ...a, likes: res.likes } : a));
        try {
          const likedNow = res.likes.includes(uid);
          toast({ title: likedNow ? 'Liked' : 'Unliked', description: likedNow ? 'You liked this post.' : 'You removed your like.' });
        } catch (e) {
          // ignore toast errors
        }
      }
    } catch (err) {
      console.error("Failed to like:", err);
      // rollback if needed
      setRecentActivity(prev => prev.map(a => {
        if (a.id === activity.id) {
          const likes = activity.likes || [];
          return { ...a, likes };
        }
        return a;
      }));
      toast({ title: 'Like failed', description: 'Could not update like. Please try again.', variant: 'destructive' });
    }
  };

  // Load next page of feed
  const loadNextPage = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchFeed(nextPage, limit);
      const activities = (Array.isArray(data) ? data : data.activities || []).map(a => ({ ...a, comments: a.comments || [] }));
      if (activities.length > 0) {
        setRecentActivity(prev => [...prev, ...activities]);
        setPage(nextPage);
      }
      if (activities.length < limit) setHasMore(false);
    } catch (err) {
      console.error('Failed to load more feed:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ---- Comment handler ----
  const handleAddComment = async (activityId, content) => {
    if (!content.trim()) return;
    const user = auth?.currentUser;

    // Optimistic UI update
    const tempComment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      name: user.displayName || user.email,
      content,
    };
    setRecentActivity(prev =>
      prev.map(a =>
        a.id === activityId
          ? { ...a, comments: [...(a.comments || []), tempComment] }
          : a
      )
    );
    try {
      const res = await commentFeed(activityId, content);
      setRecentActivity(prev =>
        prev.map(a =>
          a.id === activityId
            ? {
              ...a,
              comments: [
                ...(a.comments || []).filter(c => c.id !== tempComment.id),
                res.comment,
              ],
            }
            : a
        )
      );
      toast({ title: 'Comment added', description: 'Your comment was posted.' });
    } catch (err) {
      console.error("Failed to add comment:", err);
      // rollback temp comment
      setRecentActivity(prev =>
        prev.map(a =>
          a.id === activityId
            ? {
              ...a,
              comments: (a.comments || []).filter(c => c.id !== tempComment.id),
            }
            : a
        )
      );
      toast({ title: 'Comment failed', description: 'Could not post your comment. Please try again.', variant: 'destructive' });
    }
  };
  const handleDeleteComment = async (activityId, commentId) => {
    // Optimistic update
    setRecentActivity(prev =>
      prev.map(a =>
        a.id === activityId
          ? { ...a, comments: a.comments.filter(c => c.id !== commentId) }
          : a
      )
    );

    try {
      await deleteCommentFeed(activityId, commentId);
      toast({ title: 'Comment deleted', description: 'The comment was removed.' });
    } catch (err) {
      console.error("Failed to delete comment:", err);
      // Optional: refetch comments here if you want rollback
      toast({ title: 'Delete failed', description: 'Could not delete the comment. Please try again.', variant: 'destructive' });
    }
  };



  // ---- Share handler with caption ----
  const handleShare = async (activity) => {
    setPostToShare(activity);
    setShareCaption('');
    setShareModalOpen(true);
  };

  const confirmShare = async () => {
    if (!postToShare) return;

    const user = auth.currentUser;

    // If sharing a share, preserve the whole share object (including nested original)
    let originalData;
    if (postToShare.type === 'share') {
      originalData = { ...postToShare };
    } else {
      originalData = {
        id: postToShare.id,
        name: postToShare.name,
        avatar: postToShare.avatar,
        action: postToShare.action,
        hike: postToShare.hike,
        description: postToShare.description,
        time: postToShare.time,
        stats: postToShare.stats,
        photo: postToShare.photo,
        likes: postToShare.likes || [],
        comments: postToShare.comments || [],
      };
    }

    // Optimistic share object
    const tempShare = {
      id: Math.random().toString(36).substr(2, 9),
      type: "share",
      original: originalData,
      userId: user.uid,
      name: user.displayName || user.email,
      avatar: user.displayName?.[0] || user.email?.[0] || "?",
      created_at: new Date().toISOString(),
      likes: [],
      comments: [],
      shareCaption: shareCaption.trim(),
    };

    // Optimistic UI update
    setRecentActivity((prev) => [tempShare, ...prev]);
    setShareModalOpen(false);
    setPostToShare(null);
    setShareCaption('');

    try {
      // ✅ use service function instead of fetch
      const data = await shareFeed(postToShare.id, {
        sharerId: user.uid,
        sharerName: user.displayName || user.email,
        sharerAvatar: tempShare.avatar,
        original: originalData,
        caption: shareCaption.trim(),
      });

      // Replace temp with persisted version (backend returns either `id` or `newActivityId`)
      const returnedId = data.id || data.newActivityId || null;
      setRecentActivity((prev) =>
        prev.map((a) => (a.id === tempShare.id ? { ...a, id: returnedId, ...data } : a))
      );
      // Notify user of success
      toast({ title: 'Post shared', description: 'Your post was shared to your feed.' });
    } catch (err) {
      console.error("Failed to share:", err);
      // rollback optimistic
      setRecentActivity((prev) => prev.filter((a) => a.id !== tempShare.id));
      toast({ title: 'Share failed', description: 'Could not share the post. Please try again.', variant: 'destructive' });
    }
  };

  const handleDeletePost = async (activityId) => {
    // Optimistic UI update: remove the post locally first
    const prevActivity = [...recentActivity];
    setRecentActivity(prev => prev.filter(a => a.id !== activityId));

    try {
      // Call a backend/service function to delete the post
      await deleteFeed(activityId); // <-- you need to implement this in services/feed.js
      toast({ title: 'Post deleted', description: 'The post has been removed.' });
    } catch (err) {
      console.error("Failed to delete post:", err);
      // Rollback if deletion fails
      setRecentActivity(prevActivity);
      toast({ title: 'Delete failed', description: 'Could not delete the post. Please try again.', variant: 'destructive' });
    }
  };

  // ---- Edit post handler ----
  const handleEditPost = async (activityId, updatedDescription) => {
    if (!updatedDescription.trim()) return;

    // keep previous list for rollback
    const prev = [...recentActivity];
    setEditingPost(null);

    // find activity to decide whether it's a share (edit caption) or original (edit description)
    const activity = recentActivity.find(a => a.id === activityId) || {};
    const isShare = activity.type === 'share';
    const payload = isShare
      ? { shareCaption: updatedDescription.trim() }
      : { description: updatedDescription.trim() };

    // Optimistic UI update
    setRecentActivity(curr => curr.map(a => a.id === activityId ? { ...a, ...(isShare ? { shareCaption: payload.shareCaption } : { description: payload.description }) } : a));

    try {
      const updated = await updateFeed(activityId, payload);

      // Replace activity with server-returned object (updated)
      setRecentActivity(curr => curr.map(a => (a.id === activityId ? { ...a, ...updated } : a)));
      toast({ title: 'Post updated', description: 'Your changes were saved.' });
    } catch (err) {
      console.error('Failed to update post:', err);
      // rollback
      setRecentActivity(prev);
      toast({ title: 'Update failed', description: 'Could not save changes. Please try again.' });
    }
  };


  

  // helper to format ISO timestamps to relative times (e.g., '5m', '2h')
  const timeAgo = (iso) => {
    if (!iso) return 'Just now';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 5) return 'Just now';
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  // Render nested original/share chains recursively
  const renderOriginal = (orig, depth = 0) => {
    if (!orig) return null;
    // guard against too deep recursion
    if (depth > 5) return null;

    if (orig.type === 'share') {
      return (
        <div className="space-y-3">
              <div className="p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-8 w-8 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleViewProfile(orig.userId || orig.uid || orig.id); }}>
                <AvatarFallback className="bg-gradient-trail text-primary-foreground">{orig.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm">
                  <span className="font-medium text-foreground cursor-pointer" onClick={(e) => { e.stopPropagation(); handleViewProfile(orig.userId || orig.uid || orig.id); }}>{orig.name}</span>{' '}
                  <span className="text-muted-foreground">shared</span>
                </p>
                <p className="text-xs text-muted-foreground">{timeAgo(orig.time || orig.created_at)}</p>
              </div>
            </div>
            {orig.shareCaption && <p className="text-sm italic">{orig.shareCaption}</p>}
          </div>

          {/* Render the nested original inside */}
          <div className="pl-4 border-l border-border">
            {renderOriginal(orig.original, depth + 1)}
          </div>
        </div>
      );
    }

    // Normal original — instead of navigating away, try to scroll to the original in-page
    return (
  <Card className="bg-card border-border/50 cursor-pointer" onClick={() => { if (orig.id) handleScrollToOriginal(orig.id); }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleViewProfile(orig.userId || orig.uid || orig.id); }}>
              <AvatarFallback className="bg-gradient-trail text-primary-foreground">{orig.avatar}</AvatarFallback>
            </Avatar>
              <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium text-foreground cursor-pointer" onClick={(e) => { e.stopPropagation(); handleViewProfile(orig.userId || orig.uid || orig.id); }}>{orig.name}</span>{' '}
                <span className="text-muted-foreground">{orig.action}</span>{' '}
                <span className="font-medium text-foreground">{orig.hike}</span>
              </p>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(orig.time || orig.created_at)}
                </p>
                <p className="text-xs text-muted-foreground">{orig.stats}</p>
              </div>
            </div>
          </div>

          {orig.description && <p className="text-sm text-foreground">{orig.description}</p>}
        </CardContent>
      </Card>
    );
  };


    // Scroll to an original activity in-page. If it's not present, fetch it and insert then scroll.
    const handleScrollToOriginal = async (origId) => {
      if (!origId) return;

      try {
        // If it's already loaded in the current feed, scroll to it
        const existing = recentActivity.find((a) => a.id === origId);
        if (existing) {
          const el = document.getElementById(`feed-item-${origId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedId(origId);
            setTimeout(() => setHighlightedId(null), 3000);
          }
          return;
        }

        // Otherwise fetch the single item from the backend and insert it near the top
        const fetched = await getFeedById(origId);
        const activity = fetched && fetched.data ? fetched.data : fetched;
        if (!activity) throw new Error('Original not found');

        setRecentActivity((prev) => {
          // avoid duplicates
          if (prev.some((p) => p.id === activity.id)) return prev;
          return [activity, ...prev];
        });

        // wait a brief moment for DOM to update, then scroll
        setTimeout(() => {
          const el = document.getElementById(`feed-item-${activity.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedId(activity.id);
            setTimeout(() => setHighlightedId(null), 3000);
          }
        }, 150);
      } catch (err) {
        console.error('Failed to fetch original post:', err);
        toast({ title: 'Could not find original', description: 'The original post could not be loaded.' });
      }
    };


  useEffect(() => {
    if (!auth?.currentUser) return;
    const loadSuggestions = async () => {
      try {
        setLoading(true);
        const data = await discoverFriends();
        console.log("suggestion :", data)
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSuggestions();

    // load incoming friend requests for current user
    const loadIncoming = async () => {
      try {
        const reqs = await getIncomingRequests();
        setIncomingRequests(reqs || []);
      } catch (err) {
        console.error('Failed to load incoming requests:', err);
      }
    };
    loadIncoming();
  }, [auth?.currentUser]);




  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Friends & Community</h1>
          <p className="text-muted-foreground">Connect with fellow hikers and share your adventures.</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 " />
          <Input
            placeholder="Search for friends or hikers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>

        {searchError && <p className="text-red-500 mt-2">{searchError}</p>}
        {searchResults.map((user) => (
          <Card
            key={user.id}
            className="relative flex flex-col sm:flex-row gap-3 items-start mt-4 mb-4"
          >
            {/* Close button */}
            <button
              onClick={() => setSearchResults(searchResults.filter(u => u.id !== user.id))}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-xl">
                      {user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-semibold text-foreground cursor-pointer hover:underline"
                        onClick={() => {
                          const isFriend = friends.some((f) => f.id === user.id);
                          handleViewProfile(user, !isFriend); // showAddFriend = false if already friend
                        }}
                      >
                        {user.displayName}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.location || "Not yet set"}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </div>
          </Card>
        ))}



  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">My Friends</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>
          {/*MY FRIENDS */}
          <TabsContent value="friends" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
                <Card key={friend.id} className="bg-card border-border shadow-elevation">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-trail text-white text-l">
                          {friend.displayName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{friend.displayName}</h3>
                          <div className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {friend.location || "Not yet set"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-summit">{friend.totalHikes}</p>
                        <p className="text-xs text-muted-foreground">Hikes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-forest">{friend.totalDistance} km</p>
                        <p className="text-xs text-muted-foreground">Distance</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mountain className="h-4 w-4 text-trail" />
                        <span className="text-muted-foreground">Last hike:</span>
                      </div>
                      <p className="text-sm font-medium">{friend.lastHike}</p>
                      <p className="text-xs text-muted-foreground">{friend.lastHikeDate}</p>
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      <Medal className="h-3 w-3 mr-1" />
                      {friend.recentAchievement}
                    </Badge>

                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => handleViewProfile(friend)}
                    >
                      View Profile
                    </Button>

                    <Button
                      className="w-full bg-gradient-trail text-primary-foreground hover:opacity-90"
                      size="sm"
                      onClick={() => handleBlockFriend(friend.id)}
                    >
                      Block Friend
                    </Button>

                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/*ACTIVITY FEED*/}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-card border-border shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-forest" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Incoming friend requests */}
                  {incomingRequests && incomingRequests.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Friend requests</h4>
                      {incomingRequests.map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-2 border border-border rounded">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-trail text-primary-foreground">{r.fromAvatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{r.fromName}</div>
                              <div className="text-xs text-muted-foreground">Requested you</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={async (e) => { e.stopPropagation(); try { await respondToRequest(r.id, 'accept'); setIncomingRequests(prev => prev.filter(x => x.id !== r.id)); toast({ title: 'Friend added', description: `${r.fromName} is now your friend.` }); } catch (err) { console.error(err); toast({ title: 'Accept failed', description: 'Could not accept request.', variant: 'destructive' }); } }}>Accept</Button>
                            <Button size="sm" variant="outline" onClick={async (e) => { e.stopPropagation(); try { await respondToRequest(r.id, 'decline'); setIncomingRequests(prev => prev.filter(x => x.id !== r.id)); toast({ title: 'Request declined', description: `You declined ${r.fromName}` }); } catch (err) { console.error(err); toast({ title: 'Decline failed', description: 'Could not decline request.', variant: 'destructive' }); } }}>Decline</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {recentActivity.map((activity) => {
                    const isOwnPost = activity.userId === auth.currentUser.uid;

            return (
              <Card id={`feed-item-${activity.id}`} key={activity.id} className={`bg-background border-border shadow-sm hover:shadow-md transition-shadow ${highlightedId === activity.id ? 'ring-2 ring-amber-300' : ''}`}>
                        <CardContent className="p-6">
                          {/* ---- If shared post ---- */}
                          {activity.type === "share" ? (
                            <>
                              {/* Share header */}
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar className="h-10 w-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleViewProfile(activity.userId || activity.id); }}>
                                  <AvatarFallback className="bg-gradient-trail text-primary-foreground">
                                    {activity.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm">
                                    <span className="font-semibold text-foreground cursor-pointer" onClick={(e) => { e.stopPropagation(); handleViewProfile(activity.userId || activity.id); }}>{activity.name}</span>{" "}
                                    <span className="text-muted-foreground">shared</span>{" "}
                                    <span className="font-medium text-foreground cursor-pointer" onClick={(e) => { e.stopPropagation(); handleViewProfile(activity.original?.userId || activity.original?.uid || activity.original?.id); }}>{activity.original.name}</span>'s post
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {timeAgo(activity.time || activity.created_at)}
                                  </p>
                                </div>
                                {isOwnPost && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingPost(activity.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeletePost(activity.id)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Share caption */}
                              {activity.shareCaption && (
                                <div className="mb-4 p-3 border border-border rounded-lg">
                                  <p className="text-sm text-foreground italic">{activity.shareCaption}</p>
                                </div>
                              )}

                              {/* Original post preview (supports nested shares) */}
                              {renderOriginal(activity.original)}
                            </>
                          ) : (
                            /* ---- Normal post ---- */
                            <>
                              <div className="flex items-center gap-3 mb-4">
                                <Avatar
                                  className="h-12 w-12 cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); handleViewProfile(activity.userId || activity.id); }}
                                >
                                  <AvatarFallback className="bg-gradient-trail text-primary-foreground text-lg">
                                    {activity.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm">
                                    <span
                                      className="font-semibold text-foreground cursor-pointer hover:underline"
                                      onClick={() => handleViewProfile(activity.userId || activity.id)}
                                    >
                                      {activity.name}
                                    </span>
                                    <span className="text-muted-foreground"> {activity.action} </span>
                                    <span className="font-medium text-foreground">{activity.hike}</span>
                                  </p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {timeAgo(activity.time || activity.created_at)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{activity.stats}</p>
                                    {activity.photo && (
                                      <Badge variant="outline" className="text-xs">
                                        <Camera className="h-3 w-3 mr-1" />
                                        Photo
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {isOwnPost && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingPost(activity.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeletePost(activity.id)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Description */}
                              {activity.description && (
                                <div className="mb-4">
                                  <p className="text-sm text-foreground leading-relaxed">{activity.description}</p>
                                </div>
                              )}
                            </>
                          )}

                          {/* Actions (Like, Comment, Share) */}
                          <div className="flex items-center gap-6 pt-4 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(activity)}
                              className={`flex items-center gap-2 h-8 px-3 ${activity.likes?.includes(auth.currentUser.uid) ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              <Heart
                                className={`h-4 w-4 ${activity.likes?.includes(auth.currentUser.uid) ? "text-red-500 fill-red-500" : ""}`}
                              />
                              {activity.likes?.length || 0}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setExpandedComments((prev) => ({
                                  ...prev,
                                  [activity.id]: !prev[activity.id],
                                }))
                              }
                              className="flex items-center gap-2 h-8 px-3 text-muted-foreground hover:text-foreground"
                            >
                              <MessageSquare className="h-4 w-4" />
                              {commentsMap[activity.id]?.length || activity.comments?.length || 0}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(activity)}
                              className="flex items-center gap-2 h-8 px-3 text-muted-foreground hover:text-foreground"
                            >
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                          </div>

                          {/* Comments */}
                          {expandedComments[activity.id] && (
                            <div className="mt-4 pt-4 border-t border-border space-y-3">
                              {(activity.comments || []).map((comment) => (
                                <div
                                  key={comment.id}
                                  className="flex items-start justify-between gap-3"
                                >
                                  <div className="flex items-start gap-2 flex-1">
                                    <Avatar className="h-6 w-6 mt-0.5">
                                      <AvatarFallback className="bg-gradient-trail text-primary-foreground text-xs">
                                        {(comment.name || comment.email)?.[0]?.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-foreground">
                                        {comment.name || comment.email}
                                      </p>
                                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                                    </div>
                                  </div>
                                  {comment.userId === auth.currentUser.uid && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(activity.id, comment.id)}
                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}

                              <div className="flex gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gradient-trail text-primary-foreground text-xs">
                                    {(auth.currentUser?.displayName || auth.currentUser?.email)?.[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <Textarea
                                  placeholder="Add a comment..."
                                  className="flex-1 min-h-[40px] resize-none"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddComment(activity.id, e.target.value);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Edit Post Modal */}
                          {editingPost === activity.id && (
                            <Dialog open={editingPost === activity.id} onOpenChange={() => setEditingPost(null)}>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Post</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    defaultValue={activity.type === 'share' ? activity.shareCaption || '' : activity.description || ''}
                                    placeholder={activity.type === 'share' ? "Edit your share caption..." : "Describe your adventure..."}
                                    className="min-h-[100px]"
                                    id={`edit-description-${activity.id}`}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingPost(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const textarea = document.getElementById(`edit-description-${activity.id}`);
                                        handleEditPost(activity.id, textarea.value);
                                      }}
                                    >
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                    {/* Load more button */}
                    {hasMore && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={loadNextPage}
                          className="px-4 py-2 text-sm text-foreground hover:underline focus:outline-none"
                          aria-label="Load more feeds"
                        >
                          {loadingMore ? 'Loading...' : 'Load more'}
                        </button>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* DISCOVER */}
          <TabsContent value="discover" className="space-y-6">
            <Card className="bg-card border-border shadow-elevation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-sky" />
                  Suggested Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-muted-foreground text-sm">Loading suggestions...</p>
                  ) : suggestions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No suggestions at the moment.</p>
                  ) : (
                    suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/80 transition-colors cursor-pointer"
                        onClick={() => handleViewProfile(suggestion.id, true)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-trail text-primary-foreground">{suggestion.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-foreground">{suggestion.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.mutualFriends} mutual friends
                            </p>
                            <div className="flex gap-1 mt-1">
                              {suggestion.commonTrails.map((trail) => (
                                <Badge key={trail} variant="outline" className="text-xs">
                                  {trail}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          className="bg-gradient-trail text-primary-foreground"
                          disabled={suggestion._requestSent}
                          onClick={async (e) => {
                            e.stopPropagation(); // don't open profile modal
                            try {
                              // send friend request (new API)
                              const resp = await sendFriendRequest(suggestion.id);
                              // mark locally as requested so UI shows 'Request Sent'
                              setSuggestions(prev => prev.map(s => s.id === suggestion.id ? { ...s, _requestSent: true, _requestId: resp.requestId } : s));
                              toast({ title: 'Friend request sent', description: `A request was sent to ${suggestion.name}.` });
                            } catch (err) {
                              console.error("Failed to send friend request:", err);
                              toast({ title: 'Request failed', description: 'Could not send friend request. Please try again.', variant: 'destructive' });
                            }
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {suggestion._requestSent ? 'Request Sent' : 'Add Friend'}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {postToShare && (
              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-trail text-primary-foreground">{postToShare.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{postToShare.name}</p>
                    <p className="text-xs text-muted-foreground">{postToShare.action} {postToShare.hike}</p>
                  </div>
                </div>
                {postToShare.description && (
                  <p className="text-sm text-muted-foreground">{postToShare.description}</p>
                )}
              </div>
            )}
            <Textarea
              placeholder="Add a caption to your share..."
              value={shareCaption}
              onChange={(e) => setShareCaption(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShareModalOpen(false);
                  setPostToShare(null);
                  setShareCaption('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={confirmShare}>
                Share Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileView
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        person={selectedProfile}
        showAddFriend={selectedProfile?.showAddFriend || false}
      />
    </div>
  );
};

export default Friends;
