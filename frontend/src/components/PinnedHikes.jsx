import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Pin, 
  MapPin, 
  Clock, 
  Mountain, 
  Calendar,
  ExternalLink,
  PinOff
} from 'lucide-react';

// Sample pinned hikes data - this would come from props/API in real implementation
const samplePinnedHikes = [
  {
    id: 1,
    title: "Mount Washington Summit",
    location: "White Mountains, NH",
    date: "2024-08-05",
    distance: "12.4 mi",
    elevation: "4,322 ft",
    duration: "6h 30m",
    difficulty: "Hard",
    notes: "Incredible views from the summit! Weather was perfect, saw amazing sunrise.",
    pinnedAt: "2024-08-06"
  },
  {
    id: 2,
    title: "Bear Mountain Trail",
    location: "Harriman State Park, NY",
    date: "2024-07-22",
    distance: "5.8 mi",
    elevation: "1,284 ft",
    duration: "3h 45m",
    difficulty: "Moderate",
    notes: "Great family-friendly hike. Spotted some wildlife on the way down.",
    pinnedAt: "2024-07-23"
  }
];

const PinnedHikes = ({ pinnedHikes = samplePinnedHikes, onUnpinHike, onViewDetails }) => {
  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-meadow/20 text-forest border-meadow',
      Moderate: 'bg-trail/20 text-foreground border-trail',
      Hard: 'bg-summit/20 text-foreground border-summit',
    };
    return colors[difficulty] || 'bg-muted text-muted-foreground';
  };

  if (!pinnedHikes || pinnedHikes.length === 0) {
    return (
      <Card className="bg-card border-border shadow-elevation">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5 text-yellow-600" />
            Pinned Hikes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Pin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No pinned hikes yet</p>
            <p className="text-sm">Pin your favorite hikes from the logbook to see them here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-elevation">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pin className="h-5 w-5 text-yellow-600" />
          Pinned Hikes ({pinnedHikes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pinnedHikes.map((hike) => (
            <div key={hike.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{hike.title}</h4>
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{hike.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="secondary"
                      className={`text-xs ${getDifficultyColor(hike.difficulty)}`}
                    >
                      {hike.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Pinned {hike.pinnedAt}
                    </span>
                  </div>
                </div>
                {onUnpinHike && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50"
                    onClick={() => onUnpinHike(hike.id)}
                  >
                    <PinOff className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="flex items-center text-sm">
                  <Mountain className="h-3 w-3 mr-1 text-forest" />
                  <div>
                    <div className="font-medium text-foreground text-xs">{hike.distance}</div>
                    <div className="text-muted-foreground text-xs">Distance</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Mountain className="h-3 w-3 mr-1 text-trail" />
                  <div>
                    <div className="font-medium text-foreground text-xs">{hike.elevation}</div>
                    <div className="text-muted-foreground text-xs">Elevation</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1 text-summit" />
                  <div>
                    <div className="font-medium text-foreground text-xs">{hike.duration}</div>
                    <div className="text-muted-foreground text-xs">Duration</div>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-3 w-3 mr-1 text-stone" />
                  <div>
                    <div className="font-medium text-foreground text-xs">{hike.date}</div>
                    <div className="text-muted-foreground text-xs">Date</div>
                  </div>
                </div>
              </div>

              {hike.notes && (
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-xs text-muted-foreground italic">"{hike.notes}"</p>
                </div>
              )}

              <div className="flex justify-end mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-forest hover:text-forest hover:bg-muted"
                  onClick={() => onViewDetails && onViewDetails(hike)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PinnedHikes;
