import React, { useState } from "react";
import {
  View,
  Image,
  Pressable,
  Text,
  StyleSheet,
  useWindowDimensions,
  LayoutChangeEvent,
} from "react-native";

type Spot = { code: string; left: string; top: string };

const MAP_ASPECT_RATIO = 1.6;

// Positions are percentages across the map image. Adjust after testing.
const SPOTS: Spot[] = [{ code: "N28A", left: "48%", top: "21%" }];

type Props = { onSelect: (code: string) => void };

export default function CampusMapPicker({ onSelect }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const [mapWidth, setMapWidth] = useState<number>(
    Math.max(240, windowWidth - 60)
  );

  const mapHeight = Math.round(mapWidth / MAP_ASPECT_RATIO);

  const handleLayout = (event: LayoutChangeEvent) => {
    const measuredWidth = Math.round(event.nativeEvent.layout.width);
    if (measuredWidth > 0 && Math.abs(measuredWidth - mapWidth) > 1) {
      setMapWidth(measuredWidth);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.hint}>Tap a location on the map</Text>
      <View
        style={[styles.mapBox, { height: mapHeight }]}
        onLayout={handleLayout}
      >
        <Image
          source={require("../../assets/campus-map.png")}
          style={[styles.map, { height: mapHeight }]}
          resizeMode="contain"
        />
        {SPOTS.map((spot) => (
          <Pressable
            key={spot.code}
            onPress={() => onSelect(spot.code)}
            style={[
              styles.spot,
              { left: spot.left as `${number}%`, top: spot.top as `${number}%` },
            ]}
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
    borderWidth: 1,
    borderColor: "#F1E7DB",
  },
  hint: { fontSize: 12, color: "#666", marginBottom: 8 },
  mapBox: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#F5F2EC",
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
  },
  spot: {
    position: "absolute",
    zIndex: 2,
    backgroundColor: "rgba(242,138,36,0.35)",
    borderWidth: 1,
    borderColor: "#F28A24",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  spotText: { fontSize: 10, fontWeight: "bold", color: "#7a3e00" },
});
