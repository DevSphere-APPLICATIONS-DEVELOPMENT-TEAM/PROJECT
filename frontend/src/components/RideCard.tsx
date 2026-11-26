import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import DriverProfileCard from "./DriverProfileCard";
import { ApprovedRide } from "../services/api";
import {
  displayDepartureDate,
  displayDepartureTime,
} from "../utils/departureSchedule";

interface RideCardProps {
  ride: ApprovedRide;
}

/** Displays an approved ride summary card matching the Campus Ride layout. */
export default function RideCard({ ride }: RideCardProps) {
  const router = useRouter();

  return (
    <View style={styles.rideCard}>
      {/* Driver Information */}
      <View style={styles.driverRow}>
        <DriverProfileCard rideId={ride._id} driver={ride.driverId} />

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
          <Text style={styles.detailValue}>{displayDepartureDate(ride)}</Text>
          <Text style={styles.detailValue}>{displayDepartureTime(ride)}</Text>
        </View>

        <View>
          <Text style={styles.detailLabel}>Available Seats</Text>
          <Text style={styles.detailValue}>{ride.seats} seats</Text>
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
  );
}

const styles = StyleSheet.create({
  rideCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F1E7DB",
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
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
  viewDetailsText: {
    color: "#F28A24",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 15,
  },
});
