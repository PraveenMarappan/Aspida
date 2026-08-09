import React, { useState, useEffect } from 'react';
import { Info, Cpu, BookOpen, Layers, CheckCircle2, Award, Grid, RefreshCw } from 'lucide-react';
import { getMetrics } from '../services/api';

export default function About() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetrics()
      .then(data => setMetrics(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12 py-6">
      
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          <span>Machine Learning & Computer Vision Research</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          System Architecture & ML Methodology
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Technical specifications of ASPIDA's image processing pipeline, feature engineering, and algorithm performance evaluation.
        </p>
      </div>

      {/* Reference Paper Connection */}
      <section className="glass-panel rounded-3xl p-8 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Reference Research Paper Connection</h2>
            <p className="text-xs text-slate-400">“Detection Of Disease In Bitter Gourd Leaves At Early Stage”</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-400">Baseline Paper Approach:</h4>
            <p>
              Focuses on basic color space thresholding (RGB, HSV, HSI) to manually compare pixel color distributions between healthy and infected leaves.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-emerald-500/30 space-y-2">
            <h4 className="font-bold text-emerald-400">ASPIDA Software Contribution:</h4>
            <p>
              Extends color features with GLCM texture metrics (Contrast, Energy, Entropy) into a 17+ dimensional vector, feeds it to trained SVM/RF classifiers, and provides an end-to-end web system with PDF reports and SQLite history.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Engineering Breakdown */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Layers className="w-6 h-6 text-emerald-400" />
          <span>Feature Engineering Pipeline</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <span className="text-xs font-bold text-emerald-400 font-mono">01. RGB Space</span>
            <h4 className="text-base font-bold text-white">Red, Green, Blue</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates mean and standard deviation across RGB channels to capture overall leaf pigmentation and chlorosis browning.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-2">
            <span className="text-xs font-bold text-teal-400 font-mono">02. HSV Space</span>
            <h4 className="text-base font-bold text-white">Hue, Saturation, Value</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Separates color information (Hue) from lighting intensity (Value) to detect subtle powdery white or yellow lesion halos under variable lighting.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-2">
            <span className="text-xs font-bold text-green-400 font-mono">03. HSI Space</span>
            <h4 className="text-base font-bold text-white">Hue, Saturation, Intensity</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uses mathematical intensity formulas I = (R+G+B)/3 to model non-linear leaf reflectance and dark necrotic spots.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-2">
            <span className="text-xs font-bold text-amber-400 font-mono">04. GLCM Texture</span>
            <h4 className="text-base font-bold text-white">Spatial Texture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts Gray-Level Co-occurrence Matrix Contrast, Correlation, Energy, Homogeneity, and Entropy to distinguish rough fungal spots from smooth healthy leaves.
            </p>
          </div>

        </div>
      </section>

      {/* Live Algorithm Comparison Table */}
      <section className="glass-panel rounded-3xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Machine Learning Algorithm Comparison</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live test evaluation metrics measured on test dataset split (SVM vs Random Forest vs KNN)
            </p>
          </div>

          {metrics && (
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
              Selected Model: {metrics.selectedModel}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Loading ML model metrics...
          </div>
        ) : metrics && metrics.algorithms ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className="p-3 font-semibold">Algorithm</th>
                  <th className="p-3 font-semibold">Accuracy (%)</th>
                  <th className="p-3 font-semibold">Precision (%)</th>
                  <th className="p-3 font-semibold">Recall (%)</th>
                  <th className="p-3 font-semibold">F1-Score (%)</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {Object.entries(metrics.algorithms).map(([algoName, res]) => {
                  const isBest = algoName === metrics.selectedModel;
                  return (
                    <tr key={algoName} className={isBest ? 'bg-emerald-950/30 text-emerald-200' : 'text-slate-300'}>
                      <td className="p-3 font-bold flex items-center space-x-2">
                        {isBest && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        <span>{algoName}</span>
                      </td>
                      <td className="p-3 font-mono font-bold">{res.accuracy}%</td>
                      <td className="p-3 font-mono">{res.precision}%</td>
                      <td className="p-3 font-mono">{res.recall}%</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{res.f1Score}%</td>
                      <td className="p-3">
                        {isBest ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
                            Active Deploy
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Evaluated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            Model metrics unavailable. Train the model by running python backend/model/train_model.py.
          </div>
        )}
      </section>

    </div>
  );
}
