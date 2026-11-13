import React, { useState } from "react";
import { View, Text, Pressable, Image, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function DriverApplication() {
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);
  const [stickerPhoto, setStickerPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<"Not submitted" | "Pending">("Not submitted");

  const pickImage = async (setPhoto: (uri: string) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!licensePhoto || !stickerPhoto) {
      Alert.alert("Missing photos", "Please upload both photos.");
      return;
    }
    setStatus("Pending");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Application</Text>

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

      <Pressable style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>

      <Text style={styles.status}>Status: {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#FFE8D6" },
  title: { fontSize: 24, fontWeight: "bold", color: "#FF7A1A", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  button: { backgroundColor: "#FF7A1A", padding: 12, borderRadius: 8, alignItems: "center" },
  submit: { backgroundColor: "#FF7A1A", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 24 },
  buttonText: { color: "white", fontWeight: "bold" },
  preview: { width: 120, height: 80, marginTop: 8, borderRadius: 6 },
  status: { marginTop: 16, fontSize: 16, fontWeight: "600" },
});