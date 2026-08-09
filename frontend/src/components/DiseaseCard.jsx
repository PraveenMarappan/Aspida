import React, { useState } from 'react';
import { BookOpen, ShieldCheck, AlertCircle, ChevronRight, X } from 'lucide-react';

export default function DiseaseCard({ disease }) {
  const [modalOpen, setModalOpen] = useState(false);

  const isHealthy = disease.name === 'Healthy';
  const badgeColor = isHealthy
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

  return (
    <>
      <div className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
              {disease.category || 'Disease'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Severity: {disease.severity_level || 'Moderate'}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{disease.name}</h3>
          {disease.scientific_name && (
            <p className="text-xs text-emerald-400/80 italic mb-3">
              {disease.scientific_name}
            </p>
          )}

          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
            {disease.description}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 group"
        >
          <span>View Full Symptoms & Management</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Modal Detail View */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel border border-emerald-500/30 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor} inline-block mb-2`}>
                {disease.category}
              </span>
              <h2 className="text-2xl font-bold text-white">{disease.name}</h2>
              <p className="text-xs text-emerald-400 italic">{disease.scientific_name}</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Description:</h4>
                <p className="text-slate-300 leading-relaxed">{disease.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">Visual Symptoms:</h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{disease.symptoms}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1">Pathogen / Causes:</h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{disease.causes}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-emerald-400 mb-1">Prevention:</h4>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{disease.prevention}</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-emerald-400 mb-1">Management:</h4>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{disease.management}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
