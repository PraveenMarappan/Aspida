import React from 'react';
import { Leaf, Scan, ShieldCheck, Cpu, ArrowRight, CheckCircle2, BarChart2, FileText, Activity } from 'lucide-react';

export default function Home({ setActiveTab }) {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      
      {/* Hero Section */}
      <section className="relative glass-panel rounded-3xl p-8 sm:p-14 overflow-hidden border border-emerald-500/20">
        
        {/* Background Decorative Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5" />
            <span>Machine Learning Based Smart Agriculture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Bitter Gourd Leaf <br />
            <span className="gradient-text">Disease Detection System</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            ASPIDA leverages OpenCV image processing to extract RGB, HSV, HSI color spaces and GLCM texture features. High-accuracy Support Vector Machine (SVM) and Random Forest classifiers analyze leaf symptoms to provide early-stage disease diagnosis and preventive recommendations.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('detect')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm glow-button transition-all flex items-center justify-center space-x-2"
            >
              <Scan className="w-4 h-4" />
              <span>Detect Disease Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center justify-center space-x-2"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Explore ML Methodology</span>
            </button>
          </div>
        </div>

      </section>

      {/* Three Key Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Automated ML Detection</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Eliminates subjective manual inspection by extracting 17+ mathematical color and texture descriptors for automated algorithm classification.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Multi-Color & Texture Vector</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Combines RGB, HSV, custom HSI Intensity metrics with Gray-Level Co-occurrence Matrix (GLCM) contrast, energy, and entropy features.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Actionable PDF Reports</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Instantly download official diagnostic PDF reports complete with leaf image previews, confidence scores, symptoms, and spray guidelines.
          </p>
        </div>

      </section>

      {/* 4-Step System Workflow */}
      <section className="glass-panel rounded-3xl p-8 sm:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            How ASPIDA Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            End-to-end image processing and machine learning classification workflow
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 relative space-y-3">
            <div className="text-3xl font-black text-emerald-500/30">01</div>
            <h4 className="text-sm font-bold text-white">Upload Image</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a digital photograph of a bitter gourd leaf via drag-and-drop or mobile camera.
            </p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 relative space-y-3">
            <div className="text-3xl font-black text-emerald-500/30">02</div>
            <h4 className="text-sm font-bold text-white">Image Preprocessing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              OpenCV resizes to 224×224, applies Gaussian noise filtering, and converts to RGB, HSV, and HSI.
            </p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 relative space-y-3">
            <div className="text-3xl font-black text-emerald-500/30">03</div>
            <h4 className="text-sm font-bold text-white">Feature Extraction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts 17+ dimensional vector of color statistics and GLCM texture properties (Contrast, Entropy).
            </p>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 relative space-y-3">
            <div className="text-3xl font-black text-emerald-500/30">04</div>
            <h4 className="text-sm font-bold text-white">ML Prediction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              SVM/Random Forest model predicts pathology, severity stage, and returns management recommendations.
            </p>
          </div>

        </div>
      </section>

      {/* Quick Call to Action Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-900/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to inspect your bitter gourd crop?</h2>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Try ASPIDA now with your own leaf photos or select our built-in preset sample leaves for instant ML testing.
        </p>
        <button
          onClick={() => setActiveTab('detect')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm glow-button transition-all inline-flex items-center space-x-2"
        >
          <Scan className="w-4 h-4" />
          <span>Launch Leaf Scanner</span>
        </button>
      </section>

    </div>
  );
}
