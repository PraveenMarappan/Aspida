import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Cpu, Eye, Palette, Grid, Layers, ShieldCheck } from 'lucide-react';

export default function LoadingAnalysis({ imagePreview }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Validating Image & Noise Filtering", icon: Eye },
    { label: "Converting RGB, HSV & HSI Color Spaces", icon: Palette },
    { label: "Extracting GLCM Texture Vector (Entropy/Energy)", icon: Grid },
    { label: "Running SVM & Random Forest Classifiers", icon: Cpu },
    { label: "Calculating Confidence & Severity Level", icon: Layers },
    { label: "Generating Recommendation Report", icon: ShieldCheck },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 450);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-6">
      
      {/* Animated Image Frame with Scanning Laser */}
      <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-xl shadow-emerald-950">
        <img
          src={imagePreview}
          alt="Leaf preview under analysis"
          className="w-full h-full object-cover filter contrast-105"
        />
        <div className="absolute inset-0 bg-emerald-950/20" />
        
        {/* Animated Laser Bar */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent scan-laser" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-1">
          Analyzing Bitter Gourd Leaf...
        </h3>
        <p className="text-xs text-slate-400">
          ASPIDA Feature Extraction & Machine Learning Pipeline
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step List */}
      <div className="space-y-2 text-left bg-slate-950/60 rounded-xl p-4 border border-slate-800">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                isCurrent
                  ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-semibold'
                  : isDone
                  ? 'text-slate-300 opacity-90'
                  : 'text-slate-600'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <StepIcon className={`w-4 h-4 ${isCurrent ? 'text-emerald-400' : isDone ? 'text-emerald-500' : 'text-slate-600'}`} />
                <span>{step.label}</span>
              </div>

              <div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
