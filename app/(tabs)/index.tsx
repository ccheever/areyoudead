import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUserId } from "../../hooks/useUserId";
import { useEffect } from "react";
import { Link } from "expo-router";
import { calculateNextDeadline } from "../../utils/deadline";
import { scheduleDeadManNotifications, registerForPushNotificationsAsync } from "../../utils/notifications";

export default function HomeScreen() {
  const userId = useUserId();
  const user = useQuery(api.users.getUser, userId ? { token: userId } : "skip");
  const checkIn = useMutation(api.users.checkIn);
  const getOrCreate = useMutation(api.users.getOrCreateUser);

  // Ensure user exists on server
  useEffect(() => {
    if (userId) {
      getOrCreate({ token: userId });
      registerForPushNotificationsAsync();
    }
  }, [userId]);

  const handleCheckIn = async () => {
    if (userId && user) {
      // Use user preferences or defaults
      const h = user.checkInHour ?? 8;
      const m = user.checkInMinute ?? 30;
      
      const nextDeadline = calculateNextDeadline(h, m);
      
      await checkIn({ 
        token: userId,
        nextDeadline 
      });
      
      await scheduleDeadManNotifications(nextDeadline);
    }
  };

  if (!userId || user === undefined) {
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // Calculate time remaining based on SERVER deadline
  // If user.nextDeadline is missing (old user), fallback to calculating it now
  const deadline = user?.nextDeadline ?? (user ? user.lastCheckIn + (48 * 60 * 60 * 1000) : Date.now());
  const timeRemaining = Math.max(0, deadline - Date.now());
  
  const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

  const isDead = timeRemaining <= 0;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ARE YOU DEAD?</Text>
      
      <View style={styles.timerContainer}>
        {isDead ? (
            <Text style={[styles.timerText, { color: 'red' }]}>YOU ARE DEAD</Text>
        ) : (
            <>
                <Text style={styles.label}>Time Remaining:</Text>
                <Text style={styles.timerText}>{days}d {hours}h {minutes}m</Text>
                <Text style={styles.subText}>
                    Deadline: {new Date(deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' })}
                </Text>
            </>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.mainButton, isDead && styles.deadButton]} 
        onPress={handleCheckIn}
      >
        <Text style={styles.buttonText}>{isDead ? "REVIVE ME" : "I'M ALIVE"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  timerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  timerText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#333',
  },
  subText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  mainButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deadButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
