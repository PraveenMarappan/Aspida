import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, FileText, 
  RotateCcw, Sliders, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react';
import { getImageUrl, getReportUrl } from '../services/api';

export default function ResultCard({ result, onReset }) {
  const [showFeatures, setShowFeatures] = useState(false);

  if (!result) return null;

  const isHealthy = result.prediction === 'Healthy';
  const disease = result.diseaseInfo || {};
  const confidence = result.confidence || 0;

  // Severity color mapping
  let severityBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (result.severity?.includes('Advanced')) {
    severityBg = "bg-red-500/20 text-red-300 border-red-500/30";
  } else if (result.severity?.includes('Early') || result.severity?.includes('Mild')) {
    severityBg = "bg-amber-500/20 text-amber-300 border-amber-500/30";
  }

  // Confidence level classification (visual label only - does NOT modify numerical percentage)
  let confidenceLabel = "High Confidence";
  let confidenceColor = "text-emerald-400";
  let confidenceBarColor = "bg-emerald-400";

  if (confidence < 60) {
    confidenceLabel = "Low Confidence";
    confidenceColor = "text-amber-400";
    confidenceBarColor = "bg-amber-400";
  } else if (confidence < 80) {
    confidenceLabel = "Moderate Confidence";
    confidenceColor = "text-yellow-400";
    confidenceBarColor = "bg-yellow-400";
  }

  const leafImgSrc = result.image_url || getImageUrl(result.imageUrl);

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-emerald-900/40">
        
        {/* Leaf Image & Prediction Title */}
        <div className="flex items-center space-x-5">

          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-lg flex-shrink-0 bg-slate-950 relative flex items-center justify-center">
            <img
              src={leafImgSrc}
              alt="Analyzed leaf"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div className="hidden absolute inset-0 bg-slate-900 flex-col items-center justify-center p-2 text-center text-xs text-slate-400 font-semibold">
              Image unavailable
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${severityBg}`}>
                {result.severity}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: #{result.id ? String(result.id).padStart(4, '0') : '0000'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {result.prediction}
            </h2>

            {disease.scientific_name && (
              <p className="text-xs text-emerald-400/80 italic">
                {disease.scientific_name}
              </p>
            )}
          </div>
        </div>

        {/* Confidence Meter Badge */}
        <div className="flex flex-col items-center bg-slate-900/80 border border-slate-800 p-4 rounded-2xl w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 mb-1">
            {confidenceLabel}
          </span>
          <div className={`text-3xl font-black ${confidenceColor}`}>
            {confidence.toFixed(1)}%
          </div>
          <div className="w-28 bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`${confidenceBarColor} h-full rounded-full`}
              style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
            />
          </div>
        </div>

      </div>

      {/* Low Confidence Guidance Banner */}
      {confidence < 60 && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>
            The model has low confidence ({confidence.toFixed(1)}%) in this prediction. Try uploading a clear, well-lit bitter gourd leaf image with distinct symptoms.
          </span>
        </div>
      )}


      {/* Overview & Key Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Description & Symptoms */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
            {isHealthy ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span>Diagnostic Overview</span>
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {disease.description || 'No detailed description available.'}
          </p>

          <div className="pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-white mb-2">Key Visual Symptoms:</h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {disease.symptoms ? (
                disease.symptoms.split('\n').map((sym, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{sym.replace(/^•\s*/, '')}</span>
                  </li>
                ))
              ) : (
                <li>No symptoms reported.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recommended Action Plan</span>
          </h3>

          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-white mb-1">Preventive Measures:</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {disease.prevention || 'Maintain regular field monitoring.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <h4 className="text-xs font-semibold text-white mb-1">Active Management:</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {disease.management || 'Routine irrigation and fertilization.'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Feature Vector Accordion */}
      {result.features && (
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="w-full flex items-center justify-between p-4 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Extracted Image Features (RGB + HSV + HSI + GLCM Texture)</span>
            </div>
            {showFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFeatures && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(result.features).map(([key, val]) => (
                <div key={key} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
                  <span className="text-[10px] text-slate-400 block">{key}</span>
                  <span className="text-emerald-300 font-bold">{typeof val === 'number' ? val.toFixed(3) : val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-900/40">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center space-x-2 border border-slate-700"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Scan Another Leaf</span>
        </button>

        {result.id && (
          <a
            href={getReportUrl(result.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs glow-button transition-all flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Download Official PDF Report</span>
          </a>
        )}
      </div>

    </div>
  );
}
