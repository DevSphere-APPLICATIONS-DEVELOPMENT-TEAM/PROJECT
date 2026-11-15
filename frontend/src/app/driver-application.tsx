import React, { useState } from "react";
import { View, Text, Pressable, Image, Alert, StyleSheet, TextInput, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://campusride-api-uny3.onrender.com";

export default function DriverApplication() {
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
  const [stickerPhoto, setStickerPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<"Not submitted" | "Pending">("Not submitted");
  const [loading, setLoading] = useState(false);

  const pickImage = async (setPhoto: (uri: string) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (result.canceled) return;

    const small = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 500 } }],
      { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (small.base64) {
      setPhoto(`data:image/jpeg;base64,${small.base64}`);
    }
  };

  const handleSubmit = async () => {
    if (!vehicleModel || !vehicleColor || !plateNumber || !licenseNumber || !licensePhoto || !stickerPhoto) {
      Alert.alert("Missing info", "Please fill in all fields and upload both photos.");
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/drivers/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleModel,
          vehicleColor,
          plateNumber,
          licenseNumber,
          licencePhoto: licensePhoto,
          stickerPhoto,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Could not submit the application.");
        return;
      }
      setStatus("Pending");
    } catch (error) {
      Alert.alert("Error", "Cannot reach the server. Check your internet and the API link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Driver Application</Text>

      <Text style={styles.label}>Vehicle model</Text>
      <TextInput style={styles.input} value={vehicleModel} onChangeText={setVehicleModel} />

      <Text style={styles.label}>Vehicle colour</Text>
      <TextInput style={styles.input} value={vehicleColor} onChangeText={setVehicleColor} />

      <Text style={styles.label}>Plate number</Text>
      <TextInput style={styles.input} value={plateNumber} onChangeText={setPlateNumber} autoCapitalize="characters" />

      <Text style={styles.label}>Driving licence number</Text>
      <TextInput style={styles.input} value={licenseNumber} onChangeText={setLicenseNumber} />

      <Text style={styles.label}>Driving Licence</Text>
      <Pressable style={styles.button} onPress={() => pickImage(setLicensePhoto)}>
        <Text style={styles.buttonText}>Upload licence photo</Text>
      </Pressable>
      {licensePhoto && <Image source={{ uri: licensePhoto }} style={styles.preview} />}

      <Text style={styles.label}>UTM Car Sticker</Text>
      <Pressable style={styles.button} onPress={() => pickImage(setStickerPhoto)}>
        <Text style={styles.buttonText}>Upload sticker photo</Text>
      </Pressable>
      {stickerPhoto && <Image source={{ uri: stickerPhoto }} style={styles.preview} />}

      <Pressable style={styles.submit} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Submitting..." : "Submit"}</Text>
      </Pressable>

      <Text style={styles.status}>Status: {status}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#FFE8D6" },
  title: { fontSize: 24, fontWeight: "bold", color: "#FF7A1A", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: "white", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#FF7A1A" },
  button: { backgroundColor: "#FF7A1A", padding: 12, borderRadius: 8, alignItems: "center" },
  submit: { backgroundColor: "#FF7A1A", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 24 },
  buttonText: { color: "white", fontWeight: "bold" },
  preview: { width: 120, height: 80, marginTop: 8, borderRadius: 6 },
  status: { marginTop: 16, fontSize: 16, fontWeight: "600" },
});