
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import BackButton from "../components/BackButton";
import {
  displayDepartureDate,
  displayDepartureTime,
} from "../utils/departureSchedule";

type RideDetails = {
  _id: string;
  pickup: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  departureAt?: string | null;
  seats: number;
  cost: number;
  driverId: {
    name: string;
    matricNumber: string;
    gender: string;
    profilePicture?: string | null;
  };
};

type DriverApplication = {
  vehicleModel: string;
  vehicleColor: string;
  plateNumber: string;
};

export default function RideDetailsScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams<{ rideId: string }>();

  const [ride, setRide] = useState<RideDetails | null>(null);
  const [vehicle, setVehicle] = useState<DriverApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(
          `${API_URL}/rides/${rideId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load ride details.");
        }

        setRide(data.ride);
        setVehicle(data.driverApplication);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F28A24" />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  if (error || !ride) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Unable to Load Ride</Text>
        <Text style={styles.errorText}>
          {error || "Ride not found."}
        </Text>
        <Text
          style={styles.backLink}
          onPress={() => router.back()}
        >
          Go Back
        </Text>
      </View>
    );
  }

  const driver = ride.driverId;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.title}>Ride Details</Text>
        </View>

        {/* Driver Profile */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Driver Profile</Text>

          <View style={styles.driverProfile}>
            {driver?.profilePicture ? (
              <Image
                source={{ uri: driver.profilePicture }}
                style={styles.driverImage}
              />
            ) : (
              <View style={styles.driverPlaceholder}>
                <Text style={styles.placeholderText}>👤</Text>
              </View>
            )}

            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>
                {driver?.name || "Campus Ride Driver"}
              </Text>

              <Text style={styles.matricNumber}>
                {driver?.matricNumber || "Student"}
              </Text>

              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>
                  ✓ Approved Driver
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>
              {driver?.gender || "Not provided"}
            </Text>
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle Model</Text>
            <Text style={styles.infoValue}>
              {vehicle?.vehicleModel || "Not available"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle Colour</Text>
            <Text style={styles.infoValue}>
              {vehicle?.vehicleColor || "Not available"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plate Number</Text>
            <Text style={styles.infoValue}>
              {vehicle?.plateNumber || "Not available"}
            </Text>
          </View>
        </View>

        {/* Route Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route Information</Text>

          <View style={styles.routeRow}>
            <View style={styles.routeIcons}>
              <Text style={styles.pickupDot}>●</Text>
              <View style={styles.routeLine} />
              <Text style={styles.destinationDot}>●</Text>
            </View>

            <View style={styles.routeLocations}>
              <View>
                <Text style={styles.infoLabel}>Pickup Location</Text>
                <Text style={styles.locationText}>{ride.pickup}</Text>
              </View>

              <View>
                <Text style={styles.infoLabel}>Destination</Text>
                <Text style={styles.locationText}>
                  {ride.destination}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Departure Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Departure Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Departure Date</Text>
            <Text style={styles.infoValue}>
              {displayDepartureDate(ride)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Departure Time</Text>
            <Text style={styles.infoValue}>
              {displayDepartureTime(ride)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Available Seats</Text>
            <Text style={styles.infoValue}>
              {ride.seats} seats
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Cost Per Person</Text>
            <Text style={styles.priceValue}>
              RM {Number(ride.cost).toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Please check the driver and ride information before proceeding.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F2",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF9F2",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  loadingText: {
    color: "#888",
    marginTop: 12,
    fontSize: 13,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  errorText: {
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
  backLink: {
    color: "#F28A24",
    fontWeight: "bold",
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#292929",
    marginLeft: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 15,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: "#F1E7DB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 18,
  },
  driverProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImage: {
    width: 75,
    height: 75,
    borderRadius: 40,
    marginRight: 15,
  },
  driverPlaceholder: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: "#FFF0DD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  placeholderText: {
    fontSize: 35,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
  },
  matricNumber: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  verifiedBadge: {
    backgroundColor: "#E8F7E9",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  verifiedText: {
    color: "#329447",
    fontSize: 10,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1E7DB",
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 10,
  },
  routeRow: {
    flexDirection: "row",
  },
  routeIcons: {
    alignItems: "center",
    width: 20,
    marginRight: 12,
    paddingTop: 3,
  },
  pickupDot: {
    color: "#F28A24",
    fontSize: 12,
  },
  routeLine: {
    width: 2,
    height: 45,
    backgroundColor: "#E6B98F",
    marginVertical: 3,
  },
  destinationDot: {
    color: "#555",
    fontSize: 12,
  },
  routeLocations: {
    flex: 1,
    gap: 25,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
  },
  priceContainer: {
    backgroundColor: "#FFF0DD",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  priceLabel: {
    color: "#A65A25",
    fontSize: 13,
    fontWeight: "600",
  },
  priceValue: {
    color: "#F28A24",
    fontSize: 20,
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 17,
  },
});
