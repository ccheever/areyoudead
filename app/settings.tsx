import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView } from "react-native";
import { useUserId } from "../hooks/useUserId";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// @ts-ignore
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen() {
  const userId = useUserId();
  const user = useQuery(api.users.getUser, userId ? { token: userId } : "skip");
  const updateSettings = useMutation(api.users.updateSettings);
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.checkInHour !== undefined && user.checkInMinute !== undefined) {
        const d = new Date();
        d.setHours(user.checkInHour);
        d.setMinutes(user.checkInMinute);
        setDate(d);
      }
    }
  }, [user]);

  const onChange = async (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);

    if (userId && selectedDate) {
      await updateSettings({
        token: userId,
        checkInHour: currentDate.getHours(),
        checkInMinute: currentDate.getMinutes(),
        debugMode: user?.debugMode ?? "standard"
      });
      if (Platform.OS === 'android') {
        Alert.alert("Updated", "Check-in time updated.");
      }
    }
  };

  const showTimepicker = () => {
    setShowPicker(true);
  };

  if (!user) return <View style={styles.screen}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.screen}>

        {/* TIME PICKER SECTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Daily Check-In Time</Text>
          <Text style={styles.description}>
            Check in at this time each day.
            {'\n'}If you don't check in within 24 hours of your set check-in time, we'll notify your emergency contacts.
          </Text>

          {Platform.OS === 'android' && (
            <TouchableOpacity onPress={showTimepicker} style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          )}

          {(showPicker || Platform.OS === 'ios') && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={onChange}
              style={styles.picker}
              textColor="#333"
            />
          )}
        </View>

        {/* MENU ITEMS */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace("/contacts")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={22} color="#333" />
              <Text style={styles.menuItemText}>Emergency Contacts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace("/debugging")}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="bug-outline" size={22} color="#333" />
              <Text style={styles.menuItemText}>Debugging</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
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
  pickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  picker: {
    width: '100%',
  },
  menuCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 50,
  },
});
