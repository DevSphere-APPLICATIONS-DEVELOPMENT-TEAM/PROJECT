
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import BackButton from "../components/BackButton";
import { API_URL } from "../constants/api";

export default function ManageProfile() {
  const router = useRouter();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [gender, setGender] = useState("");
  const [isDriver, setIsDriver] = useState(false);
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    gender: "",
    vehicleModel: "",
    vehicleColor: "",
    plateNumber: "",
    licenseNumber: "",
  });

  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        const savedImage = await AsyncStorage.getItem("profileImage");
        const token = await AsyncStorage.getItem("token");

        if (savedUser) {
          const user = JSON.parse(savedUser);

          setName(user.name || "");
          setPhone(user.phone || "");
          setMatricNumber(user.matricNumber || "");
          setGender(user.gender || "");
          setProfileImage(user.profilePicture || savedImage || null);
        }

        if (token) {
          const response = await fetch(
            `${API_URL}/drivers/my-application`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (response.ok && data.application) {
            const application = data.application;

            setVehicleModel(application.vehicleModel || "");
            setVehicleColor(application.vehicleColor || "");
            setPlateNumber(application.plateNumber || "");
            setLicenseNumber(application.licenseNumber || "");
            setApplicationStatus(application.status);
            setIsDriver(true);
          }
        }
      } catch (error) {
        console.error("Load profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChangePhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      setProfileImage(asset.uri);
      setPhotoChanged(true);

      setProfileImageBase64(
        asset.base64
          ? `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`
          : null
      );
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    setProfileImageBase64(null);
    setPhotoChanged(true);
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      phone: "",
      gender: "",
      vehicleModel: "",
      vehicleColor: "",
      plateNumber: "",
      licenseNumber: "",
    };

    if (!name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    }

    // Only validate vehicle details when applying as a driver
    if (
      isDriver &&
      applicationStatus !== "pending" &&
      applicationStatus !== "approved"
    ) {
      if (!vehicleModel.trim()) {
        newErrors.vehicleModel = "Please enter your vehicle model.";
      }

      if (!vehicleColor.trim()) {
        newErrors.vehicleColor = "Please enter your vehicle colour.";
      }

      if (!plateNumber.trim()) {
        newErrors.plateNumber = "Please enter your plate number.";
      }

      if (!licenseNumber.trim()) {
        newErrors.licenseNumber = "Please enter your driving licence number.";
      }
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const savedUser = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!savedUser || !token) {
        Alert.alert("Error", "Please log in again.");
        return;
      }

      const currentUser = JSON.parse(savedUser);

      // 1. Update personal profile
      const profileBody: any = {
        name: name.trim(),
        phone: phone.trim(),
        gender: gender.trim(),
      };

      if (photoChanged) {
        profileBody.profilePicture = profileImageBase64;
      }

      const profileResponse = await fetch(
        `${API_URL}/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileBody),
        }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(profileData.message || "Profile update failed.");
      }

      let newApplicationStatus = applicationStatus;

      // 2. Submit driver application only when needed
      if (
        isDriver &&
        applicationStatus !== "pending" &&
        applicationStatus !== "approved"
      ) {
        const driverResponse = await fetch(
          `${API_URL}/drivers/apply`,
          {
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
            }),
          }
        );

        const driverData = await driverResponse.json();

        if (!driverResponse.ok) {
          throw new Error(
            driverData.message || "Driver application failed."
          );
        }

        newApplicationStatus =
          driverData.application.status || "pending";

        setApplicationStatus(newApplicationStatus);
      }

      // 3. Update local user information
      const updatedUser = {
        ...currentUser,
        ...profileData.user,
        name: name.trim(),
        phone: phone.trim(),
        matricNumber,
        gender: gender.trim(),
        isDriver: newApplicationStatus === "approved",
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      router.replace("/profile");

      if (updatedUser.profilePicture) {
        await AsyncStorage.setItem(
          "profileImage",
          updatedUser.profilePicture
        );
      } else if (photoChanged) {
        await AsyncStorage.removeItem("profileImage");
      }

      // 4. Show success message
      if (isDriver && newApplicationStatus === "pending") {
        Alert.alert(
          "Application Submitted",
          "Your profile has been saved. Your driver application is waiting for admin approval.",
          [{ text: "OK", onPress: () => router.replace("/profile") }]
        );
      } else if (newApplicationStatus === "approved") {
        Alert.alert(
          "Success",
          "Your profile has been updated!",
          [{ text: "OK", onPress: () => router.replace("/profile") }]
        );
      } else {
        Alert.alert(
          "Success",
          "Your profile has been updated!",
          [{ text: "OK", onPress: () => router.replace("/profile") }]
        );
      }
    } catch (error) {
      console.error("Save profile error:", error);

      Alert.alert(
        "Save Failed",
        error instanceof Error
          ? error.message
          : "Unable to save your profile."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <BackButton />

        <View style={styles.headerText}>
          <Text style={styles.title}>Manage Profile</Text>
          <Text style={styles.subtitle}>
            Update your personal information
          </Text>
        </View>
      </View>

      {/* Profile Picture */}
      <View style={styles.imageSection}>
        <View style={styles.avatar}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.image} />
          ) : (
            <Text style={styles.avatarText}>👤</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.changeButton}
          onPress={handleChangePhoto}
        >
          <Text style={styles.changeText}>
            📷 Change Profile Picture
          </Text>
        </TouchableOpacity>

        {profileImage && (
          <TouchableOpacity onPress={handleRemovePhoto}>
            <Text style={styles.removeText}>Remove Picture</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          value={name}
          onChangeText={(value) => {
            setName(value);
            setErrors(prev => ({ ...prev, name: "" }));
          }}
          placeholder="Enter your name"
          placeholderTextColor="#999"
        />
        {!!errors.name && (
          <Text style={styles.errorText}>{errors.name}</Text>
        )}

        <Text style={styles.label}>Matric Number</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={matricNumber}
          editable={false}
          placeholder="Matric number"
          placeholderTextColor="#999"
        />

        <Text style={styles.helperText}>
          Your matric number cannot be changed.
        </Text>

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, errors.phone ? styles.inputError : null]}
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setErrors(prev => ({ ...prev, phone: "" }));
          }}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />
        {!!errors.phone && (
          <Text style={styles.errorText}>{errors.phone}</Text>
        )}

        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={[styles.input, errors.gender ? styles.inputError : null]}
          value={gender}
          onChangeText={(value) => {
            setGender(value);
            setErrors(prev => ({ ...prev, gender: "" }));
          }}
          placeholder="Enter your gender"
          placeholderTextColor="#999"
        />
        {!!errors.gender && (
          <Text style={styles.errorText}>{errors.gender}</Text>
        )}
      </View>

      {/* Driver Registration */}
      <View style={styles.section}>
        <View style={styles.driverHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Become a Driver</Text>
            <Text style={styles.driverDescription}>
              Register your vehicle to publish rides and accept passengers.
            </Text>
          </View>

          <Switch
            value={isDriver}
            onValueChange={setIsDriver}
            trackColor={{ false: "#CCC", true: "#FFB477" }}
            thumbColor={isDriver ? "#FF781F" : "#F4F3F4"}
            disabled={applicationStatus === "approved"}
          />
        </View>

        {applicationStatus && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              Application Status: {applicationStatus.toUpperCase()}
            </Text>
          </View>
        )}

        {!isDriver && (
          <View style={styles.passengerNote}>
            <Text style={styles.noteText}>
              🚗 You are currently registered as a passenger. You can apply
              to become a driver anytime.
            </Text>
          </View>
        )}

        {isDriver && (
          <View style={styles.vehicleForm}>
            <Text style={styles.label}>Vehicle Model</Text>
            <TextInput
              style={[
                styles.input,
                errors.vehicleModel ? styles.inputError : null,
              ]}
              value={vehicleModel}
              onChangeText={(value) => {
                setVehicleModel(value);
                setErrors(prev => ({ ...prev, vehicleModel: "" }));
              }}
              placeholder="e.g. Perodua Myvi"
              placeholderTextColor="#999"
              editable={
                applicationStatus !== "pending" &&
                applicationStatus !== "approved"
              }
            />
            {!!errors.vehicleModel && (
              <Text style={styles.errorText}>{errors.vehicleModel}</Text>
            )}

            <Text style={styles.label}>Vehicle Colour</Text>
            <TextInput
              style={[
                styles.input,
                errors.vehicleColor ? styles.inputError : null,
              ]}
              value={vehicleColor}
              onChangeText={(value) => {
                setVehicleColor(value);
                setErrors(prev => ({ ...prev, vehicleColor: "" }));
              }}
              placeholder="e.g. White"
              placeholderTextColor="#999"
              editable={
                applicationStatus !== "pending" &&
                applicationStatus !== "approved"
              }
            />
            {!!errors.vehicleColor && (
              <Text style={styles.errorText}>{errors.vehicleColor}</Text>
            )}

            <Text style={styles.label}>Plate Number</Text>
            <TextInput
              style={[
                styles.input,
                errors.plateNumber ? styles.inputError : null,
              ]}
              value={plateNumber}
              onChangeText={(value) => {
                setPlateNumber(value);
                setErrors(prev => ({ ...prev, plateNumber: "" }));
              }}
              placeholder="e.g. JXX 1234"
              autoCapitalize="characters"
              placeholderTextColor="#999"
              editable={
                applicationStatus !== "pending" &&
                applicationStatus !== "approved"
              }
            />
            {!!errors.plateNumber && (
              <Text style={styles.errorText}>{errors.plateNumber}</Text>
            )}

            <Text style={styles.label}>Driving Licence Number</Text>
            <TextInput
              style={[
                styles.input,
                errors.licenseNumber ? styles.inputError : null,
              ]}
              value={licenseNumber}
              onChangeText={(value) => {
                setLicenseNumber(value);
                setErrors(prev => ({ ...prev, licenseNumber: "" }));
              }}
              placeholder="Enter your driving licence number"
              placeholderTextColor="#999"
              editable={
                applicationStatus !== "pending" &&
                applicationStatus !== "approved"
              }
            />
            {!!errors.licenseNumber && (
              <Text style={styles.errorText}>{errors.licenseNumber}</Text>
            )}

            {applicationStatus === "pending" && (
              <Text style={styles.helperText}>
                Your application is waiting for admin approval.
              </Text>
            )}

            {applicationStatus === "rejected" && (
              <Text style={styles.rejectedText}>
                Your previous application was rejected. You can update your
                details and submit again.
              </Text>
            )}

            {!applicationStatus && (
              <Text style={styles.helperText}>
                Your application will be reviewed by an administrator.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE7D6",
  },
  content: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFE7D6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  imageSection: {
    alignItems: "center",
    marginTop: 35,
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E9A6A0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 55,
  },
  changeButton: {
    backgroundColor: "#FFF4EC",
    padding: 13,
    borderRadius: 9,
    marginTop: 20,
  },
  changeText: {
    color: "#FF781F",
    fontWeight: "bold",
    fontSize: 13,
  },
  removeText: {
    color: "red",
    marginTop: 15,
    fontSize: 12,
  },
  section: {
    backgroundColor: "#FFF8F2",
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0D6C4",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  disabledInput: {
    backgroundColor: "#F0EAE5",
    color: "#888",
  },
  helperText: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverDescription: {
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
    marginTop: -8,
    marginBottom: 5,
    paddingRight: 10,
  },
  passengerNote: {
    backgroundColor: "#FFF0E4",
    borderRadius: 9,
    padding: 12,
    marginTop: 10,
  },
  noteText: {
    fontSize: 12,
    color: "#A65A25",
    lineHeight: 18,
  },
  vehicleForm: {
    marginTop: 5,
  },
  statusBox: {
    backgroundColor: "#FFF0E4",
    borderRadius: 9,
    padding: 12,
    marginTop: 10,
  },
  statusText: {
    color: "#A65A25",
    fontSize: 12,
    fontWeight: "bold",
  },
  rejectedText: {
    color: "#D32F2F",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: "#FF781F",
    padding: 15,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 5,
  },
  saveText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  backButton: {
    alignItems: "center",
    padding: 15,
  },
  backText: {
    color: "#777",
  },
});
