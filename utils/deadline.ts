export function calculateNextDeadline(checkInHour: number, checkInMinute: number, debugMode?: string): number {
  const now = new Date();

  if (debugMode === "10sec") {
    // 10 second check-in window.
    // Deadline is in 20 seconds.
    // (So you have 20 seconds of life upon check-in)
    return now.getTime() + 20 * 1000;
  }
  
  if (debugMode === "1min") {
    // 1 minute check-in window.
    // Deadline is in 2 minutes.
    return now.getTime() + 2 * 60 * 1000;
  }
  
  // Standard Daily Logic
  const previousAnchor = new Date(now);
  previousAnchor.setHours(checkInHour, checkInMinute, 0, 0);
  
  if (now.getTime() < previousAnchor.getTime()) {
    // If we are before the time today, the "previous" one was yesterday.
    previousAnchor.setDate(previousAnchor.getDate() - 1);
  }
  
  // Add 48 Hours to the previous anchor
  const deadline = new Date(previousAnchor);
  deadline.setHours(deadline.getHours() + 48);
  
  return deadline.getTime();
}
