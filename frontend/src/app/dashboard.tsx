import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBar from "../components/NavBar";
import CampusMapPicker from "../components/CampusMapPicker";
import DriverProfileCard from "../components/DriverProfileCard";
import {
  ApprovedRide,
  RideRouteFilter,
  getApprovedRides,
} from "../services/api";
import {
  displayDepartureDate,
  displayDepartureTime,
} from "../utils/departureSchedule";

type Ride = ApprovedRide;

const UTM_ROUTE_PRESETS = [
  "KTF",
  "N28",
  "N28A",
  "KTDI",
  "KTR",
  "Arked Angkasa",
];

const matchesRouteFilter = (ride: Ride, filter: RideRouteFilter) => {
  const originTerm = (filter.pickup || "").trim().toLowerCase();
  const destTerm = (filter.destination || "").trim().toLowerCase();

  const matchesOrigin =
    !originTerm || ride.pickup.toLowerCase().includes(originTerm);
  const matchesDestination =
    !destTerm || ride.destination.toLowerCase().includes(destTerm);

  return matchesOrigin && matchesDestination;
};

export default function HomeScreen() {
  const router = useRouter();

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [activeField, setActiveField] = useState<"pickup" | "destination">(
    "pickup"
  );
  const [appliedFilter, setAppliedFilter] = useState<RideRouteFilter>({
    pickup: "",
    destination: "",
  });
  const appliedFilterRef = useRef<RideRouteFilter>(appliedFilter);
  appliedFilterRef.current = appliedFilter;

  const [showMap, setShowMap] = useState(false);

  // Fetch available rides with optional route filtering (+ client-side fallback)
  const fetchRides = useCallback(async (filterOverride?: RideRouteFilter) => {
    const activeFilter = filterOverride ?? appliedFilterRef.current;

    try {
      setLoading(true);
      setError("");

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Please log in again to view available rides.");
        return;
      }

      const data = await getApprovedRides(token, activeFilter);
      const filteredRides = (data.rides || []).filter((ride) =>
        matchesRouteFilter(ride, activeFilter)
      );

      setRides(filteredRides);
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

  const handleSearch = () => {
    const nextFilter: RideRouteFilter = {
      pickup: pickup.trim(),
      destination: destination.trim(),
    };
    setAppliedFilter(nextFilter);
    appliedFilterRef.current = nextFilter;
    fetchRides(nextFilter);
  };

  const handleReset = () => {
    const emptyFilter: RideRouteFilter = { pickup: "", destination: "" };
    setPickup("");
    setDestination("");
    setActiveField("pickup");
    setAppliedFilter(emptyFilter);
    appliedFilterRef.current = emptyFilter;
    fetchRides(emptyFilter);
  };

  const handlePresetSelect = (preset: string) => {
    if (activeField === "pickup") {
      setPickup(preset);
      if (!destination.trim()) {
        setActiveField("destination");
      }
    } else {
      setDestination(preset);
    }
  };

  const hasActiveFilter = Boolean(
    appliedFilter.pickup?.trim() || appliedFilter.destination?.trim()
  );

  const activeRouteSummary = [
    appliedFilter.pickup?.trim() ? `From ${appliedFilter.pickup.trim()}` : "",
    appliedFilter.destination?.trim()
      ? `To ${appliedFilter.destination.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

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

          <View
            style={[
              styles.locationBox,
              activeField === "pickup" && styles.locationBoxActive,
            ]}
          >
            <Image
              source={require("../../assets/images/locationicon.png")}
              style={styles.locationIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.locationInput}
              placeholder="Origin / Pickup (e.g., KTF)"
              placeholderTextColor="#999"
              value={pickup}
              onChangeText={setPickup}
              onFocus={() => setActiveField("pickup")}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              accessibilityLabel="Origin pickup location"
            />
            {pickup.length > 0 && (
              <TouchableOpacity
                onPress={() => setPickup("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Clear origin"
              >
                <Text style={styles.clearFieldText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            style={[
              styles.locationBox,
              activeField === "destination" && styles.locationBoxActive,
            ]}
          >
            <Image
              source={require("../../assets/images/locationicon.png")}
              style={styles.locationIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.locationInput}
              placeholder="Destination (e.g., N28)"
              placeholderTextColor="#999"
              value={destination}
              onChangeText={setDestination}
              onFocus={() => setActiveField("destination")}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              accessibilityLabel="Destination location"
            />
            {destination.length > 0 && (
              <TouchableOpacity
                onPress={() => setDestination("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Clear destination"
              >
                <Text style={styles.clearFieldText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* UTM Campus Preset Chips */}
          <View style={styles.presetSection}>
            <View style={styles.presetHeaderRow}>
              <Text style={styles.presetLabel}>Quick select for:</Text>
              <View style={styles.targetToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.targetTogglePill,
                    activeField === "pickup" && styles.targetTogglePillActive,
                  ]}
                  onPress={() => setActiveField("pickup")}
                >
                  <Text
                    style={[
                      styles.targetToggleText,
                      activeField === "pickup" &&
                        styles.targetToggleTextActive,
                    ]}
                  >
                    Origin
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.targetTogglePill,
                    activeField === "destination" &&
                      styles.targetTogglePillActive,
                  ]}
                  onPress={() => setActiveField("destination")}
                >
                  <Text
                    style={[
                      styles.targetToggleText,
                      activeField === "destination" &&
                        styles.targetToggleTextActive,
                    ]}
                  >
                    Destination
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.chipRow}>
              {UTM_ROUTE_PRESETS.map((preset) => {
                const currentTargetValue =
                  activeField === "pickup" ? pickup : destination;
                const isSelected =
                  currentTargetValue.trim().toLowerCase() ===
                  preset.toLowerCase();

                return (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipActive,
                    ]}
                    onPress={() => handlePresetSelect(preset)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextActive,
                      ]}
                    >
                      {preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.searchActionsRow}>
            <TouchableOpacity
              style={styles.findButton}
              onPress={handleSearch}
            >
              <Text style={styles.findButtonText}>Find a Ride</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Clear / Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.mapToggle}
          onPress={() => setShowMap(!showMap)}
        >
          <Text style={styles.mapToggleText}>
            {showMap ? "Hide campus map" : "Pick destination on map"}
          </Text>
        </TouchableOpacity>

        {showMap && (
          <CampusMapPicker
            onSelect={(code) => {
              setDestination(code);
              setShowMap(false);
            }}
          />
        )}

        {/* Available Rides */}
        <View style={styles.rideHeader}>
          <View style={styles.rideHeaderLeft}>
            <Text style={styles.sectionTitle}>Available Rides</Text>
            {hasActiveFilter && (
              <Text style={styles.activeFilterText}>
                Filtered: {activeRouteSummary}
              </Text>
            )}
          </View>

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
            <Text style={styles.emptyTitle}>
              {hasActiveFilter ? "No matching rides found" : "No rides yet"}
            </Text>
            <Text style={styles.emptyDescription}>
              {hasActiveFilter
                ? `No approved rides match ${activeRouteSummary}. Try another route or clear the filter.`
                : "Available rides will appear here when drivers publish them."}
            </Text>
            {hasActiveFilter && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleReset}
              >
                <Text style={styles.retryButtonText}>Clear / Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          rides.map((ride) => (
            <View style={styles.rideCard} key={ride._id}>

          {/* Driver Information */}
          <View style={styles.driverRow}>
            <DriverProfileCard
              rideId={ride._id}
              driver={ride.driverId}
            />

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
                    {displayDepartureDate(ride)}
                  </Text>
                  <Text style={styles.detailValue}>
                    {displayDepartureTime(ride)}
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },

  locationBoxActive: {
    borderColor: "#F28A24",
  },

  locationIcon: {
    height: 17,
    width: 17,
    marginRight: 10,
  },

  locationInput: {
    flex: 1,
    color: "#333",
    fontSize: 14,
    paddingVertical: 4,
  },

  clearFieldText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "bold",
    paddingLeft: 8,
  },

  presetSection: {
    marginTop: 2,
    marginBottom: 12,
  },

  presetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  presetLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B5E53",
  },

  targetToggleRow: {
    flexDirection: "row",
    gap: 6,
  },

  targetTogglePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6C7A8",
  },

  targetTogglePillActive: {
    backgroundColor: "#F28A24",
    borderColor: "#F28A24",
  },

  targetToggleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B5E53",
  },

  targetToggleTextActive: {
    color: "#FFFFFF",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  presetChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6C7A8",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  presetChipActive: {
    backgroundColor: "#F28A24",
    borderColor: "#F28A24",
  },

  presetChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5C4735",
  },

  presetChipTextActive: {
    color: "#FFFFFF",
  },

  searchActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },

  findButton: {
    flex: 1,
    backgroundColor: "#F28A24",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  findButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  resetButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F28A24",
  },

  resetButtonText: {
    color: "#F28A24",
    fontSize: 14,
    fontWeight: "bold",
  },

  mapToggle: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F28A24",
  },

  mapToggleText: { color: "#F28A24", fontWeight: "bold", fontSize: 14 },

  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 22,
    marginBottom: 14,
  },

  rideHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#292929",
  },

  activeFilterText: {
    fontSize: 12,
    color: "#B45E14",
    fontWeight: "600",
    marginTop: 2,
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