import React, { useEffect, useState } from "react";
import { achievementApiService } from "../services/achievementApiService";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export default function StatsOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await achievementApiService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error loading stats:', error);
        // Set default stats on error
        setStats({
          totalHikes: 0,
          totalDistance: 0,
          totalDuration: 0,
          currentStreak: 0,
          badges: 0,
          completedBadges: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <p>Loading stats...</p>;
  if (!stats) return <p>No stats available</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader><CardTitle>Total Hikes</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{stats.totalHikes}</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Total Distance</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{stats.totalDistance} km</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Total Duration</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{Math.round(stats.totalDuration / 60)}h {stats.totalDuration % 60}m</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Current Streak</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{stats.currentStreak} days</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Badges Earned</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{stats.completedBadges || 0}</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Average Distance</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{stats.averageDistance} km</CardContent>
      </Card>
    </div>
  );
}
