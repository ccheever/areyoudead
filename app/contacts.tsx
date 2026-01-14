import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Button, ActionSheetIOS, Linking } from "react-native";
import { useUserId } from "../hooks/useUserId";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import * as Contacts from 'expo-contacts';
import { Id } from "../convex/_generated/dataModel";

export default function ContactsScreen() {
  const userId = useUserId();

  // Contacts Hooks
  const userContacts = useQuery(api.contacts.getContacts, userId ? { userToken: userId } : "skip");
  const addContact = useMutation(api.contacts.addContact);
  const removeContact = useMutation(api.contacts.removeContact);

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

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

  const handleContactPress = (contact: { _id: Id<"contacts">; name: string; email?: string; phone?: string }) => {
    const options = [];
    const actions: (() => void)[] = [];

    if (contact.phone) {
      options.push('Call');
      actions.push(() => Linking.openURL(`tel:${contact.phone}`));

      options.push('Message');
      actions.push(() => Linking.openURL(`sms:${contact.phone}`));
    }

    if (contact.email) {
      options.push('Email');
      actions.push(() => Linking.openURL(`mailto:${contact.email}`));
    }

    options.push('Delete');
    const deleteIndex = options.length - 1;
    actions.push(() => removeContact({ contactId: contact._id }));

    options.push('Cancel');
    const cancelIndex = options.length - 1;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: cancelIndex,
        destructiveButtonIndex: deleteIndex,
        title: contact.name,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelIndex && actions[buttonIndex]) {
          actions[buttonIndex]();
        }
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
        <View style={styles.screen}>

        <View style={styles.card}>
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
                    <Button title="Import from Contacts" onPress={handleImportContact} />
                    <Button title="Add" onPress={handleAddContact} />
                </View>
            </View>

            {userContacts?.map((item) => (
                <TouchableOpacity
                    key={item._id}
                    onPress={() => handleContactPress(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.contactItem}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        {item.email ? <Text style={styles.contactDetail}>{item.email}</Text> : null}
                        {item.phone ? <Text style={styles.contactDetail}>{item.phone}</Text> : null}
                    </View>
                </TouchableOpacity>
            ))}

            {userContacts?.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No contacts added yet</Text>
                </View>
            )}

            {userContacts && userContacts.length > 0 && (
                <Text style={styles.hint}>Tap a contact for options</Text>
            )}
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
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  contactItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  contactName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  contactDetail: {
    color: '#666',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 14,
  },
  hint: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
