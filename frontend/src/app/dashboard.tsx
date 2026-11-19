
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBar from "../components/NavBar";
import { API_URL } from "../constants/api";

type Ride = {
  _id: string;
  pickup: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  seats: number;
  cost: number;
  driverId: {
    name: string;
    profilePicture?: string | null;
  } | null;
};

export default function HomeScreen() {
  const router = useRouter();

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const comingSoon = (feature: string) => {
    Alert.alert(feature, "This feature will be available in Sprint 2.");
  };

  // Fetch available rides whenever Home screen is opened
  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Please log in again to view available rides.");
        return;
      }

      const response = await fetch(`${API_URL}/rides/approved`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load available rides.");
      }

      setRides(data.rides || []);
    } catch (err) {
      console.error("Fetch rides error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRides();
    }, [fetchRides])
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Image
              source={require("../../assets/images/logoicon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <View>
              <Text style={styles.logo}>Campus Ride</Text>
              <Text style={styles.tagline}>Your Campus. Your Ride.</Text>
            </View>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.welcomeDescription}>
            Ready for your next journey?
          </Text>
        </View>

        {/* Search Ride */}
        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>
            Where would you like to go?
          </Text>

          <View style={styles.locationBox}>
            <Image
              source={require("../../assets/images/locationicon.png")}
              style={styles.locationIcon}
              resizeMode="contain"
            />
            <Text style={styles.locationText}>Pickup location</Text>
          </View>

          <View style={styles.locationBox}>
            <Image
              source={require("../../assets/images/locationicon.png")}
              style={styles.locationIcon}
              resizeMode="contain"
            />
            <Text style={styles.locationText}>Destination</Text>
          </View>

          <TouchableOpacity
            style={styles.findButton}
            onPress={() => comingSoon("Find a Ride")}
          >
            <Text style={styles.findButtonText}>Find a Ride</Text>
          </TouchableOpacity>
        </View>

        {/* Available Rides */}
        <View style={styles.rideHeader}>
          <Text style={styles.sectionTitle}>Available Rides</Text>

          <TouchableOpacity onPress={fetchRides}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.statusCard}>
            <ActivityIndicator size="large" color="#F28A24" />
            <Text style={styles.statusText}>Loading available rides...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>Unable to Load Rides</Text>
            <Text style={styles.emptyDescription}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchRides}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : rides.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🚘</Text>
            <Text style={styles.emptyTitle}>No rides yet</Text>
            <Text style={styles.emptyDescription}>
              Available rides will appear here when drivers publish them.
            </Text>
          </View>
        ) : (
          rides.map((ride) => (
            <View style={styles.rideCard} key={ride._id}>

              {/* Driver Information */}
              <View style={styles.driverRow}>
                {ride.driverId?.profilePicture ? (
                  <Image
                    source={{ uri: ride.driverId.profilePicture }}
                    style={styles.driverImage}
                  />
                ) : (
                  <View style={styles.driverPlaceholder}>
                    <Text style={styles.driverPlaceholderText}>👤</Text>
                  </View>
                )}

                <Text style={styles.driverName}>
                  {ride.driverId?.name || "Campus Ride Driver"}
                </Text>

                <View style={styles.availableBadge}>
                  <Text style={styles.availableText}>Available</Text>
                </View>
              </View>

              <View style={styles.rideDivider} />

              {/* Route */}
              <View style={styles.routeRow}>
                <View style={styles.routeIcons}>
                  <Text style={styles.routeDot}>●</Text>
                  <View style={styles.routeLine} />
                  <Text style={styles.routeDestination}>●</Text>
                </View>

                <View style={styles.routeLocations}>
                  <View>
                    <Text style={styles.routeLabel}>Pickup</Text>
                    <Text style={styles.routeText}>{ride.pickup}</Text>
                  </View>

                  <View style={styles.destinationBlock}>
                    <Text style={styles.routeLabel}>Destination</Text>
                    <Text style={styles.routeText}>{ride.destination}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.rideDivider} />

              {/* Ride Details */}
              <View style={styles.rideDetails}>
                <View>
                  <Text style={styles.detailLabel}>Departure</Text>
                  <Text style={styles.detailValue}>
                    {ride.departureDate}
                  </Text>
                  <Text style={styles.detailValue}>
                    {ride.departureTime}
                  </Text>
                </View>

                <View>
                  <Text style={styles.detailLabel}>Available Seats</Text>
                  <Text style={styles.detailValue}>
                    {ride.seats} seats
                  </Text>
                </View>

                <View>
                  <Text style={styles.detailLabel}>Cost / Person</Text>
                  <Text style={styles.priceValue}>
                    RM {Number(ride.cost).toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/ride-details",
                    params: { rideId: ride._id },
                  })
                }
              >
                <Text style={styles.viewDetailsText}>View More Details →</Text>
              </TouchableOpacity>

            </View>
          ))
        )}

      </ScrollView>

      <NavBar active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F2",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 20,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },

  logo: {
    fontSize: 32,
    fontWeight: "900",
    color: "#F28A24",
    letterSpacing: 1,
  },

  tagline: {
    fontSize: 20,
    color: "#4e4d4d",
    marginTop: 2,
  },

  welcomeSection: {
    paddingHorizontal: 22,
    marginBottom: 20,
  },

  welcomeText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#252525",
  },

  welcomeDescription: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },

  searchCard: {
    backgroundColor: "#FFF0DD",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 18,
    marginBottom: 28,
  },

  searchTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },

  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  locationIcon: {
    height: 17,
    width: 17,
    marginRight: 10,
  },

  locationText: {
    color: "#999",
    fontSize: 14,
  },

  findButton: {
    backgroundColor: "#F28A24",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },

  findButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 22,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#292929",
  },

  refreshText: {
    color: "#F28A24",
    fontSize: 13,
    fontWeight: "bold",
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
  },

  statusText: {
    fontSize: 12,
    color: "#999",
    marginTop: 10,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E7DB",
    marginBottom: 20,
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  emptyDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
    lineHeight: 18,
  },

  retryButton: {
    backgroundColor: "#F28A24",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  rideCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F1E7DB",
  },

  viewDetailsText: {
  color: "#F28A24",
  fontSize: 13,
  fontWeight: "bold",
  textAlign: "right",
  marginTop: 15,
  },  
  viewDetailsButton: {
    backgroundColor: "#FFF0DD",
    padding: 12,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 15,
  },

  driverRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  driverImage: {
    width: 38,
    height: 38,
    borderRadius: 20,
    marginRight: 10,
  },

  driverPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#FFF0DD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  driverPlaceholderText: {
    fontSize: 19,
  },

  driverName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },

  availableBadge: {
    backgroundColor: "#E8F7E9",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  availableText: {
    fontSize: 10,
    color: "#329447",
    fontWeight: "bold",
  },

  rideDivider: {
    height: 1,
    backgroundColor: "#F1E7DB",
    marginVertical: 13,
  },

  routeRow: {
    flexDirection: "row",
  },

  routeIcons: {
    alignItems: "center",
    width: 20,
    marginRight: 10,
    paddingTop: 3,
  },

  routeDot: {
    fontSize: 11,
    color: "#F28A24",
  },

  routeLine: {
    width: 1,
    height: 35,
    backgroundColor: "#E6B98F",
    marginVertical: 2,
  },

  routeDestination: {
    fontSize: 11,
    color: "#555",
  },

  routeLocations: {
    flex: 1,
    gap: 12,
  },

  routeLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 3,
  },

  routeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  destinationBlock: {
    marginTop: 2,
  },

  rideDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  detailLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 6,
  },

  detailValue: {
    fontSize: 11,
    color: "#444",
    fontWeight: "600",
    marginBottom: 3,
  },

  priceValue: {
    fontSize: 13,
    color: "#F28A24",
    fontWeight: "bold",
  },
});
