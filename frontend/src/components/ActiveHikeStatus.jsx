import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Play, Pause, Clock, Mountain } from "lucide-react";

const ActiveHikeStatus = ({ activeHike, onResume }) => {
  if (!activeHike) return null;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Hike in Progress
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(activeHike.elapsedTime || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mountain className="h-4 w-4" />
                <span>{(activeHike.currentDistance || 0).toFixed(1)} mi</span>
              </div>
              {activeHike.title && (
                <span className="font-medium">{activeHike.title}</span>
              )}
            </div>
          </div>
          
          <Button 
            onClick={onResume} 
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {activeHike.isPaused ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Continue
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveHikeStatus;
