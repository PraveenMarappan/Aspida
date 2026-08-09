import React, { useState } from 'react';
import { Scan, RotateCcw, Play, AlertCircle, ArrowLeft } from 'lucide-react';
import UploadBox from '../components/UploadBox';
import LoadingAnalysis from '../components/LoadingAnalysis';
import ResultCard from '../components/ResultCard';
import { predictLeafImage, predictSampleImage, getImageUrl } from '../services/api';

export default function Detection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle | preview | analyzing | result | error
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setSelectedSample(null);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus('preview');
    setErrorMsg('');
  };

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setSelectedFile(null);
    setPreviewUrl(getImageUrl(sample.url));
    setStatus('preview');
    setErrorMsg('');
  };


  const handleStartAnalysis = async () => {
    setStatus('analyzing');
    setErrorMsg('');

    // Brief delay so user sees animated steps
    const startTime = Date.now();

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        res = await predictLeafImage(formData);
      } else if (selectedSample) {
        res = await predictSampleImage(selectedSample.filename);
      } else {
        throw new Error('No image selected.');
      }

      // Ensure minimum 2.5s display for step-by-step progress visualizer
      const elapsed = Date.now() - startTime;
      if (elapsed < 2500) {
        await new Promise(r => setTimeout(r, 2500 - elapsed));
      }

      setAnalysisResult(res);
      setStatus('result');
    } catch (err) {
      setErrorMsg(err.message || 'Analysis failed. Please check if Flask server is running.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedSample(null);
    setPreviewUrl('');
    setAnalysisResult(null);
    setErrorMsg('');
    setStatus('idle');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center justify-center space-x-2">
          <Scan className="w-8 h-8 text-emerald-400" />
          <span>Leaf Disease Detection</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Upload a bitter gourd leaf image to extract RGB/HSV/HSI & GLCM features for instant Machine Learning diagnosis.
        </p>
      </div>

      {/* State: IDLE */}
      {status === 'idle' && (
        <UploadBox
          onSelectFile={handleSelectFile}
          onSelectSample={handleSelectSample}
        />
      )}

      {/* State: PREVIEW */}
      {status === 'preview' && (
        <div className="glass-panel rounded-2xl p-8 max-w-xl mx-auto text-center space-y-6 animate-fade-in">
          <h3 className="text-lg font-bold text-white">Image Preview Ready</h3>
          
          <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-950">
            <img
              src={previewUrl}
              alt="Selected leaf preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {selectedFile ? `File: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : `Preset Sample: ${selectedSample.name}`}
          </div>

          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Change Image</span>
            </button>

            <button
              onClick={handleStartAnalysis}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs glow-button transition-all flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Analyze Leaf Now</span>
            </button>
          </div>
        </div>
      )}

      {/* State: ANALYZING */}
      {status === 'analyzing' && (
        <LoadingAnalysis imagePreview={previewUrl} />
      )}

      {/* State: RESULT */}
      {status === 'result' && (
        <ResultCard result={analysisResult} onReset={handleReset} />
      )}

      {/* State: ERROR */}
      {status === 'error' && (
        <div className="glass-panel rounded-2xl p-8 max-w-lg mx-auto text-center space-y-4 border border-red-500/40">
          <div className="w-12 h-12 mx-auto rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Analysis Failed</h3>
          <p className="text-xs text-red-300">{errorMsg}</p>
          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Try Again
          </button>
        </div>
      )}

    </div>
  );
}
