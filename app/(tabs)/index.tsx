import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUserId } from "../../hooks/useUserId";
import { useEffect } from "react";
import { Link } from "expo-router";

const DEAD_THRESHOLD = 48 * 60 * 60 * 1000;

export default function HomeScreen() {
  const userId = useUserId();
  const user = useQuery(api.users.getUser, userId ? { token: userId } : "skip");
  const checkIn = useMutation(api.users.checkIn);
  const getOrCreate = useMutation(api.users.getOrCreateUser);

  // Ensure user exists on server
  useEffect(() => {
    if (userId) {
      getOrCreate({ token: userId });
    }
  }, [userId]);

  const handleCheckIn = async () => {
    if (userId) {
      await checkIn({ token: userId });
    }
  };

  if (!userId || user === undefined) {
    return (
      <View style={styles.screen}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // Calculate time remaining
  const lastCheckIn = user?.lastCheckIn || Date.now();
  const timeSince = Date.now() - lastCheckIn;
  const timeRemaining = Math.max(0, DEAD_THRESHOLD - timeSince);
  
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
