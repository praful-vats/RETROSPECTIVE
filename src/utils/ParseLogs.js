/**
 * Parse log text and extract timestamps
 * @param {string} logText - Raw log text
 * @returns {Array} Array of parsed log objects with timestamps and content
 */
export function parseLogs(logText) {
    // Split text into lines
    const lines = logText.split('\n').filter(line => line.trim());
    
    // Regular expressions to match timestamps
    // Format: YYYY-MM-DD HH:MM:SS,mmm or HH:MM:SS,mmm
    const fullTimestampRegex = /(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2},\d{3})/;
    const timeOnlyRegex = /(\d{2}:\d{2}:\d{2},\d{3})/;
    
    // Parse each line
    const parsedLines = lines.map(line => {
      let timestamp = null;
      let match;
      
      // Try to match full timestamp format
      match = line.match(fullTimestampRegex);
      if (match) {
        timestamp = match[1];
      } else {
        // Try to match time-only format
        match = line.match(timeOnlyRegex);
        if (match) {
          timestamp = match[1];
        }
      }
      
      // If timestamp found, create a log entry
      if (timestamp) {
        return {
          timestamp,
          content: line,
          timeSeconds: parseTimeToSeconds(timestamp)
        };
      }
      
      // Return a minimal object for lines without timestamps
      return {
        timestamp: '',
        content: line,
        timeSeconds: null
      };
    });
    
    // Filter out lines without timestamps and calculate time offsets
    const validLogs = parsedLines.filter(log => log.timeSeconds !== null);
    
    // If we have valid logs, calculate time offsets from the first timestamp
    if (validLogs.length > 0) {
      const firstTimeSeconds = validLogs[0].timeSeconds;
      
      return validLogs.map(log => ({
        ...log,
        timeOffset: log.timeSeconds - firstTimeSeconds
      }));
    }
    
    return [];
  }
  
  /**
   * Convert timestamp string to seconds
   * @param {string} timestamp - Timestamp string in format HH:MM:SS,mmm or YYYY-MM-DD HH:MM:SS,mmm
   * @returns {number} Time in seconds
   */
  function parseTimeToSeconds(timestamp) {
    let timeString = timestamp;
    
    // If timestamp includes date, extract only the time part
    if (timestamp.includes('-')) {
      timeString = timestamp.split(' ')[1];
    }
    
    // Parse HH:MM:SS,mmm
    const [time, milliseconds] = timeString.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    
    // Convert to seconds
    return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
  }