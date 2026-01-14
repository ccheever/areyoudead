import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ImageBackground, Image } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUserId } from "../hooks/useUserId";
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
      source={require("../assets/pink_background.jpeg")} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.screen}>
        <Text style={styles.title}>IS AMANDA WALL DEAD?</Text>
        
        <View style={styles.timerContainer}>
          {isDead ? (
              <Text style={[styles.timerText, { color: 'red' }]}>WORRIED U R DEAD</Text>
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
                          <Text style={[styles.subtleText, { color: '#000', fontSize: 24, fontFamily: 'JosefinSans_700Bold' }]}>
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
          activeOpacity={0.8}
        >
          <Animated.View style={[
              styles.imageButtonContainer, 
              { transform: [{ scale: scaleValue }] }
          ]}>
              {isButtonLocked && !isDead && (
                <View style={styles.disabledOverlay} />
              )}
              <Image source={require("../assets/DiamondButton.png")} style={styles.buttonImage} />
              <View style={styles.buttonOverlay}>
                <Text style={[styles.buttonText, isButtonLocked && styles.disabledButtonText]}>
                    {isDead ? "NOT ACTUALLY DEAD" : (isButtonLocked ? "I'm glad you're\nalive today" : "I'M OK")}
                </Text>
              </View>
              {isButtonLocked && !isDead && (
                <View style={styles.disabledOverlay} />
              )}
          </Animated.View>
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
    fontFamily: 'JosefinSans_700Bold',
    marginBottom: 50,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'JosefinSans_400Regular',
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
    fontFamily: 'JosefinSans_600SemiBold',
  },
  timerText: {
    fontSize: 28,
    fontFamily: 'JosefinSans_700Bold',
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  subtleText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    fontFamily: 'JosefinSans_600SemiBold',
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
    fontFamily: 'JosefinSans_400Regular',
  },
  imageButtonContainer: {
    width: 322,
    height: 322,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
  },
  buttonOverlay: {
    width: '60%', 
    height: '60%', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'JosefinSans_700Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  disabledButtonText: {
    color: '#EEE',
    fontSize: 20, 
    fontFamily: 'JosefinSans_600SemiBold',
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
      padding: 12,
      backgroundColor: 'rgba(255,255,255,0.8)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FFF',
  },
  addContactButtonText: {
      color: '#333',
      fontSize: 16,
      fontFamily: 'JosefinSans_600SemiBold',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    borderRadius: 147, // Half of 294 (shrunk size)
  }
});