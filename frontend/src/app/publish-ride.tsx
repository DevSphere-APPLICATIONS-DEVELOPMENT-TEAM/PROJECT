
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../components/BackButton";
import DeparturePicker from "../components/DeparturePicker";
import {
  buildDepartureDate,
  isFutureDeparture,
  toDisplayDate,
  toDisplayTime,
} from "../utils/departureSchedule";
import { API_URL } from "../constants/api";

export default function PublishRide() {
  const router = useRouter();

  const [driverStatus, setDriverStatus] = useState("not_registered");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [depDate, setDepDate] = useState(""); // YYYY-MM-DD from picker
  const [depTime, setDepTime] = useState(""); // HH:mm from picker
  const [seats, setSeats] = useState("");
  const [cost, setCost] = useState("10.00");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");

  /** Show feedback on both web (window.alert) and mobile (Alert.alert). */
  const showAlert = (title: string, message: string) => {
    setErrorBanner(message);
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Check driver application status
  useEffect(() => {
    const checkDriverStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          setDriverStatus("not_registered");
          return;
        }

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
          setDriverStatus(data.application.status);
        } else {
          setDriverStatus("not_registered");
        }
      } catch (error) {
        console.log("Driver status error:", error);
        setDriverStatus("not_registered");
      } finally {
        setLoading(false);
      }
    };

    checkDriverStatus();
  }, []);

  // Publish ride to MongoDB
  const handlePublish = async () => {
    if (publishing) return;
    setErrorBanner("");

    if (
      !pickup.trim() ||
      !destination.trim() ||
      !depDate ||
      !depTime ||
      !seats.trim() ||
      !cost.trim()
    ) {
      showAlert("Incomplete Information", "Please fill in all fields.");
      return;
    }

    if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
      showAlert("Invalid Route", "Pickup and destination cannot be the same.");
      return;
    }

    const departureDateObj = buildDepartureDate(depDate, depTime);
    if (!departureDateObj) {
      showAlert("Invalid Schedule", "Please select a valid departure date and time.");
      return;
    }

    if (!isFutureDeparture(departureDateObj)) {
      showAlert(
        "Invalid Schedule",
        "Departure date and time must be in the future."
      );
      return;
    }

    if (!Number.isInteger(Number(seats)) || Number(seats) < 1) {
      showAlert("Invalid Seats", "Please enter a valid number of seats.");
      return;
    }

    if (!Number.isFinite(Number(cost)) || Number(cost) < 0) {
      showAlert("Invalid Cost", "Please enter a valid cost.");
      return;
    }

    try {
      setPublishing(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        showAlert("Login Required", "Please log in again.");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/rides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickup: pickup.trim(),
          destination: destination.trim(),
          departureDate: toDisplayDate(depDate),
          departureTime: toDisplayTime(depTime),
          departureAt: departureDateObj!.toISOString(),
          seats: Number(seats),
          cost: Number(cost),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(
          "Unable to Publish",
          data.message || "Something went wrong. Please try again."
        );
        return;
      }

      setSuccessModalVisible(true);

    } catch (error) {
      console.error("Publish ride error:", error);
      showAlert(
        "Connection Error",
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF781F" />
        <Text style={styles.loadingText}>
          Checking driver status...
        </Text>
      </View>
    );
  }

  // Non-driver, pending or rejected driver
  if (driverStatus !== "approved") {
    const isPending = driverStatus === "pending";
    const isRejected = driverStatus === "rejected";

    return (
      <View style={styles.container}>
        <View style={styles.noticeContent}>
          <View style={styles.header}>
            <BackButton />
            <View style={styles.headerText}>
              <Text style={styles.title}>Publish a Ride</Text>
              <Text style={styles.subtitle}>
                Share your journey with UTM students
              </Text>
            </View>
          </View>

          <View style={styles.noticeCard}>
            <Text style={styles.noticeIcon}>🚗</Text>

            <Text style={styles.noticeTitle}>
              {isPending
                ? "Application Under Review"
                : isRejected
                ? "Application Rejected"
                : "Become a CampusRide Driver"}
            </Text>

            <Text style={styles.noticeText}>
              {isPending
                ? "Your driver registration is being reviewed. You can publish rides once your application is approved."
                : isRejected
                ? "Your driver registration was rejected. You can submit another application."
                : "Want to share your journey with other UTM students? Register as a driver to start publishing rides."}
            </Text>

            {!isPending && (
              <TouchableOpacity
                style={styles.publishButton}
                onPress={() => router.push("/manage-profile")}
              >
                <Text style={styles.publishButtonText}>
                  {isRejected ? "Register Again" : "Register as Driver"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Approved driver: show Publish Ride form
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerText}>
            <Text style={styles.title}>Publish a Ride</Text>
            <Text style={styles.subtitle}>
              Share your journey with UTM students
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Route Information</Text>

        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={styles.input}
              placeholder="Pickup Location"
              placeholderTextColor="#999"
              value={pickup}
              onChangeText={setPickup}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={styles.input}
              placeholder="Destination"
              placeholderTextColor="#999"
              value={destination}
              onChangeText={setDestination}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Departure Information
        </Text>

        <View style={styles.inputCard}>
          <DeparturePicker
            dateValue={depDate}
            timeValue={depTime}
            onDateChange={setDepDate}
            onTimeChange={setDepTime}
          />
        </View>

        <Text style={styles.sectionTitle}>Available Seats</Text>

        <View style={styles.inputCard}>
          <View style={styles.seatRow}>
            <View style={styles.seatInfo}>
              <Text style={styles.seatLabel}>Number of passengers</Text>
            </View>

            <View style={styles.seatButtons}>
              <TouchableOpacity
                style={styles.seatButton}
                onPress={() =>
                  setSeats(String(Math.max(1, Number(seats) - 1)))
                }
              >
                <Text style={styles.seatButtonText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.seatNumber}>{seats}</Text>
              
              <TouchableOpacity
                style={styles.seatButton}
                onPress={() =>
                  setSeats(String(Number(seats) + 1))
                }
              >
                <Text style={styles.seatButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Cost Information</Text>

        <View style={styles.costCard}>
          <Text style={styles.costLabel}>
            Estimated Cost per Passenger
          </Text>

          <View style={styles.costInputRow}>
            <Text style={styles.currency}>RM</Text>
            <TextInput
              style={styles.costInput}
              placeholder="10.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={cost}
              onChangeText={setCost}
            />
          </View>
        </View>

        {!!errorBanner && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorBanner}</Text>
            <TouchableOpacity onPress={() => setErrorBanner("")}>
              <Text style={styles.errorDismiss}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.publishButton,
            publishing && styles.disabledButton,
          ]}
          onPress={handlePublish}
          activeOpacity={0.85}
          disabled={publishing}
        >
          {publishing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.publishButtonText}>
              Publish Ride
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✓</Text>
            </View>

            <Text style={styles.successTitle}>Ride Published!</Text>

            <Text style={styles.successMessage}>
                Your ride has been successfully published and is now
                available for UTM students to book.
            </Text>

            <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                setSuccessModalVisible(false);
                router.replace("/dashboard");
                }}
            >
                <Text style={styles.successButtonText}>Back to Home</Text>
            </TouchableOpacity>
            </View>
        </View>
    </Modal>
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE6D5",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFE6D5",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
    fontSize: 13,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },

  noticeContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
    gap: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },

  subtitle: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 12,
    color: "#777",
    marginBottom: 8,
    marginTop: 12,
  },

  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 2,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 43,
    paddingHorizontal: 8,
  },

  inputIcon: {
    width: 27,
    fontSize: 15,
  },

  input: {
    flex: 1,
    fontSize: 11,
    color: "#333",
    paddingVertical: 10,
  },

  separator: {
    height: 1,
    backgroundColor: "#E5DCD6",
    marginLeft: 9,
  },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 35,
  },

  seatInfo: {
    flex: 1,
  },

  seatLabel: {
    fontSize: 12,
    color: "#999",
  },

  seatNumber: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },

  seatButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  seatButton: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#FFF0E5",
    alignItems: "center",
    justifyContent: "center",
  },

  seatButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF781F",
  },
  costCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 18,
  },

  costLabel: {
    fontSize: 12,
    color: "#999",
  },

  costInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  currency: {
    fontSize: 12,
    color: "#999",
    marginRight: 5,
  },

  costInput: {
    flex: 1,
    fontSize: 12,
    color: "#333",
    paddingVertical: 4,
  },

  publishButton: {
    backgroundColor: "#FF781F",
    height: 45,
    width: 200,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  publishButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  disabledButton: {
    opacity: 0.6,
  },

  noticeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    marginTop: 30,
  },

  noticeIcon: {
    fontSize: 45,
    marginBottom: 15,
  },

  noticeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  noticeText: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  successModal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
  },

  successIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "#FFF0E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  successIcon: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FF781F",
 },

  successTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
 },

  successMessage: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 22,
 },

  successButton: {
    width: "100%",
    height: 44,
    backgroundColor: "#FF781F",
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  successButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  errorBannerText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 8,
  },

  errorDismiss: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
});
