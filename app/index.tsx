import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ImageBackground } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUserId } from "../hooks/useUserId";
import { useNearestCity } from "../hooks/useNearestCity";
import { useEffect, useState, useRef } from "react";
import { Link, useRouter } from "expo-router";
import { calculateNextDeadline } from "../utils/deadline";
import { scheduleDeadManNotifications, registerForPushNotificationsAsync } from "../utils/notifications";
import { BlurView } from 'expo-blur';
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const userId = useUserId();
  const user = useQuery(api.users.getUser, userId ? { token: userId } : "skip");
  const userContacts = useQuery(api.contacts.getContacts, userId ? { userToken: userId } : "skip");
  const checkIn = useMutation(api.users.checkIn);
  const getOrCreate = useMutation(api.users.getOrCreateUser);
  const router = useRouter();
  const { imageSource: cityBackground } = useNearestCity();

  const [tick, setTick] = useState(0);
  const scaleValue = useRef(new Animated.Value(1)).current;

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
    // Haptics
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();

    if (userId && user) {
      const h = user.checkInHour ?? 8;
      const m = user.checkInMinute ?? 30;
      const nextDeadline = calculateNextDeadline(h, m, debugMode);
      
      await checkIn({ 
        token: userId,
        nextDeadline 
      });
      await scheduleDeadManNotifications(nextDeadline, debugMode);
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
      cycleStart.setHours(h, m, 0, 0);
      if (now < cycleStart) {
          cycleStart.setDate(cycleStart.getDate() - 1);
      }
  }
  
  const hasCheckedInToday = user ? user.lastCheckIn > cycleStart.getTime() : false;

  if (debugMode === "10sec") {
      nextWindowStart = new Date((user?.lastCheckIn || 0) + 10000);
  } else if (debugMode === "1min") {
      nextWindowStart = new Date((user?.lastCheckIn || 0) + 60000);
  } else {
      nextWindowStart = new Date(cycleStart);
      nextWindowStart.setDate(nextWindowStart.getDate() + 1);
  }
  
  const isButtonLocked = hasCheckedInToday;

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
      const secUntilUnlock = Math.max(0, Math.ceil((nextWindowStart.getTime() - now.getTime()) / 1000));
      nextWindowString = `in ${secUntilUnlock}s`;
  }

  const isFastMode = debugMode !== "standard";

  return (
    <ImageBackground
      source={cityBackground}
      style={styles.background}
      imageStyle={{ opacity: 0.5 }}
      resizeMode="cover"
    >
      <View style={styles.screen}>
        <Text style={styles.title}>ARE YOU DEAD?</Text>
        
        <View style={styles.timerContainer}>
          {isDead ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.timerText, { color: 'red' }]}>WORRIED ABOUT YOU</Text>
                <Text style={[styles.subtleText, { color: '#666', fontSize: 14, marginTop: 8 }]}>We notified your emergency contacts that you haven't checked in for a while</Text>
              </View>
          ) : (
              <>
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
                          <Text style={[styles.subtleText, { color: '#000', fontSize: 24, fontWeight: '700' }]}>
                          You're ok
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
          onPress={() => handleCheckIn(debugMode)}
          disabled={isButtonLocked && !isDead}
          activeOpacity={0.85}
        >
          <Animated.View style={[
              styles.greenButtonContainer,
              { transform: [{ scale: scaleValue }] },
              isButtonLocked && !isDead && styles.greenButtonDisabled,
              isDead && styles.greenButtonUrgent,
          ]}>
              <Text style={[
                styles.greenButtonText,
                isButtonLocked && !isDead && styles.greenButtonTextDisabled,
              ]}>
                {isDead ? "CHECK IN" : (isButtonLocked ? "GLAD YOU'RE\nALIVE TODAY" : "CHECK IN")}
              </Text>
          </Animated.View>
        </TouchableOpacity>

        {isButtonLocked && !isDead && (
            <Text style={styles.nextCheckInText}>
              Check in again {nextWindowString}
            </Text>
        )}

        {userContacts !== undefined && userContacts.length === 0 && (
          <TouchableOpacity style={styles.addContactButton} onPress={() => router.push("/contacts")}>
              <Ionicons name="warning" size={20} color="#FF9500" style={{ marginBottom: 4 }} />
              <Text style={styles.addContactButtonText}>No emergency contacts set</Text>
              <Text style={styles.addContactSubtext}>Tap to add someone to notify if you don't check in</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomButtonsContainer}>
            <Link href="/contacts" asChild>
              <TouchableOpacity>
                  <BlurView intensity={80} tint="light" style={styles.glassButton}>
                      <Ionicons name="people-outline" size={24} color="#333" />
                  </BlurView>
              </TouchableOpacity>
            </Link>
            <Link href="/settings" asChild>
              <TouchableOpacity>
                  <BlurView intensity={80} tint="light" style={styles.glassButton}>
                      <Ionicons name="settings-outline" size={24} color="#333" />
                  </BlurView>
              </TouchableOpacity>
            </Link>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  screen: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 50,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
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
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  subtleText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    fontWeight: '600',
  },
  debugInfo: {
    marginTop: 5,
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'Courier',
  },
  nextCheckInText: {
    fontSize: 18,
    color: '#444',
    marginTop: 30,
    textAlign: 'center',
    fontWeight: '400',
  },
  greenButtonContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  greenButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#8E8E93',
    shadowColor: '#8E8E93',
  },
  greenButtonUrgent: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  greenButtonText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  greenButtonTextDisabled: {
    fontSize: 22,
    fontWeight: '600',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    flexDirection: 'row',
    gap: 12,
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
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF9500',
    alignItems: 'center',
  },
  addContactButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  addContactSubtext: {
    color: '#666',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },
});