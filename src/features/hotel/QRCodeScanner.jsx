import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Separator } from "@/shared/components/separator";
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

const QRCodeScanner = ({ onScanSuccess, isActive }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'upload'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processingUpload, setProcessingUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initialize the code reader
    readerRef.current = new BrowserMultiFormatReader();
    
    // Get available video devices
    getVideoDevices();
    
    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (isActive && !isScanning) {
      // Auto-start scanning when component becomes active
      setTimeout(() => {
        startScanning();
      }, 500);
    } else if (!isActive && isScanning) {
      // Stop scanning when component becomes inactive
      stopScanning();
    }
  }, [isActive]);

  const getVideoDevices = async () => {
    try {
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      setDevices(videoInputDevices);
      
      // Prefer back camera for mobile devices
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      
      setSelectedDevice(backCamera || videoInputDevices[0]);
    } catch (err) {
      console.error('Error getting video devices:', err);
      setError('Unable to access camera devices');
    }
  };

  const startScanning = async () => {
    if (!readerRef.current || !selectedDevice) return;

    try {
      setError(null);
      setIsScanning(true);
      
      // Request camera permission and start scanning
      await readerRef.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            handleScanResult(result.getText());
          }
          // Ignore errors during scanning (they're frequent and normal)
        }
      );
      
      setHasPermission(true);
      toast.success("Camera started", {
        description: "Point camera at QR code to scan",
        duration: 6000
      });
      
    } catch (err) {
      console.error('Error starting scanner:', err);
      setIsScanning(false);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.');
      } else {
        setError('Failed to start camera. Please try again.');
      }
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
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
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(d => d.deviceId === selectedDevice.deviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setSelectedDevice(devices[nextIndex]);
      
      if (isScanning) {
        stopScanning();
        setTimeout(() => startScanning(), 500);
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Scanner
          {(isScanning || processingUpload) && (
            <Badge variant="secondary" className="ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              {isScanning ? 'Scanning' : 'Processing'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Scan Mode Toggle */}
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

        {/* Camera Mode */}
        {scanMode === 'camera' && (
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Camera className="h-12 w-12 mb-2" />
                <p className="text-sm text-center">
                  {error ? "Camera unavailable" : "Camera ready to scan"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload Mode */}
        {scanMode === 'upload' && (
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

        {/* Control Buttons */}
        {scanMode === 'camera' && (
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

        {/* Device Selection */}
        {scanMode === 'camera' && devices.length > 1 && (
          <div className="text-xs text-gray-600">
            Camera: {selectedDevice?.label || 'Default'}
          </div>
        )}
      </CardContent>
    </Card>
  );  
};

export default QRCodeScanner;
