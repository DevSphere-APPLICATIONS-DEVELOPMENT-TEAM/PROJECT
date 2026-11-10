import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

export default function StartupScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logoicon.png")}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.logo}>CampusRide</Text>

      <ActivityIndicator
        size="large"
        color="#FF781F"
        style={styles.loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF781F",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 55,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 2,
  },
  logoImage: {
  width: 200,
  height: 200,
  marginBottom: 5,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
  },
  loading: {
    marginTop: 45,
  },
});
