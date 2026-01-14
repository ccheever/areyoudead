import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  return true;
}

export async function scheduleDeadManNotifications(deadline: number, debugMode: string = "standard") {
  // Cancel all existing to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = Date.now();
  
  // Define triggers relative to the DEADLINE
  // The deadline is "Tuesday 8:30 AM" (End of Grace Period)
  
  // 1. Reminder: 24h before deadline (i.e. Monday 8:30 AM - Start of Grace Period)
  const graceStart = deadline - (24 * 60 * 60 * 1000);
  if (graceStart > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Are you alive?",
        body: "It's time for your daily check in. If you don't check in by this time tomorrow, we'll notify your contacts. I'll remind you later if you don't do it now.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(graceStart) },
    });
  }

  // 2. Reminder: ~14h before deadline (Monday 6:00 PM)
  // Logic: graceStart (8:30 AM) + 9.5 hours = 6:00 PM
  const eveningReminder = graceStart + (9.5 * 60 * 60 * 1000);
  if (eveningReminder > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Reminder: Are You Dead?",
        body: "Still waiting for you to check in!",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(eveningReminder) },
    });
  }

  // 3. Urgent: 1 hour before deadline
  const urgent = deadline - (60 * 60 * 1000);
  if (urgent > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Starting to worry about you",
        body: "I'm going to reach out to your emergency contacts in 1 hour if you don't check in.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(urgent) },
    });
  }

  // 4. Critical: 10 mins before deadline
  const critical = deadline - (10 * 60 * 1000);
  if (critical > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "I think you're dead :|",
        body: "Going to let your contacts know in 10 minutes",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(critical) },
    });
  }

  // 5. Final: 1 min before deadline
  const final = deadline - (60 * 1000);
  if (final > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Goodbye?",
        body: ":(",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(final) },
    });
  }

  // 6. At deadline: contacts have been notified
  if (deadline > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your contacts have been notified",
        body: "We've reached out to your emergency contacts to let them know you may need help.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(deadline) },
    });
  }

  // Debug mode notifications
  if (debugMode === "1min") {
    // Fast mode: 30s, 10s, 1s warnings
    const debug30s = deadline - (30 * 1000);
    if (debug30s > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "[DEBUG] 30s remaining",
          body: `Deadline: ${new Date(deadline).toISOString()}`,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(debug30s) },
      });
    }

    const debug10s = deadline - (10 * 1000);
    if (debug10s > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "[DEBUG] 10s remaining",
          body: `Deadline: ${new Date(deadline).toISOString()}`,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(debug10s) },
      });
    }

    const debug1s = deadline - (1 * 1000);
    if (debug1s > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "[DEBUG] 1s remaining",
          body: `Deadline: ${new Date(deadline).toISOString()}`,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(debug1s) },
      });
    }
  } else if (debugMode === "10sec") {
    // Hyper mode: 5s, 1s warnings
    const debug5s = deadline - (5 * 1000);
    if (debug5s > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "[DEBUG] 5s remaining",
          body: `Deadline: ${new Date(deadline).toISOString()}`,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(debug5s) },
      });
    }

    const debug1s = deadline - (1 * 1000);
    if (debug1s > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "[DEBUG] 1s remaining",
          body: `Deadline: ${new Date(deadline).toISOString()}`,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(debug1s) },
      });
    }
  }
}
