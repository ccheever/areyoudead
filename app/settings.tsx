import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView, TextInput, FlatList } from "react-native";
import { useUserId } from "../hooks/useUserId";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import * as Contacts from 'expo-contacts';
// @ts-ignore
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SettingsScreen() {
  const userId = useUserId();
  const user = useQuery(api.users.getUser, userId ? { token: userId } : "skip");
  const updateSettings = useMutation(api.users.updateSettings);
  
  // Contacts Hooks
  const userContacts = useQuery(api.contacts.getContacts, userId ? { userToken: userId } : "skip");
  const addContact = useMutation(api.contacts.addContact);
  const removeContact = useMutation(api.contacts.removeContact);

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [debugMode, setDebugMode] = useState("standard");

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    if (user) {
      if (user.checkInHour !== undefined && user.checkInMinute !== undefined) {
        const d = new Date();
        d.setHours(user.checkInHour);
        d.setMinutes(user.checkInMinute);
        setDate(d);
      }
      if (user.debugMode) {
          setDebugMode(user.debugMode);
      }
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
            debugMode
        });
        if (Platform.OS === 'android') {
            Alert.alert("Updated", "Check-in time updated.");
        }
    }
  };

  const handleDebugToggle = async (mode: string) => {
      setDebugMode(mode);
      if (userId) {
          await updateSettings({
            token: userId,
            checkInHour: date.getHours(),
            checkInMinute: date.getMinutes(),
            debugMode: mode
          });
      }
  };

  const showTimepicker = () => {
    setShowPicker(true);
  };

  // Contact Logic
  const handleAddContact = async () => {
    if (!userId) return;
    if (!contactName) return Alert.alert("Name is required");
    if (!contactEmail && !contactPhone) return Alert.alert("Provide at least Email or Phone");

    await addContact({ userToken: userId, name: contactName, email: contactEmail, phone: contactPhone });
    setContactName("");
    setContactEmail("");
    setContactPhone("");
  };

  const handleImportContact = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
          try {
            const contact = await Contacts.presentContactPickerAsync();
            if (contact) {
                // Try to get the name, or fallback to composite name
                const name = contact.name || [contact.firstName, contact.middleName, contact.lastName].filter(Boolean).join(" ");
                setContactName(name || "");
                if (contact.emails && contact.emails.length > 0) {
                    setContactEmail(contact.emails[0].email || "");
                }
                if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                    setContactPhone(contact.phoneNumbers[0].number || "");
                }
            }
          } catch (e) {
              Alert.alert("Error", "Could not open contact picker");
          }
      } else {
          Alert.alert("Permission denied", "We need contacts permission to import.");
      }
  };

  if (!user) return <View style={styles.screen}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
        <View style={styles.screen}>
        
        {/* TIME PICKER SECTION */}
        <View style={styles.section}>
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
                />
            )}
        </View>

        {/* CONTACTS SECTION */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <Text style={styles.description}>
                These people will be notified if you fail to check in.
            </Text>

            <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Name" value={contactName} onChangeText={setContactName} />
                <TextInput style={styles.input} placeholder="Email" value={contactEmail} onChangeText={setContactEmail} autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Phone" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
                
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.importButton} onPress={handleImportContact}>
                        <Text style={styles.importButtonText}>Import from Contacts</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {userContacts?.map((item) => (
                <View key={item._id} style={styles.contactItem}>
                    <View style={{flex: 1}}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        {item.email ? <Text style={styles.contactDetail}>{item.email}</Text> : null}
                        {item.phone ? <Text style={styles.contactDetail}>{item.phone}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => removeContact({ contactId: item._id })}>
                        <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>

        {/* DEBUG MODE SECTION */}
        <View style={styles.section}>
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

        <View style={styles.infoContainer}>
            <Text style={styles.label}>Device ID (Debug):</Text>
            <Text style={styles.value}>{userId || "Loading..."}</Text>
        </View>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
  },
  screen: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 0,
  },
  section: {
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
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
  },
  toggleBtnActive: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
  },
  toggleText: {
      color: '#333',
      fontSize: 12,
  },
  toggleTextActive: {
      color: 'white',
      fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 20,
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
  form: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 5,
  },
  importButton: {
      backgroundColor: '#007AFF',
      padding: 12,
      borderRadius: 8,
      flex: 1,
      marginRight: 5,
      alignItems: 'center',
  },
  importButtonText: {
      color: 'white',
      fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactDetail: {
    color: '#666',
    fontSize: 14,
  },
  deleteText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});