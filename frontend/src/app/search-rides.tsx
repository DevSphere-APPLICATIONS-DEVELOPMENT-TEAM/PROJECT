import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CampusMapPicker from "../components/CampusMapPicker";
import LocationSearch, {
  LocationResult,
} from "../components/LocationSearch";
import RideCard from "../components/RideCard";
import {
  ApprovedRide,
  RideRouteFilter,
  getApprovedRides,
} from "../services/api";

const UTM_ROUTE_PRESETS = [
  "KTF",
  "N28",
  "N28A",
  "KTDI",
  "KTR",
  "Arked Angkasa",
];

const matchesRouteFilter = (ride: ApprovedRide, filter: RideRouteFilter) => {
  const originTerm = (filter.pickup || "").trim().toLowerCase();
  const destTerm = (filter.destination || "").trim().toLowerCase();

  const matchesOrigin =
    !originTerm || ride.pickup.toLowerCase().includes(originTerm);
  const matchesDestination =
    !destTerm || ride.destination.toLowerCase().includes(destTerm);

  return matchesOrigin && matchesDestination;
};

const resolveLocationText = (location: LocationResult) =>
  location.name && location.name !== "Unknown location"
    ? location.name
    : location.address;

export default function SearchRidesScreen() {
  const router = useRouter();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [activeField, setActiveField] = useState<"pickup" | "destination">(
    "pickup"
  );
  const [showMap, setShowMap] = useState(false);

  const [rides, setRides] = useState<ApprovedRide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<RideRouteFilter>({
    pickup: "",
    destination: "",
  });

  // Guards against stale responses when the user clears or submits a newer query.
  const requestIdRef = useRef(0);

  const handleBackToDashboard = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/dashboard");
    }
  };

  const fetchMatchingRides = async (filter: RideRouteFilter) => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        if (currentRequestId === requestIdRef.current) {
          setRides([]);
          setError("Please log in again to search available rides.");
        }
        return;
      }

      const data = await getApprovedRides(token, filter);
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const filteredRides = (data.rides || []).filter((ride) =>
        matchesRouteFilter(ride, filter)
      );
      setRides(filteredRides);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      console.error("Search rides error:", err);
      setRides([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
      );
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    const nextFilter: RideRouteFilter = {
      pickup: pickup.trim(),
      destination: destination.trim(),
    };
    setAppliedFilter(nextFilter);
    fetchMatchingRides(nextFilter);
  };

  const handleReset = () => {
    Keyboard.dismiss();
    requestIdRef.current += 1;
    setPickup("");
    setDestination("");
    setActiveField("pickup");
    setShowMap(false);
    setAppliedFilter({ pickup: "", destination: "" });
    setRides([]);
    setError("");
    setLoading(false);
    setHasSearched(false);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToDashboard}
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
        >
          <Text style={styles.backButtonText}>{"< Back"}</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Search Rides</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Form */}
        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>Where would you like to go?</Text>

          <LocationSearch
            label="Origin / Pickup Location"
            value={pickup}
            placeholder="Search or enter origin (e.g., KTF)"
            onChangeText={(text) => {
              setPickup(text);
              setActiveField("pickup");
            }}
            onSelect={(location) => {
              setPickup(resolveLocationText(location));
            }}
          />

          <LocationSearch
            label="Destination"
            value={destination}
            placeholder="Search or enter destination (e.g., N28)"
            onChangeText={(text) => {
              setDestination(text);
              setActiveField("destination");
            }}
            onSelect={(location) => {
              setDestination(resolveLocationText(location));
            }}
          />

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
                      activeField === "pickup" && styles.targetToggleTextActive,
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
            <TouchableOpacity style={styles.findButton} onPress={handleSearch}>
              <Text style={styles.findButtonText}>Find a Ride</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Clear / Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Campus Map Picker */}
        <TouchableOpacity
          style={styles.mapToggle}
          onPress={() => setShowMap((prev) => !prev)}
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

        {/* Matching Rides Results */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>
                {loading || error
                  ? "Matching Rides"
                  : `Matching Rides (${rides.length})`}
              </Text>
              {hasActiveFilter && (
                <Text style={styles.activeFilterText}>
                  {activeRouteSummary}
                </Text>
              )}
            </View>

            {loading ? (
              <View style={styles.statusCard}>
                <ActivityIndicator size="large" color="#F28A24" />
                <Text style={styles.statusText}>
                  Searching for matching rides...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>⚠️</Text>
                <Text style={styles.emptyTitle}>Unable to Load Rides</Text>
                <Text style={styles.emptyDescription}>{error}</Text>

                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchMatchingRides(appliedFilter)}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : rides.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🚘</Text>
                <Text style={styles.emptyTitle}>No matching rides found</Text>
                <Text style={styles.emptyDescription}>
                  {hasActiveFilter
                    ? `No approved rides match ${activeRouteSummary}. Try another route or clear the filter.`
                    : "No approved rides are currently available."}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleReset}
                >
                  <Text style={styles.retryButtonText}>Clear / Reset</Text>
                </TouchableOpacity>
              </View>
            ) : (
              rides.map((ride) => <RideCard key={ride._id} ride={ride} />)
            )}
          </View>
        )}
      </ScrollView>
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 16,
  },

  backButton: {
    backgroundColor: "#FFF0DD",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F28A24",
  },

  backButtonText: {
    color: "#F28A24",
    fontSize: 14,
    fontWeight: "bold",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#252525",
    marginLeft: 14,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  searchCard: {
    backgroundColor: "#FFF0DD",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },

  searchTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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

  mapToggleText: {
    color: "#F28A24",
    fontWeight: "bold",
    fontSize: 14,
  },

  resultsSection: {
    marginTop: 8,
  },

  resultsHeader: {
    marginHorizontal: 22,
    marginBottom: 14,
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

  statusCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E7DB",
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
