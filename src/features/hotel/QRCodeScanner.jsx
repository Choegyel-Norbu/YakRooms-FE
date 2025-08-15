import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { 
  Camera, 
  CameraOff, 
  QrCode, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Smartphone,
  Upload,
  FileImage,
  X,
  ExternalLink,
  Copy,
  Shield,
  ShieldAlert,
  Info,
  Play,
  Pause
} from "lucide-react";

// Device detection hook
const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    isMobile: false,
    hasCamera: false,
    hasTouchScreen: false,
    screenWidth: window.innerWidth
  });

  useEffect(() => {
    const checkCapabilities = async () => {
      // Check if mobile
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(navigator.userAgent);
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileWidth = window.innerWidth <= 768;
      const isMobile = isMobileUA || (hasTouch && isMobileWidth);

      // Check camera availability
      let hasCamera = false;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        hasCamera = devices.some(device => device.kind === 'videoinput');
      } catch (err) {
        console.warn('Could not check camera availability:', err);
      }

      setCapabilities({
        isMobile,
        hasCamera,
        hasTouchScreen: hasTouch,
        screenWidth: window.innerWidth
      });
    };

    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);
    
    return () => window.removeEventListener('resize', checkCapabilities);
  }, []);

  return capabilities;
};

// QR Content types detection
const detectQRContentType = (content) => {
  // URL detection
  const urlRegex = /^(https?:\/\/|www\.)/i;
  if (urlRegex.test(content)) {
    return { type: 'url', safe: !detectSuspiciousURL(content) };
  }

  // JSON detection
  try {
    const parsed = JSON.parse(content);
    return { type: 'json', data: parsed, safe: true };
  } catch {}

  // Email detection
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(content)) {
    return { type: 'email', safe: true };
  }

  // Phone detection
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  if (phoneRegex.test(content)) {
    return { type: 'phone', safe: true };
  }

  // WiFi credential detection
  if (content.startsWith('WIFI:')) {
    return { type: 'wifi', safe: true };
  }

  // Default to text
  return { type: 'text', safe: true };
};

// Security: Check for suspicious URLs
const detectSuspiciousURL = (url) => {
  const suspiciousPatterns = [
    /bit\.ly/i,
    /tinyurl/i,
    /goo\.gl/i,
    /ow\.ly/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,  // IP addresses
    /@/,  // URLs with @ can be phishing
    /[^\x00-\x7F]/,  // Non-ASCII characters
  ];

  const suspiciousDomains = ['tk', 'ml', 'ga', 'cf'];

  // Check patterns
  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    return true;
  }

  // Check TLD
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    const tld = urlObj.hostname.split('.').pop();
    if (suspiciousDomains.includes(tld)) {
      return true;
    }
  } catch {}

  return false;
};

// Sanitize content for display
const sanitizeContent = (content) => {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

// Main QR Scanner Component
const QRCodeScanner = ({ 
  onScanSuccess = () => {}, 
  isActive = true,
  continuousScanning = false,
  scanThrottle = 2000,
  darkMode = false,
  showParsedContent = true,
  securityWarnings = true
}) => {
  const deviceCaps = useDeviceCapabilities();
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [scanMode, setScanMode] = useState('upload');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processingUpload, setProcessingUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parsedContent, setParsedContent] = useState(null);
  const [isContinuousMode, setIsContinuousMode] = useState(continuousScanning);
  
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  // Set scan mode based on device capabilities
  useEffect(() => {
    if (deviceCaps.isMobile && deviceCaps.hasCamera) {
      setScanMode('camera');
    } else {
      setScanMode('upload');
    }
  }, [deviceCaps]);

  // Initialize reader
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    
    if (deviceCaps.isMobile && deviceCaps.hasCamera) {
      initializeCamera();
    }
    
    return () => {
      cleanup();
    };
  }, [deviceCaps]);

  // Handle component activation/deactivation
  useEffect(() => {
    if (!isActive && isScanning) {
      stopScanning();
    }
  }, [isActive, isScanning]);

  // Auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const cleanup = () => {
    try {
      stopScanning();
    } catch (err) {
      console.warn('Cleanup error:', err);
    }
  };

  const initializeCamera = async () => {
    try {
      setError(null);
      setHasPermission(null);
      
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      setDevices(videoInputDevices);
      
      if (videoInputDevices.length === 0) {
        setError('No camera devices found');
        setHasPermission(false);
        return;
      }
      
      // Prefer back camera
      const backCamera = videoInputDevices.find(device => {
        const label = device.label.toLowerCase();
        return label.includes('back') || 
               label.includes('rear') || 
               label.includes('environment');
      });
      
      const selectedDevice = backCamera || videoInputDevices[0];
      setSelectedDevice(selectedDevice);
      setHasPermission(true);
      
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError(`Camera access failed: ${err.message}`);
      setHasPermission(false);
    }
  };

  const startScanning = async () => {
    if (!readerRef.current || !selectedDevice || !videoRef.current) {
      setError('Scanner not ready. Please try again.');
      return;
    }

    try {
      setError(null);
      setIsScanning(true);
      
      await readerRef.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (scanResult, error) => {
          if (scanResult) {
            handleScanResult(scanResult.getText());
          }
          if (error && error.name !== 'NotFoundException') {
            console.warn('Scanner warning:', error);
          }
        }
      );
      
      setHasPermission(true);
      showNotification('Scanner Active - Point camera at QR code', 'success');
      
    } catch (err) {
      console.error('Scanner error:', err);
      setIsScanning(false);
      setHasPermission(false);
      
      let errorMessage = 'Failed to start scanner';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is in use by another app';
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      try {
        // Stop video stream
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        
        // Reset reader
        if (readerRef.current.reset) {
          readerRef.current.reset();
        }
        
        // Clean up any temporary video elements
        document.querySelectorAll('video[style*="position: absolute"]').forEach(video => {
          if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
          }
          video.remove();
        });
        
      } catch (err) {
        console.warn('Stop scanning error:', err);
      }
    }
    setIsScanning(false);
  };

  const handleScanResult = useCallback((rawContent) => {
    // Throttle scans in continuous mode
    const now = Date.now();
    if (isContinuousMode && now - lastScanTimeRef.current < scanThrottle) {
      return;
    }
    lastScanTimeRef.current = now;

    // Sanitize content
    const content = sanitizeContent(rawContent);
    
    // Detect content type and security
    const contentInfo = detectQRContentType(content);
    
    // Create scan record
    const scanRecord = {
      id: Date.now(),
      content,
      contentType: contentInfo.type,
      timestamp: new Date().toISOString(),
      safe: contentInfo.safe,
      data: contentInfo.data
    };

    // Update history
    setScanHistory(prev => [scanRecord, ...prev.slice(0, 9)]);
    setParsedContent(scanRecord);

    // Security warning
    if (securityWarnings && !contentInfo.safe) {
      showNotification('Security Warning: This QR code may contain suspicious content', 'warning');
    } else {
      showNotification(`QR Code Scanned - Type: ${contentInfo.type}`, 'success');
    }

    // Handle continuous vs single scan
    if (!isContinuousMode) {
      stopScanning();
    }

    // Callback
    onScanSuccess(scanRecord);
    
  }, [isContinuousMode, scanThrottle, securityWarnings, onScanSuccess]);

  const handleFileUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showNotification('Please upload an image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotification('File too large (max 10MB)', 'error');
      return;
    }

    try {
      setProcessingUpload(true);
      setError(null);

      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      const result = await readerRef.current.decodeFromImageUrl(imageUrl);
      handleScanResult(result.getText());
      
    } catch (err) {
      console.error('Upload processing error:', err);
      showNotification('No QR code found in image', 'error');
    } finally {
      setProcessingUpload(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const clearUploadedImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setParsedContent(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Content copied to clipboard', 'success');
  };

  const openURL = (url) => {
    if (detectSuspiciousURL(url)) {
      if (!confirm("This URL may be suspicious. Do you want to continue?")) {
        return;
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const rescan = () => {
    setParsedContent(null);
    clearUploadedImage();
    if (scanMode === 'camera' && !isScanning) {
      startScanning();
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
            {(isScanning || processingUpload) && (
              <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {isScanning ? 'Scanning' : 'Processing'}
              </span>
            )}
          </h2>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Notification */}
          {notification && (
            <div className={`p-3 rounded-lg flex items-start gap-2 ${
              notification.type === 'error' ? 'bg-red-50 text-red-800' :
              notification.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
              notification.type === 'success' ? 'bg-green-50 text-green-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {notification.type === 'error' && <AlertTriangle className="h-4 w-4 mt-0.5" />}
              {notification.type === 'success' && <CheckCircle className="h-4 w-4 mt-0.5" />}
              {notification.type === 'warning' && <ShieldAlert className="h-4 w-4 mt-0.5" />}
              {notification.type === 'info' && <Info className="h-4 w-4 mt-0.5" />}
              <span className="text-sm">{notification.message}</span>
            </div>
          )}

          {/* Mode Selection */}
          {deviceCaps.hasCamera && (
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
              <button
                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  scanMode === 'camera' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setScanMode('camera')}
                disabled={!deviceCaps.isMobile}
              >
                <Camera className="inline-block mr-2 h-4 w-4" />
                Camera {!deviceCaps.isMobile && '(Mobile Only)'}
              </button>
              <button
                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  scanMode === 'upload' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setScanMode('upload')}
              >
                <Upload className="inline-block mr-2 h-4 w-4" />
                Upload
              </button>
            </div>
          )}

          {/* Camera Mode */}
          {scanMode === 'camera' && deviceCaps.isMobile && (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
                  autoPlay
                  playsInline
                  muted
                />
                
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black bg-opacity-50">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                        <div className="w-full h-full border-2 border-transparent relative">
                          {/* Corner brackets */}
                          <div className="absolute -top-2 -left-2 w-12 h-12">
                            <div className="absolute top-0 left-0 w-8 h-1.5 bg-blue-400 rounded"></div>
                            <div className="absolute top-0 left-0 w-1.5 h-8 bg-blue-400 rounded"></div>
                          </div>
                          <div className="absolute -top-2 -right-2 w-12 h-12">
                            <div className="absolute top-0 right-0 w-8 h-1.5 bg-blue-400 rounded"></div>
                            <div className="absolute top-0 right-0 w-1.5 h-8 bg-blue-400 rounded"></div>
                          </div>
                          <div className="absolute -bottom-2 -left-2 w-12 h-12">
                            <div className="absolute bottom-0 left-0 w-8 h-1.5 bg-blue-400 rounded"></div>
                            <div className="absolute bottom-0 left-0 w-1.5 h-8 bg-blue-400 rounded"></div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-12 h-12">
                            <div className="absolute bottom-0 right-0 w-8 h-1.5 bg-blue-400 rounded"></div>
                            <div className="absolute bottom-0 right-0 w-1.5 h-8 bg-blue-400 rounded"></div>
                          </div>
                          
                          {/* Scanning line */}
                          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                            <div className="scanning-line"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black bg-opacity-70 text-white text-center py-2 px-4 rounded-lg">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-sm">
                            {isContinuousMode ? 'Continuous Scanning' : 'Single Scan Mode'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isScanning && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                    {hasPermission === false ? (
                      <>
                        <AlertTriangle className="h-12 w-12 mb-2 text-red-500" />
                        <p className="text-sm text-center text-red-600 mb-3">
                          Camera permission required
                        </p>
                        <button
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                          onClick={initializeCamera}
                        >
                          <RefreshCw className="inline-block mr-2 h-4 w-4" />
                          Retry
                        </button>
                      </>
                    ) : (
                      <>
                        <Camera className="h-12 w-12 mb-2" />
                        <p className="text-sm text-center mb-3">Camera ready</p>
                        <button
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                          onClick={startScanning}
                        >
                          <Play className="inline-block mr-2 h-4 w-4" />
                          Start Scan
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex gap-2">
                <button
                  onClick={isScanning ? stopScanning : startScanning}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isScanning 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <Pause className="inline-block mr-2 h-4 w-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="inline-block mr-2 h-4 w-4" />
                      Start
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setIsContinuousMode(!isContinuousMode)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
                  title="Toggle continuous scanning"
                >
                  <RefreshCw className={`h-4 w-4 ${isContinuousMode ? 'animate-spin' : ''}`} />
                </button>
                
                {devices.length > 1 && (
                  <button
                    onClick={() => {
                      const idx = devices.findIndex(d => d.deviceId === selectedDevice?.deviceId);
                      setSelectedDevice(devices[(idx + 1) % devices.length]);
                      if (isScanning) {
                        stopScanning();
                        setTimeout(startScanning, 500);
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
                    title="Switch camera"
                  >
                    <CameraOff className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* Upload Mode */}
          {(scanMode === 'upload' || !deviceCaps.isMobile) && (
            <div
              className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed transition-colors aspect-square flex flex-col items-center justify-center ${
                dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={uploadedImage}
                    alt="Uploaded QR"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  {processingUpload && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <RefreshCw className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    onClick={clearUploadedImage}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Drag & drop QR code image
                  </p>
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="inline-block mr-2 h-4 w-4" />
                    Choose File
                  </button>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
            className="hidden"
          />

          {/* Parsed Content Display */}
          {showParsedContent && parsedContent && (
            <div className={`p-3 rounded-lg border ${
              parsedContent.safe 
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
            }`}>
              <div className="flex items-start gap-2">
                {parsedContent.safe ? (
                  <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-yellow-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">
                    {parsedContent.contentType.toUpperCase()} Content
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 break-all">
                    {parsedContent.content.substring(0, 100)}
                    {parsedContent.content.length > 100 && '...'}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded text-xs font-medium"
                      onClick={() => copyToClipboard(parsedContent.content)}
                    >
                      <Copy className="inline-block h-3 w-3 mr-1" />
                      Copy
                    </button>
                    
                    {parsedContent.contentType === 'url' && (
                      <button
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded text-xs font-medium"
                        onClick={() => openURL(parsedContent.content)}
                      >
                        <ExternalLink className="inline-block h-3 w-3 mr-1" />
                        Open
                      </button>
                    )}
                    
                    <button
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded text-xs font-medium"
                      onClick={rescan}
                    >
                      <RefreshCw className="inline-block h-3 w-3 mr-1" />
                      Rescan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Recent Scans</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {scanHistory.slice(0, 3).map(scan => (
                  <div key={scan.id} className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                      {scan.contentType}
                    </span>
                    <span className="text-gray-500">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {scanMode === 'camera' && deviceCaps.isMobile
                  ? 'Point your camera at a QR code. The scanner will automatically detect and process it.'
                  : 'Upload or drag & drop an image containing a QR code to scan it.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
        
        .scanning-line {
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ef4444, transparent);
          animation: scan 2s linear infinite;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
        }
        
        .dark {
          color-scheme: dark;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default QRCodeScanner;