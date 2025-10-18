import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Medal, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentAchievements = ({ achievements, loading }) => {
  const navigate = useNavigate();

  // Format date helper
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Recently';
    
    try {
      let date;
      // Handle Firestore Timestamp
      if (dateValue._seconds !== undefined) {
        date = new Date(dateValue._seconds * 1000);
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) return 'Recently';
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading achievements...</p>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No recent achievements</p>
        <p className="text-sm">Complete hikes to earn badges!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {achievements.map((achievement, index) => (
        <div
          key={achievement.id || index}
          className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/achievements?tab=badges')}
        >
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-foreground">
               {achievement.name || achievement.title || 'Achievement'}
              </h4>
              <Badge variant="secondary" className="flex-shrink-0">
                <Medal className="h-3 w-3 mr-1" />
                New
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {achievement.description}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Earned {formatDate(achievement.earnedDate)}</span>
            </div>
          </div>
        </div>
      ))}

      {/* View All Link */}
      <div className="text-center pt-2">
        <button
          onClick={() => navigate('/achievements?tab=completed')}
          className="text-sm text-forest hover:text-forest/80 font-medium underline"
        >
          View all achievements →
        </button>
      </div>
    </div>
  );
};

export default RecentAchievements;