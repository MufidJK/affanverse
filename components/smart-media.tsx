'use client';
import { useState } from 'react';

export default function SmartMedia({ src, type, alt }: { src: string, type: string, alt: string }) {
  const [fitClass, setFitClass] = useState('object-contain'); // Default fallback
  const isVideo = type?.toLowerCase() === 'video';

  if (isVideo) {
    return (
      <video
        src={src}
        className={`w-full h-full transition-all duration-500 ${fitClass}`}
        autoPlay loop muted playsInline
        onLoadedMetadata={(e) => {
          const { videoWidth, videoHeight } = e.currentTarget;
          if (videoHeight > videoWidth) {
            setFitClass('object-cover'); // Zoom portrait videos
          }
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full transition-all duration-500 ${fitClass}`}
      loading="lazy"
      onLoad={(e) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalHeight > naturalWidth) {
          setFitClass('object-cover'); // Zoom portrait images
        }
      }}
    />
  );
}
