import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

function Waveform({ audioFile, onWaveformReady, onTimeUpdate }) {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastReportedTimeRef = useRef(0);
  
  // Stop animation frame when component unmounts
  const cancelAnimationFrame = () => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Set up continuous time reporting during playback
  const setupContinuousTimeReporting = (wavesurfer) => {
    const reportTime = () => {
      if (wavesurfer && wavesurfer.isPlaying()) {
        const currentTime = wavesurfer.getCurrentTime();
        
        // Only report time if it's different from last time (avoid duplicate reports)
        if (Math.abs(currentTime - lastReportedTimeRef.current) > 0.01) { // 10ms threshold
          lastReportedTimeRef.current = currentTime;
          onTimeUpdate(currentTime);
        }
        
        // Continue the loop while playing
        animationFrameRef.current = window.requestAnimationFrame(reportTime);
      }
    };
    
    // Start the loop
    animationFrameRef.current = window.requestAnimationFrame(reportTime);
  };
  
  useEffect(() => {
    if (!audioFile) return;
    
    // Clean up previous instance and animation
    cancelAnimationFrame();
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
    
    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4a83ff',
      progressColor: '#1e40af',
      cursorColor: '#2563eb',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 100,
      barGap: 2,
      responsive: true,
      interact: true,    // Enable interactions
      autoScroll: false, // Disable auto-scrolling to match our own implementation
      normalize: true    // Normalize for better visualization
    });
    
    // Load audio file
    wavesurfer.loadBlob(audioFile);
    
    // Event handlers
    wavesurfer.on('ready', () => {
      wavesurferRef.current = wavesurfer;
      onWaveformReady(wavesurfer);
      
      // Report initial time on load
      onTimeUpdate(wavesurfer.getCurrentTime());
    });
    
    // Listen for all possible time update events 
    wavesurfer.on('play', () => {
      setIsPlaying(true);
      lastReportedTimeRef.current = wavesurfer.getCurrentTime();
      onTimeUpdate(wavesurfer.getCurrentTime());
      setupContinuousTimeReporting(wavesurfer);
    });
    
    wavesurfer.on('pause', () => {
      setIsPlaying(false);
      cancelAnimationFrame();
      // Report final time on pause to ensure sync
      onTimeUpdate(wavesurfer.getCurrentTime());
    });
    
    wavesurfer.on('finish', () => {
      setIsPlaying(false);
      cancelAnimationFrame();
      onTimeUpdate(wavesurfer.getCurrentTime());
    });
    
    // Handle seeking events
    wavesurfer.on('seek', () => {
      const currentTime = wavesurfer.getCurrentTime();
      lastReportedTimeRef.current = currentTime;
      onTimeUpdate(currentTime);
    });
    
    // Handle user interaction
    wavesurfer.on('interaction', () => {
      const currentTime = wavesurfer.getCurrentTime();
      lastReportedTimeRef.current = currentTime;
      onTimeUpdate(currentTime);
    });
    
    // Clean up on unmount
    return () => {
      cancelAnimationFrame();
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioFile, onWaveformReady, onTimeUpdate]);
  
  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };
  
  // Precision seek to exact time in seconds
  const seekTo = (seconds) => {
    if (wavesurferRef.current) {
      const duration = wavesurferRef.current.getDuration() || 1;
      const normalizedPosition = Math.max(0, Math.min(1, seconds / duration));
      wavesurferRef.current.seekTo(normalizedPosition);
      onTimeUpdate(seconds);
    }
  };
  
  return (
    <div className="waveform">
      <div className="waveform-controls">
        <button 
          className="play-button" 
          onClick={togglePlayPause}
          disabled={!wavesurferRef.current}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        {wavesurferRef.current && (
          <div className="time-display">
            {formatTime(wavesurferRef.current.getCurrentTime())} / 
            {formatTime(wavesurferRef.current.getDuration() || 0)}
          </div>
        )}
      </div>
      <div ref={waveformRef} className="waveform-display"></div>
    </div>
  );
}

// Helper function to format time in MM:SS.MS format for precision
function formatTime(seconds) {
  if (!seconds) return '00:00.000';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

export default Waveform;