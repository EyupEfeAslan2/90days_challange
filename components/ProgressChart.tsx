'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ProgressChartProps {
  logs: any[];
}

export default function ProgressChart({ logs }: ProgressChartProps) {
  // Verileri Hesapla
  const successCount = logs.filter(l => l.status === 'success').length;
  const failCount = logs.filter(l => l.status === 'fail').length;
  
  // Hiç veri yoksa
  if (successCount === 0 && failCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-xs">
        <span>Henüz Veri Yok</span>
      </div>
    );
  }

  const data = [
    { name: 'Başarılı', value: successCount, color: '#22c55e' }, // Green-500
    { name: 'Başarısız', value: failCount, color: '#ef4444' },   // Red-500
  ];

  const total = successCount + failCount;
  const successRate = Math.round((successCount / total) * 100);

  return (
    <div className="w-full h-52 relative bg-[#0f1115] border border-gray-800 rounded-2xl p-2 shadow-xl">
      <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center mt-2 border-b border-gray-800 pb-2 mx-4">
        BAŞARI ORANI
      </h2>
      
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={60}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: any) => [`${value} Gün`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Ortadaki Yüzde Yazısı */}
      <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className={`text-2xl font-black ${successRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
          %{successRate}
        </span>
      </div>
    </div>
  );
}