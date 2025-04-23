import { useEffect, useRef, useState, useCallback } from 'react';

function LogPane({ logs, currentTime, onLogClick }) {
  const logContainerRef = useRef(null);
  const [highlightedLogIndex, setHighlightedLogIndex] = useState(-1);
  const lastUpdateTimeRef = useRef(0);
  
  // Find the closest log entry to the current time
  const findClosestLogIndex = useCallback((time) => {
    if (!logs || logs.length === 0) return -1;
    
    let closestIndex = 0;
    let minTimeDiff = Infinity;
    
    for (let i = 0; i < logs.length; i++) {
      const timeDiff = Math.abs(logs[i].timeOffset - time);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  }, [logs]);
  
  // Update highlighted log whenever currentTime changes
  // We removed debouncing to ensure real-time updates
  useEffect(() => {
    // Throttle updates to avoid too frequent DOM changes
    // but ensure it's responsive enough for real-time playback
    const now = Date.now();
    if (now - lastUpdateTimeRef.current > 50) { // 20fps is usually smooth enough
      const newIndex = findClosestLogIndex(currentTime);
      if (newIndex !== highlightedLogIndex) {
        setHighlightedLogIndex(newIndex);
        lastUpdateTimeRef.current = now;
      }
    }
  }, [currentTime, findClosestLogIndex, highlightedLogIndex]);
  
  // Smooth scroll to highlighted log with improved behavior
  useEffect(() => {
    if (highlightedLogIndex >= 0 && logContainerRef.current) {
      const logElements = logContainerRef.current.querySelectorAll('.log-line');
      if (logElements[highlightedLogIndex]) {
        // Use a more efficient scrolling approach for continuous playback
        const container = logContainerRef.current;
        const element = logElements[highlightedLogIndex];
        
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Only scroll if the element is not fully visible
        const isFullyVisible = 
          elementRect.top >= containerRect.top && 
          elementRect.bottom <= containerRect.bottom;
          
        if (!isFullyVisible) {
          element.scrollIntoView({
            behavior: 'auto', // Use 'auto' for smoother continuous updates
            block: 'nearest'  // Only scroll the minimum necessary amount
          });
        }
      }
    }
  }, [highlightedLogIndex]);
  
  const handleLogClick = (index) => {
    if (onLogClick && logs[index]) {
      onLogClick(logs[index].timeOffset);
      setHighlightedLogIndex(index);
    }
  };
  
  return (
    <div className="log-pane">
      <div className="log-header">
        <h3>Log Entries ({logs.length})</h3>
      </div>
      <div className="log-content" ref={logContainerRef}>
        {logs.map((log, index) => (
          <div
            key={index}
            className={`log-line ${highlightedLogIndex === index ? 'highlight' : ''}`}
            onClick={() => handleLogClick(index)}
          >
            <span className="log-timestamp">[{log.timestamp}]</span>
            <span className="log-text">{log.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LogPane;