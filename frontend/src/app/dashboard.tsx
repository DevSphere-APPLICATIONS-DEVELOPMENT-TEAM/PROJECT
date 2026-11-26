import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Href, useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBar from "../components/NavBar";
import RideCard from "../components/RideCard";
import { ApprovedRide, getApprovedRides } from "../services/api";

export default function HomeScreen() {
  const router = useRouter();

  const [rides, setRides] = useState<ApprovedRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all approved upcoming rides for the clean home feed
  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Please log in again to view available rides.");
        return;
      }

      const data = await getApprovedRides(token);
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

        {/* Compact Search / Filter Rides Trigger */}
        <TouchableOpacity
          style={styles.searchTrigger}
          onPress={() => router.push("/search-rides" as Href)}
          accessibilityRole="button"
          accessibilityLabel="Search or filter rides"
        >
          <View style={styles.searchTriggerIconBox}>
            <Text style={styles.searchTriggerIcon}>🔍</Text>
          </View>

          <View style={styles.searchTriggerTextBlock}>
            <Text style={styles.searchTriggerTitle}>Search / Filter Rides</Text>
            <Text style={styles.searchTriggerSubtitle}>
              Filter by origin, destination, or campus map
            </Text>
          </View>

          <View style={styles.searchTriggerBadge}>
            <Text style={styles.searchTriggerBadgeText}>Search →</Text>
          </View>
        </TouchableOpacity>

        {/* Available Rides */}
        <View style={styles.rideHeader}>
          <Text style={styles.sectionTitle}>Available Rides</Text>

          <TouchableOpacity onPress={() => fetchRides()}>
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
              onPress={() => fetchRides()}
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
          rides.map((ride) => <RideCard key={ride._id} ride={ride} />)
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

  searchTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0DD",
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F2CFA9",
  },

  searchTriggerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  searchTriggerIcon: {
    fontSize: 17,
  },

  searchTriggerTextBlock: {
    flex: 1,
    marginRight: 10,
  },

  searchTriggerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#292929",
  },

  searchTriggerSubtitle: {
    fontSize: 12,
    color: "#7A6A5A",
    marginTop: 2,
  },

  searchTriggerBadge: {
    backgroundColor: "#F28A24",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },

  searchTriggerBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
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
});
