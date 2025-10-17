import React, { useEffect, useState } from 'react';
import { achievementApiService } from '../services/achievementApiService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export default function ProgressCharts() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const response = await achievementApiService.getProgress();
        setProgress(response.data);
      } catch (error) {
        console.error('Error loading progress data:', error);
        // Set empty data structure on error
        setProgress({
          hikesPerMonth: [],
          distanceOverTime: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  if (!progress) return <p>Loading progress...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Hikes per Month Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hikes Per Month</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progress.hikesPerMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Streak History Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Streak History</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progress.streakHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="streak" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
