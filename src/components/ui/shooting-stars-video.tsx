"use client"

import { useEffect, useRef, useState } from "react"

export default function ShootingStarsVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setVideoLoaded(true)
      setVideoError(false)
    }

    const handleError = () => {
      setVideoError(true)
      setVideoLoaded(false)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded && !videoError ? 'opacity-40' : 'opacity-0'
        }`}
        style={{
          mixBlendMode: 'soft-light',
          filter: 'brightness(0.8) contrast(1.1)'
        }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        {/* Add your video source here */}
        <source src="/videos/shooting-stars-animation.mp4" type="video/mp4" />
        <source src="/videos/shooting-stars-animation.webm" type="video/webm" />
      </video>

      {/* Fallback CSS Animation for when video doesn't load */}
      {(videoError || !videoLoaded) && (
        <div className="absolute inset-0">
          {/* CSS-based fallback animation */}
          <div className="shooting-stars-fallback">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="shooting-star"
                style={{
                  '--delay': `${i * 0.5}s`,
                  '--duration': `${2 + Math.random() * 2}s`,
                  '--start-x': Math.random() > 0.5 ? '-100px' : 'calc(100vw + 100px)',
                  '--end-x': `${window.innerWidth / 2}px`,
                  '--start-y': `${10 + Math.random() * 80}vh`,
                  '--end-y': `${45 + Math.random() * 10}vh`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      )}

      {/* Gradient overlay to blend with background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 800px 400px at 50% 20%, rgba(34, 197, 94, 0.02) 0%, transparent 50%),
            radial-gradient(ellipse 600px 300px at 80% 80%, rgba(16, 185, 129, 0.01) 0%, transparent 50%)
          `,
        }}
      />

      {/* CSS for fallback animation */}
      <style jsx>{`
        .shooting-stars-fallback {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .shooting-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: linear-gradient(45deg, transparent, #22c55e, transparent);
          border-radius: 50%;
          animation: shootingStar var(--duration) linear infinite;
          animation-delay: var(--delay);
          opacity: 0;
        }

        .shooting-star::before {
          content: '';
          position: absolute;
          top: 50%;
          right: 100%;
          width: 100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), transparent);
          transform: translateY(-50%);
        }

        @keyframes shootingStar {
          0% {
            transform: translateX(var(--start-x)) translateY(var(--start-y)) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
            transform: translateX(var(--end-x)) translateY(var(--end-y)) scale(0.3);
          }
          100% {
            transform: translateX(var(--end-x)) translateY(var(--end-y)) scale(0.1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}