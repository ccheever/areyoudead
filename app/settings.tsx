import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView, TextInput } from "react-native";
import { useUserId } from "../hooks/useUserId";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
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

  const handleCopyUserId = async () => {
      if (userId) {
          await Clipboard.setStringAsync(userId);
        //   Alert.alert("Copied", "User ID copied to clipboard.");
      }
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

        {/* CONTACTS SECTION */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <Text style={styles.description}>
                These people will be notified if you fail to check in.
            </Text>

            <View style={styles.form}>
                <TextInput 
                    style={styles.input} 
                    placeholder="Name" 
                    value={contactName} 
                    onChangeText={setContactName} 
                    placeholderTextColor="#999"
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Email" 
                    value={contactEmail} 
                    onChangeText={setContactEmail} 
                    autoCapitalize="none" 
                    placeholderTextColor="#999"
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Phone" 
                    value={contactPhone} 
                    onChangeText={setContactPhone} 
                    keyboardType="phone-pad" 
                    placeholderTextColor="#999"
                />
                
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
        </TouchableOpacity>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#F8C8DC', // Pastel Pink Background
  },
  screen: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontFamily: 'JosefinSans_700Bold',
    marginBottom: 20,
    marginTop: 0,
    color: '#333',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white card
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
    fontFamily: 'JosefinSans_600SemiBold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
    fontFamily: 'JosefinSans_400Regular',
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
    fontFamily: 'JosefinSans_600SemiBold',
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
      backgroundColor: '#fff',
  },
  toggleBtnActive: {
      backgroundColor: '#333',
      borderColor: '#333',
  },
  toggleText: {
      color: '#333',
      fontSize: 12,
      fontFamily: 'JosefinSans_600SemiBold',
  },
  toggleTextActive: {
      color: 'white',
      fontFamily: 'JosefinSans_700Bold',
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'JosefinSans_600SemiBold',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    fontFamily: 'Courier', // Keep monospaced for ID
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
    fontFamily: 'JosefinSans_400Regular',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 5,
  },
  importButton: {
      backgroundColor: '#333',
      padding: 12,
      borderRadius: 8,
      flex: 1,
      marginRight: 5,
      alignItems: 'center',
  },
  importButtonText: {
      color: 'white',
      fontFamily: 'JosefinSans_600SemiBold',
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
    fontFamily: 'JosefinSans_700Bold',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  contactName: {
    fontFamily: 'JosefinSans_600SemiBold',
    fontSize: 16,
    color: '#333',
  },
  contactDetail: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'JosefinSans_400Regular',
  },
  deleteText: {
    color: '#FF3B30',
    fontFamily: 'JosefinSans_600SemiBold',
  },
});