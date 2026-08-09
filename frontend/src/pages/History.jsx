import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Filter, FileText, Calendar, RefreshCw, Eye, X } from 'lucide-react';
import { getHistory, getHistoryDetail, getImageUrl, getReportUrl } from '../services/api';
import ResultCard from '../components/ResultCard';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchHistoryLogs = async () => {
    setLoading(true);
    try {
      const data = await getHistory(diseaseFilter, search);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryLogs();
  }, [diseaseFilter, search]);

  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    try {
      const detail = await getHistoryDetail(id);
      setSelectedItem({
        id: detail.id,
        imageName: detail.image_name,
        originalFilename: detail.original_filename,
        imageUrl: detail.image_url || `/api/images/${detail.image_name}`,
        prediction: detail.prediction,
        confidence: detail.confidence,
        severity: detail.severity,
        features: detail.features,
        diseaseInfo: detail.diseaseInfo
      });
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const diseasesList = ['All', 'Healthy', 'Alternaria Blight', 'Powdery Mildew', 'Downy Mildew', 'Anthracnose'];

  return (
    <div className="space-y-8 py-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <HistoryIcon className="w-8 h-8 text-emerald-400" />
            <span>Detection History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Persistent log of previous bitter gourd leaf scans stored in SQLite database
          </p>
        </div>

        <button
          onClick={fetchHistoryLogs}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all flex items-center space-x-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename or disease..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">Filter:</span>
          <select
            value={diseaseFilter}
            onChange={(e) => setDiseaseFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {diseasesList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

      </div>

      {/* History Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          Loading detection logs...
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Detection Records Found</h3>
          <p className="text-xs">Scan a bitter gourd leaf image on the Detect Disease page to populate history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => {
            const isHealthy = item.prediction === 'Healthy';
            const severityBg = isHealthy
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            const itemImgSrc = item.image_url || getImageUrl(item.imageUrl || `/api/images/${item.image_name}`);

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${severityBg}`}>
                      {item.severity}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 relative flex items-center justify-center">
                      <img
                        src={itemImgSrc}
                        alt={item.prediction}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-slate-900 flex-col items-center justify-center p-1 text-center text-[10px] text-slate-400 font-semibold">
                        Image unavailable
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white line-clamp-1">{item.prediction}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 font-mono">{item.original_filename}</p>
                      <div className="text-xs font-semibold text-emerald-400 mt-1">
                        Confidence: {item.confidence.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>


                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenDetail(item.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Detail</span>
                  </button>

                  <a
                    href={getReportUrl(item.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 border border-slate-800 text-xs font-semibold transition-all flex items-center justify-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Report</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail View */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <ResultCard result={selectedItem} onReset={() => setSelectedItem(null)} />
          </div>
        </div>
      )}

    </div>
  );
}

