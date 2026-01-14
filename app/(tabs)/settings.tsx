import { View, Text, StyleSheet } from "react-native";
import { useUserId } from "../../hooks/useUserId";

export default function SettingsScreen() {
  const userId = useUserId();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Device ID (Debug):</Text>
        <Text style={styles.value}>{userId || "Loading..."}</Text>
      </View>
      <Text style={styles.infoText}>
        Are You Dead? checks if you are active every 48 hours.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  infoContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});
