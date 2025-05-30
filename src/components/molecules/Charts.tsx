"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

export default function DashboardCharts() {
  return (
    <div className="bg-white/10 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-white">Task Completion Rate</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="name" stroke="#CBD5E0" />
          <YAxis stroke="#CBD5E0" />
          <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="pv" fill="#4299E1" />
          <Bar dataKey="uv" fill="#48BB78" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 