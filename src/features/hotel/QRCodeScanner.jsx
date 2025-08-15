import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { 
  Camera, 
  CameraOff, 
  QrCode, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Smartphone,
  Upload,
  Image as ImageIcon,
  FileImage,
  X
} from "lucide-react";
import { toast } from "sonner";

// Hook to detect mobile device
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check user agent for mobile devices
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(navigator.userAgent);
      
      // Check for touch support
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Check screen size (mobile-like width)
      const isMobileWidth = window.innerWidth <= 768;
      
      // Consider it mobile if it matches user agent OR (has touch AND mobile width)
      setIsMobile(isMobileUA || (hasTouch && isMobileWidth));
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const QRCodeScanner = ({ onScanSuccess, isActive }) => {
  const isMobile = useIsMobile();
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [scanMode, setScanMode] = useState(isMobile ? 'camera' : 'upload'); // Default to camera on mobile, upload on desktop
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processingUpload, setProcessingUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initialize the code reader
    readerRef.current = new BrowserMultiFormatReader();
    
    // Get available video devices only on mobile
    if (isMobile) {
      getVideoDevices();
    }
    
    return () => {
      // Cleanup function
      try {
        if (readerRef.current) {
          // Stop any ongoing video streams
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
          }
          
          // Reset the reader if the method exists
          if (typeof readerRef.current.reset === 'function') {
            readerRef.current.reset();
          } else if (typeof readerRef.current.stopContinuousDecode === 'function') {
            readerRef.current.stopContinuousDecode();
          }
        }
      } catch (err) {
        console.warn('Error during component cleanup:', err);
      }
    };
  }, [isMobile]);

  useEffect(() => {
    if (isActive && !isScanning && scanMode === 'camera' && isMobile) {
      // Auto-start scanning when component becomes active (with delay for UI) - only on mobile
      console.log('🎬 Component activated, auto-starting camera...');
      setTimeout(() => {
        if (selectedDevice) {
          startScanning();
        } else {
          console.log('⏳ No device selected yet, waiting...');
        }
      }, 1000);
    } else if (!isActive && isScanning) {
      // Stop scanning when component becomes inactive
      console.log('⏸️ Component deactivated, stopping camera...');
      stopScanning();
    }
  }, [isActive, selectedDevice, scanMode, isMobile]);

  const getVideoDevices = async () => {
    try {
      console.log('🎥 Getting video devices...');
      
      // First, request camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('✅ Camera permission granted');
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr) {
        console.error('❌ Camera permission denied:', permErr);
        setError('Camera permission is required. Please allow camera access and refresh the page.');
        setHasPermission(false);
        return;
      }
      
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      console.log('📱 Available video devices:', videoInputDevices);
      setDevices(videoInputDevices);
      
      if (videoInputDevices.length === 0) {
        setError('No camera devices found. Please ensure your device has a camera.');
        return;
      }
      
      // Prefer back camera for mobile devices
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const selectedDevice = backCamera || videoInputDevices[0];
      console.log('🎯 Selected device:', selectedDevice);
      setSelectedDevice(selectedDevice);
      setHasPermission(true);
      
    } catch (err) {
      console.error('❌ Error getting video devices:', err);
      setError(`Unable to access camera devices: ${err.message}`);
      setHasPermission(false);
    }
  };

  const startScanning = async () => {
    console.log('🚀 Starting camera scan...');
    console.log('Reader ref:', !!readerRef.current);
    console.log('Selected device:', selectedDevice);
    console.log('Video ref:', !!videoRef.current);
    
    if (!readerRef.current) {
      console.error('❌ No reader ref available');
      setError('QR scanner not initialized. Please refresh the page.');
      return;
    }
    
    if (!selectedDevice) {
      console.error('❌ No device selected');
      setError('No camera device selected. Please check camera permissions.');
      return;
    }
    
    if (!videoRef.current) {
      console.error('❌ No video element available');
      setError('Video element not ready. Please try again.');
      return;
    }

    try {
      setError(null);
      setIsScanning(true);
      
      console.log('📹 Starting decode from video device...');
      console.log('Device ID:', selectedDevice.deviceId);
      
      // Request camera permission and start scanning
      await readerRef.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            console.log('✅ QR Code detected:', result.getText());
            handleScanResult(result.getText());
          }
          if (error && error.name !== 'NotFoundException') {
            console.warn('Scanner error (non-critical):', error);
          }
        }
      );
      
      console.log('✅ Camera started successfully');
      setHasPermission(true);
      toast.success("Camera started", {
        description: "Point camera at QR code to scan",
        duration: 6000
      });
      
    } catch (err) {
      console.error('❌ Error starting scanner:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      setIsScanning(false);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application. Please close other apps using the camera.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera constraints not supported. Please try a different camera.');
      } else {
        setError(`Failed to start camera: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      try {
        // Stop the video stream properly
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        
        // Reset the reader if the method exists
        if (typeof readerRef.current.reset === 'function') {
          readerRef.current.reset();
        } else if (typeof readerRef.current.stopContinuousDecode === 'function') {
          readerRef.current.stopContinuousDecode();
        }
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleScanResult = (result) => {
    try {
      setLastScanResult(result);
      
      // Try to parse as JSON (booking QR code)
      const bookingData = JSON.parse(result);
      
      if (bookingData.bookingId || bookingData.id) {
        toast.success("QR Code Scanned!", {
          description: "Booking information found",
          duration: 6000
        });
        onScanSuccess(bookingData);
      } else {
        throw new Error('Invalid booking QR code format');
      }
      
    } catch (err) {
      console.error('Error parsing QR code:', err);
      toast.error("Invalid QR Code", {
        description: "This doesn't appear to be a valid booking QR code",
        duration: 6000
      });
      
      // Still pass the raw result in case it's useful
      onScanSuccess({ rawData: result, error: 'Invalid format' });
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Invalid File Type", {
        description: "Please upload an image file (PNG, JPG, etc.)",
        duration: 6000
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Please upload an image smaller than 10MB",
        duration: 6000
      });
      return;
    }

    try {
      setProcessingUpload(true);
      setError(null);

      // Create image URL for preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // Create image element for QR code reading
      const img = new Image();
      img.onload = async () => {
        try {
          // Decode QR code from image
          const result = await readerRef.current.decodeFromImageUrl(imageUrl);
          handleScanResult(result.getText());
        } catch (err) {
          console.error('Error reading QR code from image:', err);
          toast.error("No QR Code Found", {
            description: "Could not find a valid QR code in this image",
            duration: 6000
          });
        } finally {
          setProcessingUpload(false);
        }
      };
      
      img.onerror = () => {
        setProcessingUpload(false);
        toast.error("Invalid Image", {
          description: "Could not load the uploaded image",
          duration: 6000
        });
      };
      
      img.src = imageUrl;

    } catch (err) {
      console.error('Error processing upload:', err);
      setProcessingUpload(false);
      toast.error("Upload Failed", {
        description: "There was an error processing your image",
        duration: 6000
      });
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Clear uploaded image
  const clearUploadedImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Switch scan mode
  const switchScanMode = (mode) => {
    if (mode === 'camera' && isScanning) {
      stopScanning();
    }
    if (mode === 'upload') {
      clearUploadedImage();
    }
    setScanMode(mode);
    setError(null);
  };

  const switchCamera = () => {
    if (devices.length > 1 && selectedDevice) {
      const currentIndex = devices.findIndex(d => d.deviceId === selectedDevice.deviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setSelectedDevice(devices[nextIndex]);
      
      if (isScanning) {
        stopScanning();
        setTimeout(() => {
          startScanning();
        }, 500);
      }
      
      toast.success("Camera Switched", {
        description: `Using ${devices[nextIndex].label}`,
        duration: 6000
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {(isScanning || processingUpload) && (
            <Badge variant="secondary" className="ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              {isScanning ? 'Scanning' : 'Processing'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Scan Mode Toggle - Only show camera option on mobile */}
        {isMobile ? (
          <div className="flex rounded-lg bg-gray-100 p-1">
            <Button
              variant={scanMode === 'camera' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 h-8"
              onClick={() => switchScanMode('camera')}
            >
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </Button>
            <Button
              variant={scanMode === 'upload' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 h-8"
              onClick={() => switchScanMode('upload')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Upload className="h-5 w-5" />
              <span className="text-sm font-medium">Upload QR Code Image</span>
            </div>
          </div>
        )}

        {/* Camera Mode - Only on mobile devices */}
        {scanMode === 'camera' && isMobile && (
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-blue-500 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-1 h-8 bg-red-500 animate-pulse opacity-75"></div>
                  </div>
                </div>
                {/* Status overlay */}
                <div className="absolute top-2 left-2 right-2">
                  <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Scanning for QR codes...
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                {hasPermission === false ? (
                  <>
                    <AlertTriangle className="h-12 w-12 mb-2 text-red-500" />
                    <p className="text-sm text-center text-red-600 mb-3">
                      Camera permission required
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        console.log('🔄 Retrying camera access...');
                        getVideoDevices();
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Access
                    </Button>
                  </>
                ) : hasPermission === null ? (
                  <>
                    <Camera className="h-12 w-12 mb-2 animate-pulse" />
                    <p className="text-sm text-center">
                      Initializing camera...
                    </p>
                  </>
                ) : (
                  <>
                    <Camera className="h-12 w-12 mb-2" />
                    <p className="text-sm text-center mb-3">
                      {error ? "Camera unavailable" : "Camera ready to scan"}
                    </p>
                    {!error && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={startScanning}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload Mode - Always on desktop, optional on mobile */}
        {(scanMode === 'upload' || !isMobile) && (
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              className={`relative bg-gray-100 rounded-lg border-2 border-dashed transition-colors aspect-square flex flex-col items-center justify-center ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={uploadedImage}
                    alt="Uploaded QR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  {processingUpload && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Processing...</p>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearUploadedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="mb-4">
                    {dragOver ? (
                      <FileImage className="h-12 w-12 mx-auto text-blue-500" />
                    ) : (
                      <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {dragOver ? 'Drop image here' : 'Drag & drop QR code image'}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    or click to browse
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Last Scan Result */}
        {lastScanResult && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700">
              <div className="font-medium">Last scan successful</div>
              <div className="text-xs text-green-600 mt-1 break-all">
                {lastScanResult.length > 50 
                  ? `${lastScanResult.substring(0, 50)}...` 
                  : lastScanResult
                }
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons - Only on mobile */}
        {scanMode === 'camera' && isMobile && (
          <div className="flex gap-2">
            <Button
              onClick={isScanning ? stopScanning : startScanning}
              variant={isScanning ? "destructive" : "default"}
              className="flex-1"
            >
              {isScanning ? (
                <>
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scan
                </>
              )}
            </Button>
            
            {devices.length > 1 && (
              <Button
                onClick={switchCamera}
                variant="outline"
                disabled={!isScanning}
                title="Switch Camera"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            {scanMode === 'camera' ? (
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            ) : (
              <ImageIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">
                {scanMode === 'camera' ? 'How to scan:' : 'How to upload:'}
              </div>
              <ul className="space-y-1 text-xs">
                {scanMode === 'camera' ? (
                  <>
                    <li>• Point camera at guest's booking QR code</li>
                    <li>• Ensure good lighting and steady hands</li>
                    <li>• QR code should fill the scanning area</li>
                    <li>• Booking details will appear automatically</li>
                  </>
                ) : (
                  <>
                    <li>• Upload screenshots or photos of QR codes</li>
                    <li>• Drag & drop or click to browse files</li>
                    <li>• Supports PNG, JPG, and other image formats</li>
                    <li>• QR code will be processed automatically</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Device Selection - Only on mobile */}
        {scanMode === 'camera' && isMobile && devices.length > 1 && (
          <div className="text-xs text-gray-600">
            Camera: {selectedDevice?.label || 'Default'}
          </div>
        )}
      </CardContent>
    </Card>
  );  
};

export default QRCodeScanner;
