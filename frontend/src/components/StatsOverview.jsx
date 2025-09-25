import React, { useEffect, useState } from "react";
import { hikeApiService } from "../services/hikeApiService";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export default function StatsOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    hikeApiService.getHikeStats()
      .then((res) => setStats(res.data)) // res.data because your service wraps response
      .catch(console.error);
  }, []);

  if (!stats) return <p>Loading stats...</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader><CardTitle>Total Hikes</CardTitle></CardHeader>
        <CardContent>{stats.totalHikes}</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Total Distance</CardTitle></CardHeader>
        <CardContent>{stats.totalDistance} km</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Total Duration</CardTitle></CardHeader>
        <CardContent>{stats.totalDuration} mins</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Current Streak</CardTitle></CardHeader>
        <CardContent>{stats.streak} days</CardContent>
      </Card>
    </div>
  );
}
