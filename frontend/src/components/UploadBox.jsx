import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSamples, getImageUrl } from '../services/api';

export default function UploadBox({ onSelectFile, onSelectSample }) {
  const [dragActive, setDragActive] = useState(false);
  const [samples, setSamples] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    getSamples()
      .then(data => setSamples(data))
      .catch(() => setSamples([]));
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const validateAndSelect = (file) => {
    setErrorMsg('');
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please upload a valid image file (.jpg, .png, or .webp)');
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      setErrorMsg('File size exceeds 16 MB limit.');
      return;
    }
    onSelectFile(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-emerald-400 bg-emerald-950/40 shadow-xl shadow-emerald-900/30 scale-[1.01]'
            : 'border-emerald-700/50 bg-slate-900/50 hover:border-emerald-500 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          Upload Bitter Gourd Leaf Image
        </h3>
        <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
          Drag and drop your leaf photograph here, or click to browse files
        </p>

        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold glow-button transition-all">
          <ImageIcon className="w-4 h-4" />
          <span>Choose Image File</span>
        </div>

        <div className="mt-4 text-[11px] text-slate-500 font-mono">
          Supported Formats: JPG, PNG, WEBP (Max 16MB)
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preset Sample Leaf Picker */}
      {samples.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Or Select a Preset Sample Leaf for Instant ML Test:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {samples.map((s) => (
              <button
                key={s.filename}
                type="button"
                onClick={() => onSelectSample(s)}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-left hover:border-emerald-500/60 hover:bg-emerald-950/30 transition-all flex flex-col items-center"
              >
                <div className="w-full h-20 rounded-lg overflow-hidden mb-2 bg-slate-950 flex items-center justify-center">
                  <img
                    src={getImageUrl(s.url)}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-emerald-300 text-center line-clamp-1">
                  {s.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
