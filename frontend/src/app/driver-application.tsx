
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {API_URL} from "../constants/api";
import BackButton from "../components/BackButton";

type ApplicationStatus = "draft" | "pending" | "approved" | "rejected";

const statusSteps = [
  { key: "draft", label: "Draft" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
] as const;

function ApplicationProgress({ status }: { status: ApplicationStatus }) {
  const currentIndex = statusSteps.findIndex(
    (step) => step.key === status
  );

  return (
    <View style={styles.progressCard}>
      <Text style={styles.sectionTitle}>Application Progress</Text>

      <View style={styles.progressRow}>
        {statusSteps.map((step, index) => {
          const isActive = index <= currentIndex;

          return (
            <React.Fragment key={step.key}>
              <View style={styles.progressStep}>
                <View
                  style={[
                    styles.progressDot,
                    isActive && styles.activeDot,
                  ]}
                />

                <Text
                  style={[
                    styles.progressLabel,
                    isActive && styles.activeLabel,
                  ]}
                >
                  {step.label}
                </Text>
              </View>

              {index !== statusSteps.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    index < currentIndex && styles.activeLine,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

export default function DriverApplication() {
  const router = useRouter();

  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);

  const [status, setStatus] = useState<ApplicationStatus>("draft");
  const [adminRemarks, setAdminRemarks] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch existing driver application
  const fetchApplication = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/drivers/my-application`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        setStatus("draft");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load application.");
      }

      const application = data.application || data;

      if (application.status) {
        setStatus(application.status);
      }

      setVehicleModel(application.vehicleModel || "");
      setVehicleColor(application.vehicleColor || "");
      setPlateNumber(application.plateNumber || "");
      setLicenseNumber(application.licenseNumber || "");
      setLicensePhoto(application.licencePhoto || null);
      setAdminRemarks(application.adminRemarks || "");
    } catch (error: any) {
      console.log("Fetch application error:", error.message);
    } finally {
      setFetching(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchApplication();
    }, [])
  );

  // Select driving licence photo
  const pickLicensePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) return;

      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 500 } }],
        {
          compress: 0.4,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (manipulated.base64) {
        setLicensePhoto(`data:image/jpeg;base64,${manipulated.base64}`);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to select the photo.");
    }
  };

  // Submit driver application
  const handleSubmit = async () => {
    if (
      !vehicleModel.trim() ||
      !vehicleColor.trim() ||
      !plateNumber.trim() ||
      !licenseNumber.trim() ||
      !licensePhoto
    ) {
      Alert.alert(
        "Missing Information",
        "Please complete all fields and upload your driving licence photo."
      );
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Session Expired", "Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/drivers/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleModel: vehicleModel.trim(),
          vehicleColor: vehicleColor.trim(),
          plateNumber: plateNumber.trim().toUpperCase(),
          licenseNumber: licenseNumber.trim(),
          licencePhoto: licensePhoto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit application.");
      }

      setStatus("pending");
      setAdminRemarks("");

      Alert.alert(
        "Application Submitted",
        "Your driver application has been submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Submission Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Driver Application</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Tracker */}
        {fetching ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#FF781F" />
          </View>
        ) : (
          <ApplicationProgress status={status} />
        )}

        {/* Admin Remarks */}
        {status === "rejected" && adminRemarks ? (
          <View style={styles.remarksBox}>
            <Text style={styles.remarksTitle}>Admin Remarks</Text>
            <Text style={styles.remarksText}>{adminRemarks}</Text>
          </View>
        ) : null}

        {/* Vehicle Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <Text style={styles.sectionDescription}>
            Enter your vehicle details.
          </Text>

          <Text style={styles.label}>Vehicle Model</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Perodua Myvi"
            placeholderTextColor="#999"
            value={vehicleModel}
            onChangeText={setVehicleModel}
          />

          <Text style={styles.label}>Vehicle Color</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. White"
            placeholderTextColor="#999"
            value={vehicleColor}
            onChangeText={setVehicleColor}
          />

          <Text style={styles.label}>Plate Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ABC1234"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            value={plateNumber}
            onChangeText={setPlateNumber}
          />

          <Text style={styles.label}>Driving Licence Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your licence number"
            placeholderTextColor="#999"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
          />
        </View>

        {/* Driving Licence Photo */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Driving Licence</Text>
          <Text style={styles.sectionDescription}>
            Upload a clear photo of your driving licence.
          </Text>

          {licensePhoto ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: licensePhoto }}
                style={styles.previewImage}
                resizeMode="contain"
              />

              <Pressable
                style={styles.removeButton}
                onPress={() => setLicensePhoto(null)}
              >
                <Text style={styles.removeButtonText}>Remove Photo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.uploadBox}
              onPress={pickLicensePhoto}
            >
              <Text style={styles.uploadIcon}>＋</Text>
              <Text style={styles.uploadTitle}>
                Upload Licence Photo
              </Text>
              <Text style={styles.uploadDescription}>
                Tap to select an image
              </Text>
            </Pressable>
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitButton,
            (loading ||
              fetching ||
              status === "pending" ||
              status === "approved") &&
              styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={
            loading ||
            fetching ||
            status === "pending" ||
            status === "approved"
          }
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {status === "pending"
                ? "Application Pending"
                : status === "approved"
                ? "Application Approved"
                : status === "rejected"
                ? "Resubmit Application"
                : "Submit Application"}
            </Text>
          )}
        </Pressable>

        <Text style={styles.footerText}>
          Your application will be reviewed by the administrator.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F2",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

 header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 22,
    marginTop: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F28A24",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  sectionDescription: {
    fontSize: 13,
    color: "#888",
    marginBottom: 18,
  },

  loadingCard: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 16,
    marginBottom: 18,
  },

  // Progress Tracker
  progressCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 18,
    elevation: 2,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  progressStep: {
    alignItems: "center",
    gap: 8,
  },

  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#D1D5DB",
  },

  activeDot: {
    backgroundColor: "#FF781F",
  },

  progressLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  activeLabel: {
    color: "#FF781F",
    fontWeight: "bold",
  },

  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 3,
    marginBottom: 22,
  },

  activeLine: {
    backgroundColor: "#FF781F",
  },

  // Admin Remarks
  remarksBox: {
    backgroundColor: "#FFF1F0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
  },

  remarksTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B91C1C",
    marginBottom: 5,
  },

  remarksText: {
    fontSize: 13,
    color: "#555",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#333",
  },

  // Licence Upload
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#FF781F",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    backgroundColor: "#FFFAF6",
  },

  uploadIcon: {
    fontSize: 30,
    color: "#FF781F",
    marginBottom: 8,
  },

  uploadTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF781F",
  },

  uploadDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },

  imageContainer: {
    alignItems: "center",
  },

  previewImage: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },

  removeButton: {
    marginTop: 12,
    padding: 10,
  },

  removeButtonText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },

  // Submit
  submitButton: {
    backgroundColor: "#FF781F",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },

  disabledButton: {
    backgroundColor: "#BDBDBD",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  footerText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 15,
  },
});
