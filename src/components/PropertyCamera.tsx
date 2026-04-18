import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, CameraOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyCameraProps {
  onCapture: (imageUrl: string) => void;
  onClose: () => void;
}

export const PropertyCamera: React.FC<PropertyCameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Désolé, impossible d'accéder à votre caméra. Vérifiez les autorisations.");
    }
  }, [stream]);

  React.useEffect(() => {
    startCamera(cameraMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const switchCamera = () => {
    const newMode = cameraMode === 'user' ? 'environment' : 'user';
    setCameraMode(newMode);
    startCamera(newMode);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!capturedImage ? (
            <motion.div 
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              {error ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white">
                  <CameraOff size={48} className="text-gray-500 mb-4" />
                  <p className="font-medium mb-4">{error}</p>
                  <button onClick={onClose} className="px-6 py-2 bg-gray-700 rounded-full font-bold">Retour</button>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-4">
                     <button onClick={switchCamera} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition">
                       <RefreshCw size={24} />
                     </button>
                     <button onClick={onClose} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition">
                       <X size={24} />
                     </button>
                  </div>
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                    <button 
                      onClick={takePhoto} 
                      className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition"
                    >
                      <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full flex flex-col"
            >
              <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
              <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent">
                  <button 
                    onClick={retake} 
                    className="flex-1 py-4 bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/30 transition flex items-center justify-center gap-2"
                  >
                    REPRENDRE
                  </button>
                  <button 
                    onClick={handleConfirm} 
                    className="flex-1 py-4 bg-brand-orange text-white font-bold rounded-2xl shadow-xl hover:bg-orange-600 transition flex items-center justify-center gap-2"
                  >
                    VALIDER <Check size={20} />
                  </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Invisible canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
