import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Sample data for charts - this would come from props/API in real implementation
const monthlyProgressData = [
  { month: 'Jan', distance: 45, elevation: 1200, hikes: 3 },
  { month: 'Feb', distance: 52, elevation: 1500, hikes: 4 },
  { month: 'Mar', distance: 38, elevation: 900, hikes: 2 },
  { month: 'Apr', distance: 67, elevation: 2100, hikes: 5 },
  { month: 'May', distance: 89, elevation: 2800, hikes: 6 },
  { month: 'Jun', distance: 76, elevation: 2400, hikes: 5 },
];

const achievementProgressData = [
  { name: 'Distance Walker', progress: 85, target: 100 },
  { name: 'Peak Collector', progress: 60, target: 100 },
  { name: 'Early Bird', progress: 100, target: 100 },
  { name: 'Endurance Master', progress: 40, target: 100 },
  { name: 'Trail Explorer', progress: 72, target: 100 },
];

const categoryData = [
  { name: 'Completed', value: 3, color: '#10b981' },
  { name: 'In Progress', value: 3, color: '#f59e0b' },
];

const ProgressCharts = () => {
  return (
    <div className="space-y-6">
      {/* Monthly Progress Chart */}
      <Card className="bg-card border-border shadow-elevation">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Monthly Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="distance"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Distance (km)"
              />
              <Area
                type="monotone"
                dataKey="elevation"
                stackId="2"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Elevation (m)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Achievement Progress Chart */}
      <Card className="bg-card border-border shadow-elevation">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Achievement Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={achievementProgressData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number"
                domain={[0, 100]}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                dataKey="name" 
                type="category"
                stroke="#6b7280"
                fontSize={12}
                width={120}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value, name) => [`${value}%`, 'Progress']}
              />
              <Bar 
                dataKey="progress" 
                fill="#8b5cf6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Achievement Status Pie Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Achievement Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hikes Over Time */}
        <Card className="bg-card border-border shadow-elevation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Hikes Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hikes"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress Overview */}
      <Card className="bg-card border-border shadow-elevation">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Goal Progress Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievementProgressData.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{goal.name}</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressCharts;
