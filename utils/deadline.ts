export function calculateNextDeadline(checkInHour: number, checkInMinute: number): number {
  const now = new Date();
  
  // Create a date object for "Today at CheckInTime"
  const scheduledTime = new Date(now);
  scheduledTime.setHours(checkInHour, checkInMinute, 0, 0);

  // If we are currently BEFORE the scheduled time today (e.g. It's 7am, Schedule is 8:30am)
  // Then the next deadline should be TODAY 8:30 + 24h Grace = Tomorrow 8:30 AM.
  // ...Wait. Logic check.
  // The user rule: "You check in every day at 8:30am."
  // If I check in at 7am Monday, I am checking in for "Monday 8:30am".
  // My NEXT check-in is due Tuesday 8:30am. 
  // The DEADLINE (when contacts are called) for Tuesday is Wednesday 8:30am (24h grace).
  
  // So:
  // If I check in NOW:
  // Find the *next* occurrence of 8:30 AM.
  // Add 24h grace period.
  
  // Case 1: Now is 7:00 AM. Schedule is 8:30 AM.
  // Next 8:30 is TODAY.
  // Deadline = Today 8:30 + 24h Grace = Tomorrow 8:30 AM. (Wait, that seems short?)
  
  // Let's re-read the spec: "You check in every day at 8:30am."
  // If I check in Monday 7am, I'm good for Monday. Next due is Tuesday 8:30am.
  // If I miss Tuesday 8:30am, I have grace until Wednesday 8:30am.
  // So checking in on Monday resets the clock to Wednesday 8:30am (Death Time).
  
  // Case 2: Now is 9:00 AM Monday. Schedule is 8:30 AM.
  // Next 8:30 is TUESDAY.
  // Death Time = Tuesday 8:30 + 24h Grace = Wednesday 8:30 AM.
  
  // CONCLUSION:
  // Death Time is always 8:30 AM on (Today + 2 days) roughly?
  // Basically: Find the Next Occurrence of CheckInTime. Add 24 hours.
  
  if (now.getTime() < scheduledTime.getTime()) {
    // Before 8:30 today. Next occurrence is Today.
    // Grace adds 24h. Total = Tomorrow 8:30 AM.
    // Wait... if I check in Monday 7am, I shouldn't die Tuesday 8:30am.
    // I should die Wednesday 8:30am.
    // Because Monday 8:30 is "covered". Tuesday 8:30 is "Next Due". Grace until Wed.
    
    // So we add 48 hours to the *previous* 8:30?
    // Or add 24 hours to the *next* 8:30?
    
    // Let's go with: Next Occurrence + 24 Hours.
    // If 7am Monday (Next is Mon 8:30): + 24h = Tues 8:30. (Too soon).
    
    // ADJUSTMENT:
    // If I check in *before* the time today, I am effectively "checking in early" for today.
    // So I am good for Today (Mon).
    // I am expected to check in Tomorrow (Tues).
    // If I miss Tues, grace ends Wed.
    // So Deadline = Today's CheckInTime + 48 Hours.
    
    // If I check in *after* the time (9am Mon), I am "late" for Mon (or "on time").
    // I am good for Mon.
    // Expected Tues.
    // Grace ends Wed.
    // Deadline = Today's CheckInTime + 48 Hours.
    
    // Is it always Today 8:30 + 48h?
    // If I check in Sunday 11pm. (Before Mon 8:30).
    // I am checking in for... Sunday? Or Monday?
    // If Sunday 8:30 is passed. It's Today 8:30 + 48h = Tues 8:30.
    
    // Let's stick to simple logic:
    // Anchor = Today at CheckInTime.
    // If Now < Anchor (Early morning): Anchor is Yesterday? 
    // No, let's just make it simple. 
    // Deadline = The *Next* CheckInTime + 24 Hours.
    
    // If 7am Mon: Next is Mon 8:30. +24h = Tues 8:30. (Still feels wrong. That's only 25h away).
    
    // Let's use the standard "48 hour window" but snapped to the time.
    // Snap current time to the *nearest previous* CheckInTime.
    // Add 48 Hours.
    
    // Ex: 7am Mon. Previous 8:30 was Sunday 8:30. + 48h = Tuesday 8:30.
    // Ex: 9am Mon. Previous 8:30 was Monday 8:30. + 48h = Wednesday 8:30.
    
    // THIS FEELS CORRECT.
  }
  
  // Re-calculating using "Previous" logic
  const previousAnchor = new Date(now);
  previousAnchor.setHours(checkInHour, checkInMinute, 0, 0);
  
  if (now.getTime() < previousAnchor.getTime()) {
    // If we are before the time today, the "previous" one was yesterday.
    previousAnchor.setDate(previousAnchor.getDate() - 1);
  }
  
  // Add 48 Hours to the previous anchor
  // 24h for the "current/missed" day + 24h Grace?
  // Let's assume standard is 48h life.
  
  const deadline = new Date(previousAnchor);
  deadline.setHours(deadline.getHours() + 48);
  
  return deadline.getTime();
}
