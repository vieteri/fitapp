export function formatDate(date: string | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Formats duration string to "x hours y minutes z seconds" format
 * Accepts various input formats like "1:30:45", "90:30", "3600", etc.
 */
export function formatDuration(duration: string | null | undefined): string {
  if (!duration) return '';
  
  // Parse duration from various formats
  let totalSeconds = 0;
  
  // If it's just a number (seconds)
  if (/^\d+$/.test(duration)) {
    totalSeconds = parseInt(duration);
  }
  // If it's in HH:MM:SS or MM:SS format
  else if (duration.includes(':')) {
    const parts = duration.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 3) {
      // HH:MM:SS
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      totalSeconds = parts[0] * 60 + parts[1];
    }
  }
  // If it's a decimal number (minutes)
  else if (/^\d*\.?\d+$/.test(duration)) {
    totalSeconds = Math.round(parseFloat(duration) * 60);
  }
  
  if (totalSeconds <= 0) return '';
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  
  return parts.join(' ');
}

/**
 * Parses duration input and returns seconds
 */
export function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  
  // If it's just a number (seconds)
  if (/^\d+$/.test(duration)) {
    return parseInt(duration);
  }
  // If it's in HH:MM:SS or MM:SS format
  else if (duration.includes(':')) {
    const parts = duration.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    }
  }
  // If it's a decimal number (minutes)
  else if (/^\d*\.?\d+$/.test(duration)) {
    return Math.round(parseFloat(duration) * 60);
  }
  
  return 0;
}