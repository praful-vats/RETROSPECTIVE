// App.jsx
import { useState, useCallback, useEffect } from 'react';
import Waveform from './components/Waveform';
import LogPane from './components/LogPane';
import { parseLogs } from './utils/ParseLogs';
import './App.css';

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [logText, setLogText] = useState('');
  const [logFile, setLogFile] = useState(null);
  const [wave, setWave] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [parsedLogs, setParsedLogs] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleLogTextChange = (e) => {
    setLogText(e.target.value);
  };

  const handleLogFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Process log text whenever it changes
  useEffect(() => {
    if (logText) {
      const logs = parseLogs(logText);
      setParsedLogs(logs);
    }
  }, [logText]);

  // When both audio and logs are loaded, mark as ready
  useEffect(() => {
    setIsReady(audioFile !== null && parsedLogs.length > 0 && wave !== null);
  }, [audioFile, parsedLogs, wave]);

  // This handler is critical for continuous time updates
  const handleTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  const handleSeekToLogTime = useCallback((timeInSeconds) => {
    if (wave && isReady) {
      const duration = wave.getDuration();
      if (duration > 0) {
        const seekPosition = timeInSeconds / duration;
        wave.seekTo(Math.min(1, Math.max(0, seekPosition)));
      }
    }
  }, [wave, isReady]);

  return (
    <div className="app">
      <header>
        <h1>RETROSPECTIVE</h1>
      </header>
      
      <div className="input-section">
        <div className="input-group">
          <label htmlFor="audio-upload">Upload Audio File:</label>
          <input 
            type="file" 
            id="audio-upload" 
            accept="audio/*" 
            onChange={handleAudioFileChange} 
          />
        </div>
        
        <div className="input-group">
          <label>Log Input:</label>
          <div className="log-input-options">
            <div className="input-option">
              <label htmlFor="log-textarea">Or Paste Log Text:</label>
              <textarea 
                id="log-textarea"
                value={logText}
                onChange={handleLogTextChange}
                placeholder="Paste log text here..."
                rows={5}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Replace the separate sections with a side-by-side layout */}
      {(audioFile || parsedLogs.length > 0) && (
        <div className="main-content">
          <div className="left-panel">
            {audioFile ? (
              <div className="waveform-container">
                <Waveform 
                  audioFile={audioFile} 
                  onWaveformReady={setWave}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
            ) : (
              <div className="placeholder">Upload an audio file to see waveform</div>
            )}
          </div>
          
          <div className="right-panel">
            {parsedLogs.length > 0 ? (
              <div className="log-container">
                <LogPane 
                  logs={parsedLogs} 
                  currentTime={currentTime}
                  onLogClick={handleSeekToLogTime}
                />
              </div>
            ) : (
              <div className="placeholder">Upload or paste logs to see them here</div>
            )}
          </div>
        </div>
      )}

      {!isReady && parsedLogs.length > 0 && audioFile && (
        <div className="loading-message">Loading audio waveform...</div>
      )}

      {!parsedLogs.length && !audioFile && (
        <div className="instructions">
          <p>Upload an audio file and paste or upload log text to begin synchronization.</p>
          <p>The log text should contain timestamps in the format HH:MM:SS,mmm or YYYY-MM-DD HH:MM:SS,mmm.</p>
        </div>
      )}
    </div>
  );
}

export default App;