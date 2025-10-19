import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Calendar, Mountain, Search } from 'lucide-react';
import { useTrails, getRandomTrails, formatTrailForDisplay } from '../services/externalTrailService';

const difficultyColors = {
  Easy: 'bg-meadow text-forest',
  Moderate: 'bg-trail text-primary-foreground',
  Hard: 'bg-destructive text-destructive-foreground',
  Expert: 'bg-stone text-primary-foreground',
};

export const LogbookSection = () => {
  const { trails, loading, error } = useTrails({ limit: 50 });
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [randomTrails, setRandomTrails] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);

  // Select 3 random trails when trails are loaded
  useEffect(() => {
    if (trails.length > 0 && !isSearching) {
      setRandomTrails(getRandomTrails(trails, 3));
    }
  }, [trails, isSearching]);

  // Client-side search function
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      setIsSearching(false);
      return;
    }

    // Filter trails based on search query
    const results = trails.filter(trail => {
      return (
        trail.name?.toLowerCase().includes(query) ||
        trail.description?.toLowerCase().includes(query) ||
        trail.difficulty?.toLowerCase().includes(query) ||
        trail.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });

    setFilteredTrails(results);
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setFilteredTrails([]);
  };

  // Determine which trails to display
  const displayTrails = isSearching ? filteredTrails : randomTrails;

  const formattedHikes = displayTrails.map(formatTrailForDisplay);

  return (
    <section id="logbook" className="py-20 bg-gradient-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Discover Amazing Trails
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore curated hiking trails and find your next adventure.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trails by name, difficulty, or tags..."
                className="px-4 py-2 border rounded-md w-full sm:w-80"
              />
              <Button type="submit" size="lg">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </form>

            {isSearching && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleClearSearch}
              >
                Clear Search
              </Button>
            )}
          </div>

          {/* View indicator */}
          {isSearching && (
            <p className="text-sm text-muted-foreground mb-4">
              Found {filteredTrails.length} trail{filteredTrails.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <Mountain className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading trails...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-2">Error loading trails: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        {!loading && !error && formattedHikes.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedHikes.map((hike) => (
              <Card
                key={hike.id}
                className="hover:shadow-elevation transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <CardTitle className="text-foreground">{hike.name}</CardTitle>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{hike.location}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={difficultyColors[hike.difficulty]}>
                      {hike.difficulty}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Mountain className="h-4 w-4 mr-1" />
                      {hike.elevation}
                    </div>
                    <div className="font-medium text-foreground">
                      {hike.distance}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm">{hike.notes}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && formattedHikes.length === 0 && (
          <div className="text-center py-12">
            <Mountain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No trails found
            </h3>
            <p className="text-muted-foreground">
              {isSearching 
                ? 'Try a different search term or clear your search to see random trails' 
                : 'No trails available at the moment'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};