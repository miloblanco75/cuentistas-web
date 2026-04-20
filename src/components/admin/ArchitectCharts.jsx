"use client";

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';

const COLORS = ['#d4af37', '#8b5cf6', '#ff4444', '#1098ad'];

export function HouseDistributionChart({ data }) {
  if (typeof window === "undefined") return null;
  const chartData = data?.map(item => ({
    name: item.casa || "Sin Casa",
    value: item._count.id
  })) || [];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#050508', border: '1px solid #d4af37', fontSize: '10px' }}
            itemStyle={{ color: '#d4af37' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityChart({ data }) {
  if (typeof window === "undefined") return null;
  // Mocking activity if real data is missing for now
  const chartData = [
    { name: '00:00', users: 12 },
    { name: '04:00', users: 5 },
    { name: '08:00', users: 28 },
    { name: '12:00', users: 45 },
    { name: '16:00', users: 62 },
    { name: '20:00', users: 38 },
  ];

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
            <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
            </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="name" stroke="#d4af3760" fontSize={10} />
          <YAxis stroke="#d4af3760" fontSize={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#050508', border: '1px solid #d4af37', fontSize: '10px' }}
            itemStyle={{ color: '#d4af37' }}
          />
          <Area type="monotone" dataKey="users" stroke="#d4af37" fillOpacity={1} fill="url(#colorUsers)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
