# Log-Audio Synchronizer

A React application that synchronizes audio recordings with timestamped log files. This tool is particularly useful for analyzing phone calls alongside their corresponding log data.

## Features

- Load audio files (WAV, MP3, OGG) and visualize their waveform
- Input log data via direct paste or file upload
- Bidirectional synchronization between audio and logs:
  - Click anywhere on the waveform to highlight the corresponding log entry
  - Click any log entry to seek to that position in the audio
- Automatic timestamp parsing (formats: `YYYY-MM-DD HH:MM:SS,mmm` or `HH:MM:SS,mmm`)
- Performance optimized for handling large log files (up to 20,000 lines)
- Clean, minimal UI with intuitive controls

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. The application will open in your default browser at `http://localhost:3000`

## Usage

1. Upload an audio file (WAV, MP3, OGG)
2. Paste log text or upload a log file (.log, .txt)
3. Play the audio or click anywhere on the waveform to navigate
4. The current log entry will be highlighted and scrolled into view
5. Click any log entry to jump to that position in the audio

## Key Implementation Details

- **Bidirectional Sync Logic:**
  - When audio time changes (via playing or seeking), the closest log entry is located using a minimum time difference algorithm
  - When a log entry is clicked, the audio is seeked to the corresponding time using `wavesurfer.seekTo()`
  - Debouncing is applied to prevent performance issues during rapid time updates

- **Log Parsing Logic:**
  - Regular expressions extract timestamps from various formats
  - All timestamps are converted to seconds offset from the first log entry
  - This normalization allows easy synchronization with the audio timeline

- **Performance Optimizations:**
  - Highlight updates are debounced to maintain smooth performance
  - Effective DOM manipulation with selective scrolling
