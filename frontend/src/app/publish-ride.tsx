import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

export default function PublishRideScreen() {
  const router = useRouter();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!origin.trim() || !destination.trim() || !date.trim() || !seats.trim() || !price.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // NOTE: For Android emulators, you might need to use http://10.0.2.2:5000 instead of localhost
      const response = await fetch("http://localhost:5000/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driver: "65f1a2b3c4d5e6f7a8b9c0d1", // Temporary placeholder User ID until login context is ready
          origin: origin.trim(),
          destination: destination.trim(),
          date: date.trim(),
          seats: parseInt(seats, 10),
          price: parseFloat(price),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Your ride has been published to the campus board!");
        router.back(); // Send the user back to the previous screen
      } else {
        Alert.alert("Error", data.message || "Failed to publish ride.");
      }
    } catch (error) {
      console.error("Publish Error:", error);
      Alert.alert("Error", "Could not connect to the server. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text style={styles.title}>Publish a Ride</Text>
          <Text style={styles.subtitle}>Offer a ride to your peers</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Origin</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., KTHO, Meranti..."
            placeholderTextColor="#B8A99F"
            value={origin}
            onChangeText={setOrigin}
          />

          <Text style={styles.label}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Fakulti Komputeran"
            placeholderTextColor="#B8A99F"
            value={destination}
            onChangeText={setDestination}
          />

          <Text style={styles.label}>Date & Departure Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 12 Nov, 8:00 AM"
            placeholderTextColor="#B8A99F"
            value={date}
            onChangeText={setDate}
          />

          <View style={styles.row}>
            <View style={[styles.inputGroup, { marginRight: 10 }]}>
              <Text style={styles.label}>Seats Available</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3"
                placeholderTextColor="#B8A99F"
                keyboardType="number-pad"
                value={seats}
                onChangeText={setSeats}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (RM)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2.00"
                placeholderTextColor="#B8A99F"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]} 
            onPress={handlePublish}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Publishing..." : "Publish Ride"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE7D6",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 29,
    paddingTop: 80,
    paddingBottom: 42,
  },
  heading: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#FF781F",
    fontSize: 28,
    fontWeight: "600",
  },
  subtitle: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#29211D",
    fontSize: 11,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    height: 43,
    borderRadius: 9,
    paddingHorizontal: 12,
    backgroundColor: "#FFF4EC",
    color: "#24201D",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    flex: 1,
  },
  primaryButton: {
    height: 43,
    borderRadius: 8,
    backgroundColor: "#FF781F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cancelButton: {
    height: 43,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#51443D",
    fontSize: 13,
    fontWeight: "600",
  },
});