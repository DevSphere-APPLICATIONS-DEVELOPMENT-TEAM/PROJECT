
import React, { useEffect, useRef, useState } from "react";
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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://campusride-api-uny3.onrender.com";

type ApplicationStatus =
  | "none"
  | "draft"
  | "pending"
  | "approved"
  | "rejected";

type FormData = {
  vehicleModel: string;
  vehicleColor: string;
  plateNumber: string;
  licenseNumber: string;
  licencePhoto: string | null;
  stickerPhoto: string | null;
};

const emptyForm: FormData = {
  vehicleModel: "",
  vehicleColor: "",
  plateNumber: "",
  licenseNumber: "",
  licencePhoto: null,
  stickerPhoto: null,
};

export default function DriverApplication() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>(emptyForm);
  const [status, setStatus] = useState<ApplicationStatus>("none");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const originalForm = useRef<FormData>(emptyForm);

  const isLocked = status === "pending" || status === "approved";

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(originalForm.current);

  const updateField = (field: keyof FormData, value: string | null) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Load existing application or saved draft
  const fetchApplication = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Session expired", "Please log in again.");
        router.back();
        return;
      }

      const response = await fetch(
        `${API_URL}/api/drivers/my-application`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load application.");
      }

      if (data.application) {
        const application = data.application;

        const savedForm: FormData = {
          vehicleModel: application.vehicleModel || "",
          vehicleColor: application.vehicleColor || "",
          plateNumber: application.plateNumber || "",
          licenseNumber: application.licenseNumber || "",
          licencePhoto: application.licencePhoto || null,
          stickerPhoto: application.stickerPhoto || null,
        };

        setForm(savedForm);
        originalForm.current = savedForm;
        setStatus(application.status);
        setAdminRemarks(application.adminRemarks || "");
      } else {
        setForm(emptyForm);
        originalForm.current = emptyForm;
        setStatus("none");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Unable to load your application."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  // Select and compress photo
  const pickImage = async (
    field: "licencePhoto" | "stickerPhoto"
  ) => {
    if (isLocked || saving) return;

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photos."
        );
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
        {
          compress: 0.4,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (small.base64) {
        updateField(field, `data:image/jpeg;base64,${small.base64}`);
      }
    } catch {
      Alert.alert("Error", "Unable to select this photo.");
    }
  };

  // Prepare application data
  const getApplicationData = () => ({
    vehicleModel: form.vehicleModel.trim(),
    vehicleColor: form.vehicleColor.trim(),
    plateNumber: form.plateNumber.trim().toUpperCase(),
    licenseNumber: form.licenseNumber.trim(),
    licencePhoto: form.licencePhoto,
    stickerPhoto: form.stickerPhoto,
  });

  // Save draft
  const handleSave = async () => {
    try {
      setSaving(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/drivers/save-draft`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(getApplicationData()),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save draft.");
      }

      const savedForm = { ...form };

      setForm(savedForm);
      originalForm.current = savedForm;
      setStatus("draft");

      Alert.alert("Saved", "Your application draft has been saved.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to save draft."
      );
    } finally {
      setSaving(false);
    }
  };

  // Submit application
  const handleSubmit = async () => {
    if (
      !form.vehicleModel.trim() ||
      !form.vehicleColor.trim() ||
      !form.plateNumber.trim() ||
      !form.licenseNumber.trim() ||
      !form.licencePhoto ||
      !form.stickerPhoto
    ) {
      Alert.alert(
        "Incomplete application",
        "Please complete all vehicle information and upload both required photos."
      );
      return;
    }

    Alert.alert(
      "Submit application?",
      "Please make sure all information is correct. You cannot edit your application while it is under review.",
      [
        { text: "Review", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            try {
              setSaving(true);

              const token = await AsyncStorage.getItem("token");

              const response = await fetch(
                `${API_URL}/api/drivers/apply`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(getApplicationData()),
                }
              );

              const data = await response.json();

              if (!response.ok) {
                throw new Error(
                  data.message || "Unable to submit application."
                );
              }

              setStatus("pending");
              setAdminRemarks("");
              originalForm.current = { ...form };

              Alert.alert(
                "Application submitted",
                "Your driver application has been submitted for admin review."
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to submit application."
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  // Cancel and return to Profile
  const handleCancel = () => {
    const leavePage = () => router.back();

    if (isDirty) {
      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: leavePage,
          },
        ]
      );
    } else {
      leavePage();
    }
  };

  const renderPhotoUpload = (
    title: string,
    field: "licencePhoto" | "stickerPhoto",
    photo: string | null
  ) => (
    <View style={styles.photoCard}>
      <View style={styles.photoHeader}>
        <View style={styles.photoIcon}>
          <Text style={styles.photoIconText}>+</Text>
        </View>

        <View style={styles.photoInfo}>
          <Text style={styles.photoTitle}>{title}</Text>
          <Text style={styles.photoSubtitle}>
            {photo ? "Photo uploaded" : "Upload a clear photo"}
          </Text>
        </View>

        {photo && <Text style={styles.uploaded}>✓</Text>}
      </View>

      {photo && (
        <Image source={{ uri: photo }} style={styles.preview} />
      )}

      {!isLocked && (
        <Pressable
          style={styles.uploadButton}
          onPress={() => pickImage(field)}
          disabled={saving}
        >
          <Text style={styles.uploadButtonText}>
            {photo ? "Change Photo" : "Choose Photo"}
          </Text>
        </Pressable>
      )}
    </View>
  );

  const renderStatus = () => {
    if (status === "none" || status === "draft") return null;

    const approved = status === "approved";
    const rejected = status === "rejected";

    return (
      <View
        style={[
          styles.statusCard,
          approved && styles.approvedCard,
          rejected && styles.rejectedCard,
        ]}
      >
        <Text style={styles.statusHeading}>
          {approved
            ? "Application Approved"
            : rejected
            ? "Application Rejected"
            : "Application Under Review"}
        </Text>

        <Text style={styles.statusDescription}>
          {approved
            ? "Congratulations! You are now approved as a CampusRide driver."
            : rejected
            ? "Your application needs some corrections before it can be approved."
            : "Your application has been submitted. Please wait for the admin to review it."}
        </Text>

        {rejected && adminRemarks ? (
          <View style={styles.remarksBox}>
            <Text style={styles.remarksTitle}>Admin Remarks</Text>
            <Text style={styles.remarksText}>{adminRemarks}</Text>
          </View>
        ) : null}

        <View style={styles.progressRow}>
          <View style={styles.progressStep}>
            <View style={styles.completedDot}>
              <Text style={styles.dotText}>✓</Text>
            </View>
            <Text style={styles.progressLabel}>Submitted</Text>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                (status === "pending" ||
                  status === "approved" ||
                  status === "rejected") &&
                  styles.completedDot,
              ]}
            >
              <Text style={styles.dotText}>
                {status === "pending" ? "2" : "✓"}
              </Text>
            </View>
            <Text style={styles.progressLabel}>Review</Text>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                (approved || rejected) && styles.completedDot,
              ]}
            >
              <Text style={styles.dotText}>
                {approved ? "✓" : rejected ? "!" : "3"}
              </Text>
            </View>
            <Text style={styles.progressLabel}>
              {rejected ? "Rejected" : "Decision"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F5B800" />
        <Text style={styles.loadingText}>Loading application...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Driver Application</Text>
            <Text style={styles.headerSubtitle}>
              Become a CampusRide driver
            </Text>
          </View>
        </View>

        {/* Status */}
        {renderStatus()}

        {status === "draft" && (
          <View style={styles.draftNotice}>
            <Text style={styles.draftNoticeText}>
              Your draft has been saved. You can continue where you left off.
            </Text>
          </View>
        )}

        {status === "rejected" && (
          <View style={styles.draftNotice}>
            <Text style={styles.draftNoticeText}>
              Update the information below and submit your application again.
            </Text>
          </View>
        )}

        {/* Vehicle Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionNumber}>01</Text>
            <View>
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              <Text style={styles.sectionSubtitle}>
                Tell us about your vehicle
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Vehicle Model</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Perodua Myvi"
              placeholderTextColor="#A3A3A3"
              value={form.vehicleModel}
              onChangeText={(value) =>
                updateField("vehicleModel", value)
              }
              editable={!isLocked && !saving}
            />

            <Text style={styles.label}>Vehicle Colour</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. White"
              placeholderTextColor="#A3A3A3"
              value={form.vehicleColor}
              onChangeText={(value) =>
                updateField("vehicleColor", value)
              }
              editable={!isLocked && !saving}
            />

            <Text style={styles.label}>Plate Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. JXX 1234"
              placeholderTextColor="#A3A3A3"
              value={form.plateNumber}
              onChangeText={(value) =>
                updateField("plateNumber", value.toUpperCase())
              }
              autoCapitalize="characters"
              editable={!isLocked && !saving}
            />

            <Text style={styles.label}>Driving Licence Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your licence number"
              placeholderTextColor="#A3A3A3"
              value={form.licenseNumber}
              onChangeText={(value) =>
                updateField("licenseNumber", value)
              }
              editable={!isLocked && !saving}
            />
          </View>
        </View>

        {/* Required Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionNumber}>02</Text>
            <View>
              <Text style={styles.sectionTitle}>Required Documents</Text>
              <Text style={styles.sectionSubtitle}>
                Upload the following photos
              </Text>
            </View>
          </View>

          {renderPhotoUpload(
            "Driving Licence",
            "licencePhoto",
            form.licencePhoto
          )}

          {renderPhotoUpload(
            "UTM Car Sticker",
            "stickerPhoto",
            form.stickerPhoto
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isLocked ? (
            <Pressable
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Back to Profile</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.actionRow}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? "Saving..." : "Save"}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={[
                  styles.submitButton,
                  saving && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={saving}
              >
                <Text style={styles.submitButtonText}>
                  {saving ? "Please wait..." : "Submit Application"}
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <Text style={styles.footerText}>
          Your information will only be used for driver verification.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F7F4",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F4",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  backText: {
    fontSize: 32,
    color: "#222",
    lineHeight: 36,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#222222",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#858585",
    marginTop: 3,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: "#B88600",
    backgroundColor: "#FFF0B8",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#252525",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#888888",
    marginTop: 3,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
    marginTop: 13,
  },
  input: {
    backgroundColor: "#F8F8F6",
    borderWidth: 1,
    borderColor: "#EAEAE5",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    color: "#222222",
  },
  photoCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 17,
    marginBottom: 13,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  photoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFF2C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  photoIconText: {
    fontSize: 25,
    color: "#A77B00",
    fontWeight: "600",
  },
  photoInfo: {
    flex: 1,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#292929",
  },
  photoSubtitle: {
    fontSize: 12,
    color: "#929292",
    marginTop: 4,
  },
  uploaded: {
    color: "#27945A",
    fontSize: 20,
    fontWeight: "800",
  },
  preview: {
    width: "100%",
    height: 165,
    borderRadius: 12,
    marginTop: 15,
    resizeMode: "cover",
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#E5B600",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 14,
  },
  uploadButtonText: {
    color: "#997300",
    fontSize: 13,
    fontWeight: "800",
  },
  actions: {
    marginTop: 5,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#444444",
    fontSize: 14,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#FFF0B8",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#8B6800",
    fontSize: 14,
    fontWeight: "800",
  },
  submitButton: {
    backgroundColor: "#F5B800",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonText: {
    color: "#242424",
    fontSize: 15,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.6,
  },
  statusCard: {
    backgroundColor: "#FFF4D0",
    borderRadius: 16,
    padding: 17,
    marginBottom: 22,
  },
  approvedCard: {
    backgroundColor: "#E7F6EC",
  },
  rejectedCard: {
    backgroundColor: "#FCEAEA",
  },
  statusHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: "#292929",
  },
  statusDescription: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 20,
    marginTop: 7,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  progressStep: {
    alignItems: "center",
  },
  progressDot: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
  },
  completedDot: {
    backgroundColor: "#E5B000",
    width: 27,
    height: 27,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  dotText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#D8D8D8",
    marginHorizontal: 5,
    marginBottom: 17,
  },
  progressLabel: {
    fontSize: 10,
    color: "#666666",
    marginTop: 6,
  },
  remarksBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginTop: 13,
  },
  remarksTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#A33333",
    marginBottom: 5,
  },
  remarksText: {
    fontSize: 13,
    color: "#555555",
    lineHeight: 19,
  },
  draftNotice: {
    backgroundColor: "#FFF4D0",
    borderRadius: 11,
    padding: 13,
    marginBottom: 18,
  },
  draftNoticeText: {
    fontSize: 12,
    color: "#806000",
    lineHeight: 18,
  },
  footerText: {
    fontSize: 11,
    color: "#999999",
    textAlign: "center",
    marginTop: 20,
  },
});
