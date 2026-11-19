import React from "react";
import { View, Image, Pressable, Text, StyleSheet } from "react-native";

type Spot = { code: string; left: string; top: string };

// Positions are percentages across the map image. Adjust after testing.
const SPOTS: Spot[] = [
  { code: "N28A", left: "48%", top: "21%" },
];

type Props = { onSelect: (code: string) => void };

export default function CampusMapPicker({ onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.hint}>Tap a location on the map</Text>
      <View style={styles.mapBox}>
        <Image
          source={require("../../assets/campus-map.png")}
          style={styles.map}
          resizeMode="contain"
        />
        {SPOTS.map((spot) => (
          <Pressable
            key={spot.code}
            onPress={() => onSelect(spot.code)}
            style={[styles.spot, { left: spot.left, top: spot.top }]}
          >
            <Text style={styles.spotText}>{spot.code}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 10,
  },
  hint: { fontSize: 12, color: "#666", marginBottom: 8 },
  mapBox: { width: "100%", aspectRatio: 1.6, position: "relative" },
  map: { width: "100%", height: "100%" },
  spot: {
    position: "absolute",
    backgroundColor: "rgba(242,138,36,0.35)",
    borderWidth: 1,
    borderColor: "#F28A24",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  spotText: { fontSize: 10, fontWeight: "bold", color: "#7a3e00" },
});