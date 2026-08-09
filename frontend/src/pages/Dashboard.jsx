import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieIcon, Activity, CheckCircle2, AlertTriangle, Leaf, Calendar } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getDashboardStats, getImageUrl } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="text-center py-16 text-slate-500 text-xs">
        Loading analytics dashboard...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 py-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
          <BarChart3 className="w-8 h-8 text-emerald-400" />
          <span>System Analytics Dashboard</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Real-time metrics and pathology statistics extracted from SQLite detection database
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Scans</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.totalScans}</div>
          <p className="text-[11px] text-slate-400">Total leaf images analyzed</p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Healthy Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.healthyRate}%</div>
          <p className="text-[11px] text-slate-400">{stats.healthyCount} normal leaf scans</p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Diseased Cases</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{stats.diseasedCount}</div>
          <p className="text-[11px] text-slate-400">Pathology detected</p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">System Model</span>
            <Leaf className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-white">RGB+HSV+GLCM</div>
          <p className="text-[11px] text-teal-400 font-mono">SVM / Random Forest</p>
        </div>

      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pie Chart: Disease Distribution */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            <span>Disease Category Breakdown</span>
          </h3>

          {stats.distribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.distribution}
                    dataKey="count"
                    nameKey="disease"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ disease, count }) => `${disease}: ${count}`}
                  >
                    {stats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              No distribution data available yet.
            </div>
          )}
        </div>

        {/* Bar Chart: Frequency */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Pathology Frequency</span>
          </h3>

          {stats.distribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="disease" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              No frequency data available yet.
            </div>
          )}
        </div>

      </div>

      {/* Recent Scans Log */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Recent Scans</span>
        </h3>

        {stats.recentScans.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {stats.recentScans.map((scan) => (
              <div key={scan.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={getImageUrl(`/api/uploads/${scan.image_name}`)}
                      alt={scan.prediction}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{scan.prediction}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{scan.original_filename}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-semibold block">{scan.confidence.toFixed(1)}%</span>
                  <span className="text-slate-500 text-[10px]">{new Date(scan.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No recent scans logged.</p>
        )}
      </div>

    </div>
  );
}
