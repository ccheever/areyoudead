import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { useUserId } from "../../hooks/useUserId";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
// @ts-ignore
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen() {
  const userId = useUserId();
  const user = useQuery(api.users.getUser, userId ? { token: userId } : "skip");
  const updateSettings = useMutation(api.users.updateSettings);

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (user && user.checkInHour !== undefined && user.checkInMinute !== undefined) {
      const d = new Date();
      d.setHours(user.checkInHour);
      d.setMinutes(user.checkInMinute);
      setDate(d);
    }
  }, [user]);

  const onChange = async (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);

    if (userId && selectedDate) {
        // Save to backend
        await updateSettings({
            token: userId,
            checkInHour: currentDate.getHours(),
            checkInMinute: currentDate.getMinutes(),
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
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Check-In Time</Text>
        <Text style={styles.description}>
          You must check in by this time every day. 
          {'\n'}If you miss it, you have a 24-hour grace period.
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
            />
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Device ID (Debug):</Text>
        <Text style={styles.value}>{userId || "Loading..."}</Text>
      </View>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
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
  },
  picker: {
    width: '100%',
  },
  infoContainer: {
    marginTop: 'auto',
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
});
