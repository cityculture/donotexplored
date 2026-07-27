'use client'

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { useState, useEffect } from 'react'

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308']

export function RevenueChart({ data }: { data: any[] }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.4} />
          <XAxis 
            dataKey="snapshot_date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            dy={10}
            tickFormatter={(value: any) => isMounted && value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={(value: any) => `₹${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            labelFormatter={(label: any) => isMounted && label ? new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' }) : ''}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="total_revenue" 
            stroke="#6366f1" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" strokeOpacity={0.4} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="category_name" 
            type="category" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }}
            width={100}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(243, 244, 246, 0.4)' }}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #e5e7eb' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20} animationDuration={1000}>
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
