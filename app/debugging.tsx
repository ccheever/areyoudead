import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useUserId } from "../hooks/useUserId";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import * as Clipboard from 'expo-clipboard';

export default function DebuggingScreen() {
  const userId = useUserId();
  const user = useQuery(api.users.getUser, userId ? { token: userId } : "skip");
  const updateSettings = useMutation(api.users.updateSettings);

  const [debugMode, setDebugMode] = useState("standard");

  useEffect(() => {
    if (user?.debugMode) {
      setDebugMode(user.debugMode);
    }
  }, [user]);

  const handleDebugToggle = async (mode: string) => {
    setDebugMode(mode);
    if (userId && user) {
      await updateSettings({
        token: userId,
        checkInHour: user.checkInHour ?? 8,
        checkInMinute: user.checkInMinute ?? 30,
        debugMode: mode
      });
    }
  };

  const handleCopyUserId = async () => {
    if (userId) {
      await Clipboard.setStringAsync(userId);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.screen}>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Debug Mode</Text>
          <Text style={styles.description}>Test the deadline logic with shorter intervals.</Text>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, debugMode === 'standard' && styles.toggleBtnActive]}
              onPress={() => handleDebugToggle('standard')}
            >
              <Text style={[styles.toggleText, debugMode === 'standard' && styles.toggleTextActive]}>Standard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, debugMode === '1min' && styles.toggleBtnActive]}
              onPress={() => handleDebugToggle('1min')}
            >
              <Text style={[styles.toggleText, debugMode === '1min' && styles.toggleTextActive]}>Fast (1m)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, debugMode === '10sec' && styles.toggleBtnActive]}
              onPress={() => handleDebugToggle('10sec')}
            >
              <Text style={[styles.toggleText, debugMode === '10sec' && styles.toggleTextActive]}>Hyper (10s)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.infoContainer} onPress={handleCopyUserId}>
          <Text style={styles.label}>Device ID</Text>
          <Text style={styles.value}>{userId || "Loading..."}</Text>
          <Text style={styles.hint}>Tap to copy</Text>
        </TouchableOpacity>

        {/* APP ICON PREVIEW */}
        <View style={styles.iconPreview}>
          <View style={styles.iconButton}>
            <Text style={styles.iconButtonText}>ARE{'\n'}YOU{'\n'}DEAD</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  screen: {
    padding: 20,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
    fontWeight: '400',
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  toggleBtn: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#fff',
  },
  toggleBtnActive: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  toggleText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  iconPreview: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  iconButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
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
  iconButtonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 36,
  },
});
