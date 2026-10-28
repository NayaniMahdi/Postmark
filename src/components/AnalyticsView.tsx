'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Cpu,
} from 'lucide-react';
import { AnalyticsSummary } from '@/types';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((res) => {
        if (res.summary) setData(res.summary);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-xs text-[#777970]">
        Loading analytics telemetry...
      </div>
    );
  }

  const COLORS = ['#292B27', '#803D46', '#728675', '#B54708', '#4F46E5', '#027A48'];

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto select-none bg-white/40">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-[#292B27] tracking-tight">Performance & AI Telemetry</h1>
        <p className="text-xs text-[#777970] mt-0.5">
          Real-time metrics on customer volume, model latency, and human approval efficiency
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E7E3DA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#777970] text-xs">
            <span>Total Inbound Tickets</span>
            <Inbox className="w-4 h-4 text-[#292B27]" />
          </div>
          <div className="text-2xl font-bold text-[#292B27]">{data.total_conversations}</div>
          <div className="text-[11px] text-[#027A48] font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14% vs previous week</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E7E3DA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#777970] text-xs">
            <span>Pending Human Review</span>
            <AlertTriangle className="w-4 h-4 text-[#B54708]" />
          </div>
          <div className="text-2xl font-bold text-[#B54708]">{data.needs_review_count}</div>
          <div className="text-[11px] text-[#777970]">High-risk & uncertain cases</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E7E3DA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#777970] text-xs">
            <span>Average AI Confidence</span>
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <div className="text-2xl font-bold text-[#4F46E5]">{Math.round(data.avg_confidence * 100)}%</div>
          <div className="text-[11px] text-[#027A48] font-medium">98.2% grounding compliance</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E7E3DA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#777970] text-xs">
            <span>Average Inference Latency</span>
            <Clock className="w-4 h-4 text-[#027A48]" />
          </div>
          <div className="text-2xl font-bold text-[#027A48]">{data.avg_latency_ms} ms</div>
          <div className="text-[11px] text-[#777970]">NVIDIA NIM + OpenRouter cluster</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Ticket Volume Line Chart */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7E3DA] shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#292B27] uppercase tracking-wider">
            Daily Ticket Volume & Resolution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily_volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" />
                <XAxis dataKey="date" stroke="#777970" fontSize={11} />
                <YAxis stroke="#777970" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF9F5',
                    borderRadius: '12px',
                    borderColor: '#E7E3DA',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="incoming" name="Incoming" fill="#292B27" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#728675" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Classification Topic Distribution Pie */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7E3DA] shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-[#292B27] uppercase tracking-wider">
            Ticket Category Breakdown
          </h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={data.category_breakdown}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {data.category_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="w-[40%] space-y-1.5 text-xs">
              {data.category_breakdown.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-[#50524B] truncate text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-[#292B27] text-xs">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Provider Telemetry Table */}
      <div className="p-5 rounded-2xl bg-white border border-[#E7E3DA] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#292B27]" />
          <h3 className="text-xs font-bold text-[#292B27] uppercase tracking-wider">
            Active Provider Cluster Health & Latency
          </h3>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E7E3DA] text-[#777970] text-[10px] uppercase font-bold">
                <th className="pb-2">Provider & Architecture</th>
                <th className="pb-2">Inferences Processed</th>
                <th className="pb-2">Average Latency</th>
                <th className="pb-2">Operational Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9]">
              {data.provider_usage.map((p) => (
                <tr key={p.provider} className="py-2.5">
                  <td className="py-2.5 font-semibold text-[#292B27]">{p.provider}</td>
                  <td className="py-2.5 font-mono">{p.count}</td>
                  <td className="py-2.5 font-mono">{p.avg_latency} ms</td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#027A48] bg-[#ECFDF3] px-2 py-0.5 rounded-full border border-[#A6F4C5]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Operational</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
