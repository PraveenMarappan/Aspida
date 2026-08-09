import React from 'react';
import { Leaf, ShieldCheck, Cpu, Database } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="mt-auto border-t border-emerald-900/40 bg-slate-950/80 backdrop-blur-md py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ASPIDA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Machine Learning Based Bitter Gourd Leaf Disease Detection System integrating OpenCV RGB/HSV/HSI feature extraction & Scikit-learn algorithms.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center space-x-1">
              <Cpu className="w-4 h-4" />
              <span>Technology Stack</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>OpenCV Color Space (RGB, HSV, HSI)</li>
              <li>GLCM Texture Analysis (Gray-Level)</li>
              <li>SVM, Random Forest & KNN Classifiers</li>
              <li>Python Flask REST Engine & SQLite</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Quick Navigation</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveTab('detect')} className="hover:text-emerald-300">
                  Detect Leaf Disease
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('history')} className="hover:text-emerald-300">
                  Scan History Logs
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('diseases')} className="hover:text-emerald-300">
                  Bitter Gourd Diseases
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-emerald-300">
                  ML Model Benchmark
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center space-x-1">
              <Database className="w-4 h-4" />
              <span>Academic Purpose</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Developed as a practical Smart Agriculture project combining Computer Vision feature engineering with non-invasive early plant pathology diagnostics.
            </p>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 ASPIDA — Smart Agriculture ML System</p>
          <p className="mt-2 sm:mt-0">Powered by React, OpenCV & Scikit-learn</p>
        </div>
      </div>
    </footer>
  );
}
