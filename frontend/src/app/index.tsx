
import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StartupScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Wait for startup screen
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Check saved login token
        const token = await AsyncStorage.getItem("token");

        if (token) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.log("Startup error:", error);
        router.replace("/login");
      }
    };

    checkLogin();
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
        color="#FFFFFF"
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
    color: "#FFFFFF",
    letterSpacing: 2,
  },

  logoImage: {
    width: 200,
    height: 200,
    marginBottom: 5,
  },

  loading: {
    marginTop: 45,
  },
});
