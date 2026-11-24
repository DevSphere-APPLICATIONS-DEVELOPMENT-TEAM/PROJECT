
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

interface DriverProfileCardProps {
  rideId: string;
  driver: {
    name: string;
    profilePicture?: string | null;
  } | null;
}

interface DriverDetails {
  name: string;
  matricNumber: string;
  gender: string;
  profilePicture?: string | null;
}

interface VehicleDetails {
  vehicleModel?: string;
  vehicleColor?: string;
  plateNumber?: string;
}

export default function DriverProfileCard({
  rideId,
  driver,
}: DriverProfileCardProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [driverDetails, setDriverDetails] =
    useState<DriverDetails | null>(null);
  const [vehicleDetails, setVehicleDetails] =
    useState<VehicleDetails | null>(null);

  const fetchDriverDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API_URL}/rides/${rideId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load driver profile.");
      }

      if (!data.ride?.driverId || !data.driverApplication) {
        throw new Error("Driver information is unavailable.");
      }

      setDriverDetails(data.ride.driverId);
      setVehicleDetails(data.driverApplication);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load driver profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const openProfile = () => {
    setVisible(true);
    fetchDriverDetails();
  };

  const closeProfile = () => {
    setVisible(false);
    setError("");
  };

  if (!driver) {
    return (
      <Text style={styles.unavailable}>
        Driver information unavailable
      </Text>
    );
  }

  return (
    <>

    <View style={styles.profileButton}>
    <Pressable onPress={openProfile} style={styles.profileContent}>
        {driver.profilePicture ? (
        <Image
            source={{ uri: driver.profilePicture }}
            style={styles.avatar}
        />
        ) : (
        <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>👤</Text>
        </View>
        )}

        <Text style={styles.name}>
        {driver.name || "Campus Ride Driver"}
        </Text>
    </Pressable>
    </View>

      {/* Driver Profile Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={closeProfile}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Driver Profile</Text>

              <Pressable onPress={closeProfile}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#F28A24" />
                <Text style={styles.muted}>Loading driver information...</Text>
              </View>
            ) : error ? (
              <View style={styles.loading}>
                <Text style={styles.error}>{error}</Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={fetchDriverDetails}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </Pressable>
              </View>
            ) : driverDetails ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Personal Information */}
                <View style={styles.driverInfo}>
                  {driverDetails.profilePicture ? (
                    <Image
                      source={{ uri: driverDetails.profilePicture }}
                      style={styles.largeAvatar}
                    />
                  ) : (
                    <View style={styles.largePlaceholder}>
                      <Text style={{ fontSize: 45 }}>👤</Text>
                    </View>
                  )}

                  <Text style={styles.driverName}>
                    {driverDetails.name}
                  </Text>
                  <Text style={styles.muted}>Verified Campus Driver</Text>
                </View>

                <Text style={styles.sectionTitle}>
                  Personal Information
                </Text>

                <View style={styles.infoBox}>
                  <Info
                    label="Matric Number"
                    value={driverDetails.matricNumber}
                  />
                  <Info
                    label="Gender"
                    value={driverDetails.gender}
                  />
                </View>

                {/* Vehicle Information */}
                <Text style={styles.sectionTitle}>
                  Vehicle Information
                </Text>

                <View style={styles.infoBox}>
                  <Info
                    label="Vehicle Model"
                    value={vehicleDetails?.vehicleModel}
                  />
                  <Info
                    label="Vehicle Colour"
                    value={vehicleDetails?.vehicleColor}
                  />
                  <Info
                    label="Plate Number"
                    value={vehicleDetails?.plateNumber}
                  />
                </View>

                <Pressable
                  style={styles.doneButton}
                  onPress={closeProfile}
                >
                  <Text style={styles.doneText}>Close Profile</Text>
                </Pressable>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.infoValue}>
        {value || "Not available"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 22,
  },
  placeholder: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: "#FFF0DD",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 21,
  },
  name: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  link: {
    fontSize: 11,
    color: "#F28A24",
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    color: "#999",
  },
  unavailable: {
    flex: 1,
    fontSize: 12,
    color: "#999",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  close: {
    fontSize: 22,
    color: "#777",
  },
  loading: {
    padding: 35,
    alignItems: "center",
    gap: 12,
  },
  driverInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  largeAvatar: {
    width: 95,
    height: 95,
    borderRadius: 50,
    marginBottom: 12,
  },
  largePlaceholder: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "#FFF0DD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  driverName: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 10,
    color: "#222",
  },
  infoBox: {
    backgroundColor: "#FFF8F2",
    padding: 14,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    flexShrink: 1,
    textAlign: "right",
  },
  muted: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  error: {
    color: "#DC2626",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#F28A24",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 9,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  doneButton: {
    backgroundColor: "#F28A24",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 15,
  },
  doneText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
