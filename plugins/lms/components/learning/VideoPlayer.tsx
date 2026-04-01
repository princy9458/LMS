'use client';

import React from 'react';

interface VideoPlayerProps {
  url: string;
  onEnded?: () => void;
}

export function VideoPlayer({ url, onEnded }: VideoPlayerProps) {
  // Check if it's a YouTube link
  const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be');
  
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (!url) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 gap-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <p className="text-zinc-500 font-medium">No video content for this lesson.</p>
      </div>
    );
  }

  if (isYouTube) {
    const videoId = getYouTubeId(url);
    return (
      <iframe
        className="w-full h-full border-0"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      className="w-full h-full object-contain"
      src={url}
      controls
      autoPlay
      onEnded={onEnded}
    />
  );
}
