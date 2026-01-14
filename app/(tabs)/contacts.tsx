import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUserId } from "../../hooks/useUserId";
import { useState } from "react";

export default function ContactsScreen() {
  const userId = useUserId();
  const contacts = useQuery(api.contacts.getContacts, userId ? { userToken: userId } : "skip");
  const addContact = useMutation(api.contacts.addContact);
  const removeContact = useMutation(api.contacts.removeContact);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = async () => {
    if (!userId) return;
    if (!name) return Alert.alert("Name is required");
    if (!email && !phone) return Alert.alert("Provide at least Email or Phone");

    await addContact({ userToken: userId, name, email, phone });
    setName("");
    setEmail("");
    setPhone("");
  };

  if (!userId) return <View style={styles.screen}><Text>Loading...</Text></View>;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Emergency Contacts</Text>
      
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <View>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactDetail}>{item.email}</Text>
                <Text style={styles.contactDetail}>{item.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => removeContact({ contactId: item._id })}>
                <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  contactName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactDetail: {
    color: '#666',
  },
  deleteText: {
    color: '#FF3B30',
  },
});
