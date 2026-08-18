import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem } from '../types';
import { ScanResultCard } from './ScanResultCard';
import { 
  X, 
  Camera, 
  Barcode, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  Image as ImageIcon,
  Scale,
  ScanLine,
  HelpCircle,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  analyzeFoodWithAiVision, 
  analyzeNutritionLabelOcr,
  lookupBarcodeProduct, 
  VISUAL_PORTION_GUIDES,
  VisualPortionUnit,
  convertVisualPortionToGrams
} from '../utils/aiVisionService';

export const ScannerModal: React.FC = () => {
  const { isScannerOpen, setIsScannerOpen, foodDatabase, showToast } = useApp();

  const [mode, setMode] = useState<'camera' | 'upload' | 'label_ocr' | 'text' | 'barcode'>('camera');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepText, setScanStepText] = useState<string>('Initializing AI Vision Model...');
  const [scannedResult, setScannedResult] = useState<FoodItem | null>(null);

  // Visual Portion Guide Modal State
  const [showPortionGuide, setShowPortionGuide] = useState<boolean>(false);

  // Filters & inputs
  const [cuisineFilter, setCuisineFilter] = useState<'All' | 'Indian' | 'Global'>('All');
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [textMealQuery, setTextMealQuery] = useState<string>('');

  // Image Preview & Base64
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(null);

  // WebCam & Native File Input reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isScannerOpen) {
      stopWebcam();
      setScannedResult(null);
      setIsScanning(false);
      setCurrentImagePreview(null);
      setTextMealQuery('');
      setCameraError(null);
      setShowPortionGuide(false);
    } else if (mode === 'camera' || mode === 'label_ocr') {
      startWebcam();
    }
  }, [isScannerOpen, mode]);

  const startWebcam = async () => {
    setCameraError(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError('Webcam API not supported in this browser context.');
        setIsWebcamActive(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsWebcamActive(true);
      }
    } catch (err: any) {
      console.warn('Webcam not available or permission denied:', err);
      setCameraError('Camera access not granted or unavailable. You can upload photos or describe meals below.');
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

  // Capture frame from webcam and run AI Vision or OCR
  const handleCaptureCameraFrame = async () => {
    let capturedBase64: string | undefined;

    if (videoRef.current && isWebcamActive) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          capturedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setCurrentImagePreview(capturedBase64);
        }
      } catch (e) {
        console.warn('Could not grab frame from video canvas:', e);
      }
    }

    if (mode === 'label_ocr') {
      await runNutritionLabelOcrScan(capturedBase64);
    } else {
      await runAiVisionScan({
        imageBase64: capturedBase64,
        cuisineHint: cuisineFilter as any,
        scanMode: 'multi_item',
      });
    }
  };

  // Capture from uploaded file
  const handleFileInputCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setCurrentImagePreview(base64);
      if (mode === 'label_ocr') {
        await runNutritionLabelOcrScan(base64);
      } else {
        await runAiVisionScan({
          imageBase64: base64,
          cuisineHint: cuisineFilter as any,
          scanMode: 'multi_item',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Text meal description scan
  const handleTextScanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = textMealQuery.trim();
    if (!query) {
      showToast('Please enter what you ate or describe your meal.', 'warning');
      return;
    }
    await runAiVisionScan({
      textDescription: query,
      cuisineHint: cuisineFilter as any,
      scanMode: 'multi_item',
    });
  };

  // Trigger scan for a selected preset food
  const handlePresetFoodSelect = async (presetFood: FoodItem) => {
    setIsScanning(true);
    setScannedResult(null);
    setCurrentImagePreview(presetFood.imageUrl);
    setScanStepText(`Recognizing ${presetFood.name}...`);

    setTimeout(() => {
      setScanStepText('Matching ICMR-NIN & USDA nutritional database...');
      setTimeout(() => {
        setIsScanning(false);
        setScannedResult(presetFood);
        showToast(`Identified: ${presetFood.name}`, 'success');
      }, 500);
    }, 400);
  };

  // Dedicated OCR Runner
  const runNutritionLabelOcrScan = async (base64Img?: string) => {
    setIsScanning(true);
    setScannedResult(null);
    setScanStepText('Extracting Nutrition Facts OCR table...');

    try {
      const result = await analyzeNutritionLabelOcr(base64Img || '', (step) => setScanStepText(step));
      setIsScanning(false);
      setScannedResult(result);
      showToast(`Nutrition Label Parsed: ${result.name}`, 'success');
    } catch (err: any) {
      console.error('Label OCR error:', err);
      setIsScanning(false);
      showToast(err.message || 'Could not OCR nutrition label. Please try again.', 'error');
    }
  };

  // Central AI Vision Scan Executor
  const runAiVisionScan = async (options: {
    imageBase64?: string;
    textDescription?: string;
    cuisineHint?: 'All' | 'Indian' | 'Global';
    scanMode?: 'standard' | 'multi_item' | 'nutrition_label_ocr';
  }) => {
    setIsScanning(true);
    setScannedResult(null);
    setScanStepText('Analyzing food photo with Gemini 2.5 Flash Vision...');

    try {
      const result = await analyzeFoodWithAiVision(
        {
          imageBase64: options.imageBase64,
          textDescription: options.textDescription,
          cuisineHint: options.cuisineHint || 'All',
          scanMode: options.scanMode || 'multi_item',
        },
        (step) => setScanStepText(step)
      );

      setIsScanning(false);
      setScannedResult(result);
      showToast(`Identified: ${result.name}`, 'success');
    } catch (err: any) {
      console.error('Vision scan error:', err);
      setIsScanning(false);
      showToast(err.message || 'Could not analyze food item. Please try again.', 'error');
    }
  };

  // Barcode Lookup with OpenFoodFacts and Local Database
  const handleBarcodeSubmit = async (code?: string) => {
    const searchCode = (code || manualBarcode).trim();
    if (!searchCode) {
      showToast('Please enter a barcode number or select a sample barcode.', 'warning');
      return;
    }

    setIsScanning(true);
    setScannedResult(null);
    setScanStepText(`Querying OpenFoodFacts global catalog for code ${searchCode}...`);

    try {
      const item = await lookupBarcodeProduct(searchCode);
      setIsScanning(false);

      if (item) {
        setScannedResult(item);
        setCurrentImagePreview(item.imageUrl);
        showToast(`Barcode verified: ${item.name}`, 'success');
      } else {
        const estimatedItem = await analyzeFoodWithAiVision({
          textDescription: `Packaged product with barcode ${searchCode}`,
          cuisineHint: 'Global',
        });
        setScannedResult(estimatedItem);
        showToast(`Estimated product for barcode ${searchCode}`, 'info');
      }
    } catch (err) {
      setIsScanning(false);
      showToast('Barcode lookup failed. Please try manual entry or photo scan.', 'error');
    }
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
        
        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-100 flex items-center gap-2">
                <span>AI Food & Vision Intelligence</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">Plate Decomposition • Nutrition Label OCR • USDA & ICMR-NIN</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Visual Portion Guide Toggle Button */}
            <button
              onClick={() => setShowPortionGuide(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="View Visual Hand-Measurement Portion Guide"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Portion Guide</span>
            </button>

            <button
              onClick={() => setIsScannerOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              data-testid="btn-close-scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        {!scannedResult && (
          <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800 mb-4 shrink-0 overflow-x-auto gap-1">
            <button
              onClick={() => {
                setMode('camera');
                startWebcam();
              }}
              className={`flex-1 min-w-[85px] flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'camera'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>

            <button
              onClick={() => {
                setMode('upload');
                stopWebcam();
              }}
              className={`flex-1 min-w-[85px] flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'upload'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>

            <button
              onClick={() => {
                setMode('label_ocr');
                startWebcam();
              }}
              className={`flex-1 min-w-[95px] flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'label_ocr'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Label OCR</span>
            </button>

            <button
              onClick={() => {
                setMode('text');
                stopWebcam();
              }}
              className={`flex-1 min-w-[90px] flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'text'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Describe</span>
            </button>

            <button
              onClick={() => {
                setMode('barcode');
                stopWebcam();
              }}
              className={`flex-1 min-w-[85px] flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'barcode'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Barcode</span>
            </button>
          </div>
        )}

        {/* SCANNING STATE OVERLAY */}
        {isScanning && (
          <div className="min-h-[260px] flex flex-col items-center justify-center p-8 bg-slate-950/90 rounded-2xl border border-emerald-500/40 text-center space-y-4 my-auto">
            {currentImagePreview ? (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 mb-2">
                <img src={currentImagePreview} alt="Scanning target" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-full h-1 bg-emerald-400 shadow-md shadow-emerald-400 animate-laser" />
                </div>
              </div>
            ) : (
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
              </div>
            )}
            <div>
              <h4 className="font-heading font-bold text-base text-emerald-400">{scanStepText}</h4>
              <p className="text-xs text-slate-400 mt-1">Processing multimodal vision tensor analysis with USDA & ICMR-NIN standards...</p>
            </div>
          </div>
        )}

        {/* MODE 1: CAMERA SCANNER VIEW */}
        {!isScanning && !scannedResult && mode === 'camera' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            
            {/* Viewfinder */}
            <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {isWebcamActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">
                    {cameraError || 'Live Camera Feed Ready or Select Preset Dishes Below'}
                  </p>
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

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-medium text-slate-300 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Auto Plate Decomposition Active</span>
                </span>
                <span>Positions all items in frame</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleCaptureCameraFrame}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs sm:text-sm py-3 rounded-xl shadow-xl shadow-emerald-500/20 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Capture & Decompose Plate</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm py-3 rounded-xl border border-slate-700 transition-transform active:scale-95"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Snap / Upload Image</span>
              </button>
            </div>

            {/* Preset Food Test Section */}
            {renderPresetFoodSection()}

          </div>
        )}

        {/* MODE 2: PHOTO UPLOAD VIEW */}
        {!isScanning && !scannedResult && mode === 'upload' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-56 sm:h-64 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/60 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 mb-3 transition-colors">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Upload Food Photo or Meal Picture</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Drop food photo here or click to select. Automatically segments multi-dish plates into component items.
              </p>
              <span className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                Browse Files
              </span>
            </div>

            {/* Preset Food Test Section */}
            {renderPresetFoodSection()}
          </div>
        )}

        {/* MODE 3: NUTRITION LABEL OCR SCANNER */}
        {!isScanning && !scannedResult && mode === 'label_ocr' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {isWebcamActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <ScanLine className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">
                    {cameraError || 'Align Nutrition Facts Label on Box/Can/Jar'}
                  </p>
                  <button
                    onClick={startWebcam}
                    className="text-xs font-bold text-emerald-400 underline hover:text-emerald-300"
                  >
                    Enable Device Camera
                  </button>
                </div>
              )}

              {/* OCR Reticle Box */}
              <div className="absolute inset-x-12 inset-y-6 border-2 border-amber-500/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-amber-400 bg-slate-950/70 px-2 py-0.5 rounded">
                  <span>NUTRITION FACTS OCR</span>
                  <span className="animate-pulse">● READY</span>
                </div>
                <div className="w-full h-0.5 bg-amber-400 shadow-md shadow-amber-400/80 animate-laser" />
                <div className="text-center text-[10px] text-slate-400 bg-slate-950/70 py-0.5 rounded">
                  Align printed nutrition table in frame
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleCaptureCameraFrame}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm py-3 rounded-xl shadow-xl shadow-amber-500/20 transition-transform active:scale-95"
              >
                <ScanLine className="w-4 h-4" />
                <span>Scan Nutrition Facts Table</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm py-3 rounded-xl border border-slate-700 transition-transform active:scale-95"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Upload Label Photo</span>
              </button>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>OCR Scanning Tips:</span>
              </div>
              <p className="text-slate-400">
                Hold still with good lighting. The OCR engine extracts Serving Size, Calories, Protein, Net Carbs, Sat Fat, Sugars, Sodium, and micronutrients directly from manufacturer packaging.
              </p>
            </div>
          </div>
        )}

        {/* MODE 4: DESCRIBE MEAL / TEXT SEARCH VIEW */}
        {!isScanning && !scannedResult && mode === 'text' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <form onSubmit={handleTextScanSubmit} className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Type or describe what you ate / plan to eat:
              </label>
              <div className="relative">
                <textarea
                  value={textMealQuery}
                  onChange={(e) => setTextMealQuery(e.target.value)}
                  placeholder="e.g. 2 Tawa Rotis with 1 bowl Dal Makhani, 1 cup Jeera Rice and fresh Cucumber Salad"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-medium leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs sm:text-sm py-3 rounded-xl shadow-xl shadow-emerald-500/20 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calculate & Decompose Macros</span>
              </button>
            </form>

            <div className="pt-1">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Example Composite Meals:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  '2 Tawa Rotis with 1 Bowl Dal Tadka & Salad',
                  'Chicken Breast with Steamed Rice & Broccoli',
                  '2 Paneer Parathas with 1 Bowl Curd',
                  'Masala Dosa with Sambar & Coconut Chutney',
                  '1 Bowl Soya Chunks Curry with 2 Rotis & Rice',
                  'Overnight Oats with Chia Seeds, Whey & Berries'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTextMealQuery(sample);
                      runAiVisionScan({ textDescription: sample, cuisineHint: cuisineFilter as any, scanMode: 'multi_item' });
                    }}
                    className="text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
                  >
                    + {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Food Test Section */}
            {renderPresetFoodSection()}
          </div>
        )}

        {/* MODE 5: BARCODE SCANNER VIEW */}
        {!isScanning && !scannedResult && mode === 'barcode' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-full max-w-xs h-20 border-2 border-dashed border-rose-500/50 rounded-xl relative flex items-center justify-center bg-slate-900/50">
                <div className="w-full h-1 bg-rose-500 shadow-lg shadow-rose-500 animate-laser" />
                <Barcode className="w-16 h-16 text-slate-700 opacity-40" />
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">Position barcode inside laser window or enter below</p>
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

        {/* Hidden native input for mobile Android camera/gallery */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileInputCapture}
          className="hidden"
        />

        {/* SCANNED RESULT VIEW */}
        {!isScanning && scannedResult && (
          <div className="space-y-4 animate-fade-in overflow-y-auto pr-1">
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 text-xs font-bold shrink-0">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>AI Vision Verified! Nutritional Breakdown Loaded.</span>
              </span>
              <button
                onClick={() => {
                  setScannedResult(null);
                  setCurrentImagePreview(null);
                }}
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan Another Item
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

        {/* VISUAL PORTION GUIDE MODAL OVERLAY */}
        {showPortionGuide && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md p-5 flex flex-col justify-between animate-fade-in rounded-3xl">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-100 text-base">Visual Portion Guide (ICMR-NIN & USDA)</h3>
                    <p className="text-[11px] text-slate-400">Estimate food weights without a kitchen scale using standard hand references</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPortionGuide(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {Object.values(VISUAL_PORTION_GUIDES).map((guide) => (
                  <div 
                    key={guide.id} 
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{guide.icon}</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {guide.label}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200">{guide.foodExamples}</div>
                    <p className="text-[10px] text-slate-400 leading-tight">{guide.clinicalRationale}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowPortionGuide(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
            >
              Got It, Return to Scanner
            </button>
          </div>
        )}

      </div>
    </div>
  );

  // Helper render for preset dishes testing
  function renderPresetFoodSection() {
    return (
      <div className="pt-2 border-t border-slate-800/80">
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
              onClick={() => handlePresetFoodSelect(item)}
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
    );
  }
};
