'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartData {
  title: string
  revenue: number
  payout: number
}

export default function EarningsChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available for chart.</div>
  }

  return (
    <div className="h-96 w-full text-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
          <XAxis 
            dataKey="title" 
            angle={-45} 
            textAnchor="end" 
            height={80} 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            tickMargin={10}
            stroke="#4b5563"
          />
          <YAxis 
            tickFormatter={(value) => `₹${value}`} 
            tick={{ fill: '#6b7280' }} 
            stroke="#4b5563"
            width={80}
          />
          <Tooltip 
            formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']}
            labelStyle={{ color: '#111827' }}
            cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
          />
          <Bar dataKey="revenue" fill="#6366f1" name="Total Revenue" radius={[4, 4, 0, 0]} />
          <Bar dataKey="payout" fill="#10b981" name="Host Payout" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
