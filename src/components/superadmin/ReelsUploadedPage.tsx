'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Download } from 'lucide-react';


// 🧩 Reusable Stat Card Component
const StatCard = ({ title, value, color }: {title: string, value: string | number, color: string}) => (
  <motion.div 
    className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-5 text-center"
    whileHover={{ y: -5 }}
  >
    <p className={`font-semibold text-sm mb-1 ${color}`}>{title}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </motion.div>
);

const ReelsUploadedPage = () => {
  // Filters and search states
  const [filters, setFilters] = useState({ campaign: '', uploader: '', dateRange: '', status: '', search: '' });
  // Data states
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ today: 12, week: 89, month: 340, allTime: 1250, successRate: 98 });
  const [alerts, setAlerts] = useState([{type: 'error', message: 'Upload failed for Reel ID: 45AB-12_C. Please review.'}]);

  // Dummy data, as we are not connecting to DB
  const filteredReels = [
      { id: '123-ABC', campaignName: 'Summer Sale', uploaderName: 'Ravi Kumar', uploadDate: new Date().toISOString(), status: 'approved' },
      { id: '456-DEF', campaignName: 'Diwali Dhamaka', uploaderName: 'Sunita Sharma', uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
      { id: '789-GHI', campaignName: 'New Launch', uploaderName: 'Ravi Kumar', uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'rejected' },
  ];

  const inputStyle = "w-full p-3 bg-white/50 border border-slate-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder:text-slate-500";

  return (
    <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Reels Uploaded Dashboard</h1>
        <p className="text-slate-500 mt-1">Track, filter, and analyze all uploaded reels performance.</p>
      </div>

      <motion.section 
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StatCard title="Today" value={summary.today} color="text-blue-600" />
        <StatCard title="This Week" value={summary.week} color="text-green-600" />
        <StatCard title="This Month" value={summary.month} color="text-purple-600" />
        <StatCard title="All Time" value={summary.allTime} color="text-pink-600" />
        <StatCard title="Success Rate" value={`${summary.successRate}%`} color="text-yellow-600" />
      </motion.section>

      {alerts.length > 0 && (
        <section className="space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${
                alert.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-800' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-800'
              }`}
            >
              <div className="flex items-center"><span className="mr-2"><AlertTriangle/></span>{alert.message}</div>
            </div>
          ))}
        </section>
      )}

      {/* LAYOUT CHANGE: फ़िल्टर और टेबल को एक ही ग्लास पैनल में डाल दिया गया है */}
      <motion.section 
        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Filters Section now inside the main panel */}
        <div className="pb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input type="text" placeholder="Search Reel ID / Account" className={inputStyle} value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}/>
                <input type="text" placeholder="Filter by Campaign" className={inputStyle} value={filters.campaign} onChange={(e) => setFilters(f => ({ ...f, campaign: e.target.value }))}/>
                <input type="text" placeholder="Filter by Uploader" className={inputStyle} value={filters.uploader} onChange={(e) => setFilters(f => ({ ...f, uploader: e.target.value }))}/>
                <input type="date" className={inputStyle} value={filters.dateRange} onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value }))}/>
                <select className={inputStyle} value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Status</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
        </div>

        {/* Separator */}
        <hr className="border-slate-300/50 my-2" />

        {/* Table View Section */}
        <div className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Reels Uploads ({filteredReels.length})</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                <span className="mr-1"><Download /></span> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-300/50">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Reel ID</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Campaign</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Uploader</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Date & Time</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300/50">
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div></td></tr>
                  ) : filteredReels.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-slate-500">No reels match your filters.</td></tr>
                  ) : (
                    filteredReels.map((reel) => (
                      <tr key={reel.id} className="hover:bg-white/30 transition-colors">
                        <td className="p-3 font-mono text-xs text-slate-800">{reel.id.slice(0, 8)}...</td>
                        <td className="p-3 text-slate-700">{reel.campaignName || '—'}</td>
                        <td className="p-3 text-slate-700">{reel.uploaderName || '—'}</td>
                        <td className="p-3 text-slate-700">{reel.uploadDate ? new Date(reel.uploadDate).toLocaleString('en-IN') : '—'}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              ['success', 'approved'].includes(reel.status) ? 'bg-green-500/10 text-green-700' :
                              ['failed', 'error', 'rejected'].includes(reel.status) ? 'bg-red-500/10 text-red-700' : 'bg-yellow-500/10 text-yellow-700'
                          }`}>{reel.status || 'pending'}</span>
                        </td>
                        <td className="p-3"><button className="text-indigo-600 hover:underline text-sm font-medium">View Details</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </motion.section>

      {/* Analytics Section - Placeholders */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Daily Upload Trend', icon: '📊' },
          { title: 'Top 5 Uploaders', icon: '🏆' },
          { title: 'Campaign Distribution', icon: '🥧' },
        ].map((item, index) => (
          <motion.div 
            key={item.title} 
            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-300/70 shadow-lg shadow-slate-200/80 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <h3 className="font-bold text-slate-900 mb-4">{item.title}</h3>
            <div className="h-48 bg-white/30 rounded-lg flex items-center justify-center text-slate-400">
              <div className="text-center"><div className="text-4xl mb-2">{item.icon}</div><p>Graph coming soon</p></div>
            </div>
          </motion.div>
        ))}
      </section>
    </motion.div>
  );
};

export default ReelsUploadedPage;
