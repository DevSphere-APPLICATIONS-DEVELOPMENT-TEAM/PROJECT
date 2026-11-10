
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const comingSoon = (feature: string) => {
    Alert.alert(feature, "This feature will be available in Sprint 2.");
  };

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

        <Text style={styles.sectionTitle}>Available Rides</Text>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🚘</Text>
          <Text style={styles.emptyTitle}>No rides yet</Text>
          <Text style={styles.emptyDescription}>
            Your recent availablerides will appear here.
          </Text>
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.replace("/dashboard")}
        >
          <Text style={styles.navIconActive}>⌂</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => comingSoon("Search")}
        >
          <Text style={styles.navIcon}>◷</Text>
          <Text style={styles.navText}>Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => comingSoon("Publish Ride")}
        >
          <Text style={styles.navIcon}>＋</Text>
          <Text style={styles.navText}>Publish</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => comingSoon("Messages")}
        >
          <Text style={styles.navIcon}>✉</Text>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/profile")}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#292929",
    marginHorizontal: 22,
    marginBottom: 14,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 28,
  },

  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1E7DB",
  },

  actionIcon: {
    fontSize: 27,
    marginBottom: 12,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  actionDescription: {
    fontSize: 11,
    color: "#999",
    marginTop: 5,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E7DB",
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
  },

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 25,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E7B6A8",
    alignItems: "center",
  },

  logoutText: {
    color: "#D9534F",
    fontWeight: "bold",
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  navItem: {
    alignItems: "center",
    flex: 1,
  },

  navIcon: {
    fontSize: 19,
    color: "#888",
  },

  navIconActive: {
    fontSize: 23,
    color: "#F28A24",
  },

  navText: {
    fontSize: 13,
    color: "#888",
    marginTop: 3,
  },

  navTextActive: {
    fontSize: 13,
    color: "#F28A24",
    fontWeight: "bold",
    marginTop: 3,
  },
});
