import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFeedById } from '../services/feed';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useAuth } from '../contexts/AuthContext.jsx';

const Post = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getFeedById(id);
        if (mounted) setActivity(data);
      } catch (err) {
        console.error('Failed to load post', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!activity) return <div>Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/activity-feed"
        className="text-sm text-muted-foreground mb-4 inline-block"
      >
        ← Back to feed
      </Link>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gradient-trail text-white">
              {activity.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{activity.name}</h3>
            <p className="text-sm text-muted-foreground">
              {activity.time || activity.created_at}
            </p>
            {activity.type === 'share' && (
              <div className="mt-4">
                <p className="text-sm italic">{activity.shareCaption}</p>
                <div className="mt-3 border border-border rounded p-3">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(activity.original, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            {activity.type === 'original' && (
              <div className="mt-4">
                <p className="text-sm text-foreground">
                  {activity.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
