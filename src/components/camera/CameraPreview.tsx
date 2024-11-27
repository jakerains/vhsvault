import React, { useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';

interface CameraPreviewProps {
  onCapture: (imageData: string) => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Failed to initialize camera:', error);
      }
    };

    initCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    onCapture(imageData);
  };

  return (
    <div className="relative aspect-video">
      <video
        ref={videoRef}
        className="w-full h-full rounded-lg"
        autoPlay
        playsInline
      />
      <button
        onClick={handleCapture}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 retro-button"
      >
        <Camera size={20} className="mr-2" />
        Capture
      </button>
    </div>
  );
};