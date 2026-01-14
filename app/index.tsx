import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUserId } from "../hooks/useUserId";
import { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { calculateNextDeadline } from "../utils/deadline";
import { scheduleDeadManNotifications, registerForPushNotificationsAsync } from "../utils/notifications";
import { BlurView } from 'expo-blur';
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const userId = useUserId();
  const user = useQuery(api.users.getUser, userId ? { token: userId } : "skip");
  const userContacts = useQuery(api.contacts.getContacts, userId ? { userToken: userId } : "skip");
  const checkIn = useMutation(api.users.checkIn);
  const getOrCreate = useMutation(api.users.getOrCreateUser);
  const router = useRouter();

  const [tick, setTick] = useState(0);

  // Force re-render every second to update timer and button state logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ensure user exists on server
  useEffect(() => {
    if (userId) {
      getOrCreate({ token: userId });
      registerForPushNotificationsAsync();
    }
  }, [userId]);

  const handleCheckIn = async (debugMode?: string) => {
    if (userId && user) {
      // Use user preferences or defaults
      const h = user.checkInHour ?? 8;
      const m = user.checkInMinute ?? 30;
      
      const nextDeadline = calculateNextDeadline(h, m, debugMode);
      
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

  // Calculate Daily Window Logic
  // Determine the start of the current "Check-In Cycle"
  const now = new Date();
  const h = user?.checkInHour ?? 8;
  const m = user?.checkInMinute ?? 30;
  const debugMode = user?.debugMode ?? "standard";

  let cycleStart = new Date(now);
  let nextWindowStart = new Date(now);
  
  if (debugMode === "10sec") {
      cycleStart = new Date(now.getTime() - 10000); 
  } else if (debugMode === "1min") {
      cycleStart = new Date(now.getTime() - 60000);
  } else {
      // Standard
      cycleStart.setHours(h, m, 0, 0);
      if (now < cycleStart) {
          cycleStart.setDate(cycleStart.getDate() - 1);
      }
  }
  
  const hasCheckedInToday = user ? user.lastCheckIn > cycleStart.getTime() : false;

  // Next Window Display
  if (debugMode === "10sec") {
      nextWindowStart = new Date((user?.lastCheckIn || 0) + 10000);
  } else if (debugMode === "1min") {
      nextWindowStart = new Date((user?.lastCheckIn || 0) + 60000);
  } else {
      nextWindowStart = new Date(cycleStart);
      nextWindowStart.setDate(nextWindowStart.getDate() + 1);
  }
  
  // Ensure Next Window is in the future if we haven't checked in yet?
  // No, if we haven't checked in, the "next window" logic doesn't apply for lockout.
  // But for display purposes:
  const isButtonLocked = hasCheckedInToday;

  // Deadline Logic
  const deadline = user?.nextDeadline ?? (user ? user.lastCheckIn + (48 * 60 * 60 * 1000) : Date.now());
  const timeRemaining = Math.max(0, deadline - Date.now());
  const oneHour = 60 * 60 * 1000;
  
  const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

  const isDead = timeRemaining <= 0;
  const isUrgent = timeRemaining < oneHour;

  const deadlineDate = new Date(deadline);
  const deadlineString = deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', weekday: 'long' });
  
  let nextWindowString = "";
  if (debugMode === "standard" || !debugMode) {
      nextWindowString = nextWindowStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " tomorrow";
  } else {
      // For fast modes, show relative or absolute seconds
      const secUntilUnlock = Math.max(0, Math.ceil((nextWindowStart.getTime() - now.getTime()) / 1000));
      nextWindowString = `in ${secUntilUnlock}s`;
  }

  const isFastMode = debugMode !== "standard";

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ARE YOU DEAD?</Text>
      
      <View style={styles.timerContainer}>
        {isDead ? (
            <Text style={[styles.timerText, { color: 'red' }]}>YOU ARE DEAD</Text>
        ) : (
            <>
                {/* Hide deadline text if already checked in (Safe) */}
                {!hasCheckedInToday && (
                    <>
                        {isUrgent || isFastMode ? (
                        <>
                            <Text style={[styles.label, { color: isUrgent ? '#FF3B30' : '#666' }]}>
                                {isUrgent ? "TIME REMAINING:" : "Next Deadline:"}
                            </Text>
                            <Text style={[styles.timerText, { color: isUrgent ? '#FF3B30' : '#333' }]}>
                            {hours}h {minutes}m {seconds}s
                            </Text>
                        </>
                        ) : (
                        <Text style={styles.subtleText}>
                            Check in before {deadlineString}
                        </Text>
                        )}
                    </>
                )}
                
                {hasCheckedInToday && (
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.subtleText, { color: '#34C759', fontSize: 24, fontWeight: 'bold' }]}>
                            You are safe.
                        </Text>
                        {isFastMode && (
                            <Text style={styles.debugInfo}>
                                Safe until: {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </Text>
                        )}
                    </View>
                )}
            </>
        )}
      </View>

      <TouchableOpacity 
        style={[
            styles.mainButton, 
            isDead && styles.deadButton,
            isButtonLocked && !isDead && styles.disabledButton
        ]} 
        onPress={() => handleCheckIn(debugMode)}
        disabled={isButtonLocked && !isDead}
      >
        <Text style={[styles.buttonText, isButtonLocked && styles.disabledButtonText]}>
            {isDead ? "REVIVE ME" : (isButtonLocked ? "I'm glad you're\nalive today" : "I'M ALIVE")}
        </Text>
      </TouchableOpacity>

      {isButtonLocked && !isDead && (
          <Text style={styles.nextCheckInText}>
            Check in again {nextWindowString}
          </Text>
      )}

      {userContacts !== undefined && userContacts.length === 0 && (
        <TouchableOpacity style={styles.addContactButton} onPress={() => router.push("/settings")}>
            <Text style={styles.addContactButtonText}>Add Emergency Contact</Text>
        </TouchableOpacity>
      )}

      {/* Liquid Glass Settings Button */}
      <View style={styles.settingsContainer}>
          <Link href="/settings" asChild>
            <TouchableOpacity>
                <BlurView intensity={80} tint="light" style={styles.glassButton}>
                    <Ionicons name="settings-outline" size={24} color="#333" />
                </BlurView>
            </TouchableOpacity>
          </Link>
      </View>
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
    marginBottom: 40,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  timerContainer: {
    marginBottom: 40,
    alignItems: 'center',
    minHeight: 80, 
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#333',
    fontVariant: ['tabular-nums'], // Keep numbers from jumping
  },
  subtleText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  debugInfo: {
      marginTop: 5,
      fontSize: 12,
      color: '#aaa',
      fontFamily: 'Courier',
  },
  nextCheckInText: {
    fontSize: 14,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
  mainButton: {
    width: 240, 
    height: 240,
    borderRadius: 120,
    backgroundColor: '#34C759', 
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 20,
  },
  deadButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButtonText: {
    color: '#666',
    fontSize: 20, 
    fontWeight: '600',
  },
  settingsContainer: {
      position: 'absolute',
      bottom: 40,
      right: 30,
  },
  glassButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  addContactButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
  },
  addContactButtonText: {
      color: '#007AFF',
      fontSize: 16,
      fontWeight: '600',
  }
});