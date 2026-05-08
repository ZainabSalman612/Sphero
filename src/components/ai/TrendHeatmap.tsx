"use client";

import { useSearchStore } from "@/stores/searchStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getPlatformColor } from "@/lib/utils";

export function TrendHeatmap() {
  const { platformHeat, hasSearched } = useSearchStore();

  if (!hasSearched || platformHeat.length === 0) return null;

  // Sort and take top 5
  const data = [...platformHeat]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => ({
      name: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
      count: item.count,
      platform: item.platform,
      intensity: item.intensity
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 border border-white/10 text-sm">
          <p className="font-medium text-white mb-1">{payload[0].payload.name}</p>
          <p className="text-[var(--color-sphero-text-secondary)]">
            Mentions: <span className="text-white font-medium">{payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-xl mt-1">
            {"🔥".repeat(payload[0].payload.intensity)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--color-sphero-text-secondary)', fontSize: 12 }} 
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPlatformColor(entry.platform)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
