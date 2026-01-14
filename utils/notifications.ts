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

export async function scheduleDeadManNotifications(deadline: number) {
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
        title: "Check In Required",
        body: "You missed your check-in time. You have 24 hours to verify you are alive.",
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
        body: "Don't forget to check in by tomorrow morning.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(eveningReminder) },
    });
  }

  // 3. Urgent: 1 hour before deadline
  const urgent = deadline - (60 * 60 * 1000);
  if (urgent > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "URGENT: Check In Now",
        body: "You have 1 hour before emergency contacts are notified.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(urgent) },
    });
  }

  // 4. Critical: 10 mins before deadline
  const critical = deadline - (10 * 60 * 1000);
  if (critical > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "CRITICAL WARNING",
        body: "10 minutes remaining! Open the app NOW.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(critical) },
    });
  }

  // 5. Final: 1 min before deadline
  const final = deadline - (60 * 1000);
  if (final > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "LAST CHANCE",
        body: "1 minute remaining. Goodbye?",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(final) },
    });
  }
}
