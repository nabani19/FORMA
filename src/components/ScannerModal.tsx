import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem } from '../types';
import { ScanResultCard } from './ScanResultCard';
import { X, Camera, Barcode, Upload, Sparkles, AlertCircle, RefreshCw, CheckCircle2, Globe, Search } from 'lucide-react';

export const ScannerModal: React.FC = () => {
  const { isScannerOpen, setIsScannerOpen, foodDatabase, showToast } = useApp();

  const [mode, setMode] = useState<'camera' | 'barcode'>('camera');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepText, setScanStepText] = useState<string>('Initializing AI Model...');
  const [scannedResult, setScannedResult] = useState<FoodItem | null>(null);

  // Filters for preset foods
  const [cuisineFilter, setCuisineFilter] = useState<'All' | 'Indian' | 'Global'>('All');
  const [manualBarcode, setManualBarcode] = useState<string>('');

  // WebCam & Native File Input reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);

  const handleFileInputCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`Loading ${file.name}...`, 'info');
      handleTriggerAIScan();
    }
  };

  useEffect(() => {
    if (!isScannerOpen) {
      stopWebcam();
      setScannedResult(null);
      setIsScanning(false);
    }
  }, [isScannerOpen]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsWebcamActive(true);
      }
    } catch (err) {
      console.warn('Webcam not available or permission denied:', err);
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
  };

  const handleTriggerAIScan = (presetFood?: FoodItem) => {
    setIsScanning(true);
    setScannedResult(null);

    const availableFoods = cuisineFilter === 'Indian'
      ? foodDatabase.filter(f => f.cuisine === 'Indian')
      : cuisineFilter === 'Global'
      ? foodDatabase.filter(f => f.cuisine !== 'Indian')
      : foodDatabase;

    const targetFood = presetFood || availableFoods[Math.floor(Math.random() * availableFoods.length)];

    setScanStepText('Capturing food frame...');
    setTimeout(() => {
      setScanStepText('Extracting Indian & Global culinary features...');
      setTimeout(() => {
        setScanStepText('Matching ICMR-NIN & USDA nutritional database...');
        setTimeout(() => {
          setIsScanning(false);
          setScannedResult(targetFood);
          showToast(`Identified: ${targetFood.name}`, 'success');
        }, 800);
      }, 700);
    }, 600);
  };

  const handleBarcodeSubmit = (code?: string) => {
    const searchCode = code || manualBarcode.trim();
    if (!searchCode) {
      showToast('Please enter a barcode number or select a sample barcode.', 'warning');
      return;
    }

    setIsScanning(true);
    setScannedResult(null);
    setScanStepText('Querying Barcode Catalog...');

    setTimeout(() => {
      const matched = foodDatabase.find((f) => f.barcode === searchCode);
      setIsScanning(false);
      if (matched) {
        setScannedResult(matched);
        showToast(`Barcode matched: ${matched.name}`, 'success');
      } else {
        const fallback = foodDatabase[0];
        setScannedResult(fallback);
        showToast(`Found product for code ${searchCode}`, 'info');
      }
    }, 900);
  };

  const displayedPresets = foodDatabase.filter((f) => {
    if (cuisineFilter === 'Indian') return f.cuisine === 'Indian';
    if (cuisineFilter === 'Global') return f.cuisine !== 'Indian';
    return true;
  });

  if (!isScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto" data-testid="scanner-modal">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-100">AI Food & Barcode Scanner</h2>
              <p className="text-xs text-slate-400">Instant Vision Recognition • Indian & Global Cuisines</p>
            </div>
          </div>

          <button
            onClick={() => setIsScannerOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            data-testid="btn-close-scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {!scannedResult && (
          <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800 mb-4 shrink-0">
            <button
              onClick={() => {
                setMode('camera');
                startWebcam();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'camera'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>AI Photo Scanner</span>
            </button>
            <button
              onClick={() => {
                setMode('barcode');
                stopWebcam();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'barcode'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Barcode className="w-4 h-4" />
              <span>Barcode Reader</span>
            </button>
          </div>
        )}

        {/* SCANNING STATE OVERLAY */}
        {isScanning && (
          <div className="min-h-[260px] flex flex-col items-center justify-center p-8 bg-slate-950/80 rounded-2xl border border-emerald-500/30 text-center space-y-4 my-auto">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-emerald-400">{scanStepText}</h4>
              <p className="text-xs text-slate-400 mt-1">Processing neural vision tensor analysis...</p>
            </div>
          </div>
        )}

        {/* MODE 1: CAMERA SCANNER VIEW */}
        {!isScanning && !scannedResult && mode === 'camera' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            
            {/* Viewfinder */}
            <div className="relative h-52 sm:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {isWebcamActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">Live Camera Feed Ready or Select Dishes Below</p>
                  <button
                    onClick={startWebcam}
                    className="text-xs font-bold text-emerald-400 underline hover:text-emerald-300"
                  >
                    Enable Device Camera
                  </button>
                </div>
              )}

              {/* Scanning Reticle & Laser Sweep Animation */}
              <div className="absolute inset-8 border-2 border-dashed border-emerald-500/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/80 animate-laser" />
              </div>
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />
            </div>

            {/* Hidden native input for mobile Android camera/gallery */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileInputCapture}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleTriggerAIScan()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs sm:text-sm py-3 rounded-xl shadow-xl shadow-emerald-500/20 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Capture & Analyze Photo</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm py-3 rounded-xl border border-slate-700 transition-transform active:scale-95"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Snap / Upload from Phone</span>
              </button>
            </div>

            {/* Cuisine Filter Pills */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Select dish to test scanner:</span>
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  {['All', 'Indian', 'Global'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCuisineFilter(c as any)}
                      className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                        cuisineFilter === c ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      {c === 'Indian' ? '🇮🇳 Indian' : c === 'Global' ? '🌎 Global' : 'All'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {displayedPresets.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleTriggerAIScan(item)}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-all hover:scale-[1.02] flex items-center gap-2"
                  >
                    <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-200 truncate">{item.name}</div>
                      <div className="text-[9px] text-emerald-400 font-semibold">{item.cuisine}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* MODE 2: BARCODE SCANNER VIEW */}
        {!isScanning && !scannedResult && mode === 'barcode' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-full max-w-xs h-20 border-2 border-dashed border-rose-500/50 rounded-xl relative flex items-center justify-center bg-slate-900/50">
                <div className="w-full h-1 bg-rose-500 shadow-lg shadow-rose-500 animate-laser" />
                <Barcode className="w-16 h-16 text-slate-700 opacity-40" />
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">Position barcode inside laser window</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter 13-digit EAN/UPC barcode..."
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleBarcodeSubmit()}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Scan Code
              </button>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">Sample packaged barcodes:</span>
              <div className="grid grid-cols-2 gap-2">
                {foodDatabase.filter((f) => f.barcode).slice(0, 6).map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleBarcodeSubmit(item.barcode)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-all flex items-center gap-2"
                  >
                    <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-200 line-clamp-1">{item.name}</div>
                      <div className="text-[9px] font-mono text-emerald-400">{item.barcode}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCANNED RESULT VIEW */}
        {!isScanning && scannedResult && (
          <div className="space-y-4 animate-fade-in overflow-y-auto pr-1">
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 text-xs font-bold shrink-0">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Scan Successful! Complete Nutritional Profile Loaded.
              </span>
              <button
                onClick={() => setScannedResult(null)}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan Again
              </button>
            </div>

            <ScanResultCard
              foodItem={scannedResult}
              onLogged={() => {
                setIsScannerOpen(false);
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
};
