import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from "react-native";
import { API_URL } from "../constants/api";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Hardcoded ID for testing until your team's login system is connected
  const TEST_USER_ID = "65abcdef1234567890123456"; 

  // Load existing profile data when the screen opens
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${TEST_USER_ID}`);
        if (response.ok) {
          const data = await response.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setRole(data.role || "student");
        }
      } catch (error) {
        console.log("Offline mode: Cannot fetch existing profile data.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Validation Error", "Name and email cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${TEST_USER_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      Alert.alert("Success", "Your profile has been updated!");
    } catch (error) {
      Alert.alert("Error", "Could not connect to the server. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <View style={[styles.container, { alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#FF781F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Profile</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter your student email"
      />

      <Text style={styles.label}>Account Role</Text>
      <TextInput
        style={[styles.input, styles.disabledInput]}
        value={role.toUpperCase()}
        editable={false}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleUpdate} 
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFE7D6",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF781F",
    marginBottom: 32,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#eaeaea",
    color: "#888",
  },
  button: {
    backgroundColor: "#FF781F",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});