
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Modal,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavBar from "../components/NavBar";
import LogoutButton from "../components/LogoutButton";

type User = {
  name: string;
  matricNumber?: string;
  matricNo?: string;
  profilePicture?: string | null;
};

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const savedUser = await AsyncStorage.getItem("user");
          const savedImage = await AsyncStorage.getItem("profileImage");

          if (savedUser) {
            const userData = JSON.parse(savedUser);

            setUser({
              ...userData,
              matricNumber:
                userData.matricNumber || userData.matricNo || "",
              profilePicture:
                userData.profilePicture || savedImage || null,
            });
          }
        } catch (error) {
          console.log("Unable to retrieve user:", error);
        }
      };

      loadUser();
    }, [])
  );

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, "This feature is coming soon!");
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🚘 RYDE</Text>

          <TouchableOpacity
            onPress={() => showComingSoon("Settings")}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Information */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.avatarText}>👤</Text>
              )}
            </View>

            <View style={styles.userDetails}>
              <Text style={styles.name}>
                {user?.name || "Student"}
              </Text>

              <View style={styles.verified}>
                <Text style={styles.verifiedText}>
                  ✓ Verified Student
                </Text>
              </View>

              <Text style={styles.matric}>
                {user?.matricNumber || user?.matricNo || ""}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/manage-profile")}
          >
            <Text style={styles.editText}>✎  Manage Profile</Text>
          </TouchableOpacity>
        </View>

        {/* RYDE Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>
            📊  My RYDE Statistics
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🚘</Text>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statNumber}>—</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🌿</Text>
              <Text style={styles.statNumber}>—</Text>
              <Text style={styles.statLabel}>Reliability</Text>
            </View>
          </View>
        </View>

        {/* My Reviews */}
        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => showComingSoon("My Reviews")}
        >
          <Text style={styles.menuIcon}>⭐</Text>

          <View style={styles.menuDetails}>
            <Text style={styles.menuTitle}>My Reviews</Text>
            <Text style={styles.menuDescription}>
              Ratings and feedback received
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <LogoutButton />

      </ScrollView>
      
      <NavBar active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFE7D6",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  logo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FF781F",
    fontStyle: "italic",
  },

  settingsIcon: {
    fontSize: 24,
  },

  profileCard: {
    backgroundColor: "#FFD9BD",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },

  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#FF781F",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarText: {
    fontSize: 42,
  },

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },

  userDetails: {
    flex: 1,
  },

  name: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#222",
  },

  verified: {
    backgroundColor: "#D7F5DE",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginTop: 6,
  },

  verifiedText: {
    color: "#168B43",
    fontSize: 11,
    fontWeight: "bold",
  },

  matric: {
    fontSize: 13,
    color: "#555",
    marginTop: 6,
  },

  editButton: {
    backgroundColor: "#FF781F",
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },

  editText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  statsCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statIcon: {
    fontSize: 27,
    marginBottom: 7,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#222",
  },

  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  statDivider: {
    width: 1,
    height: 65,
    backgroundColor: "#DDD",
  },

  menuCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    fontSize: 28,
    width: 48,
  },

  menuDetails: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },

  menuDescription: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
  },

  arrow: {
    fontSize: 28,
    color: "#555",
    marginLeft: 8,
  },

  logoutButton: {
    backgroundColor: "#FFD5CE",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  logoutText: {
    color: "#D92525",
    fontSize: 16,
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  modalContainer: {
    width: "100%",
    backgroundColor: "#FFE7D6",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
  },

  modalIcon: {
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: "#FFD5CE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  modalIconText: {
    fontSize: 35,
    color: "#D92525",
    fontWeight: "bold",
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222",
  },

  modalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 25,
  },

  cancelButton: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#FFF",
    alignItems: "center",
  },

  cancelText: {
    color: "#333",
    fontWeight: "bold",
  },

  confirmButton: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#FF781F",
    alignItems: "center",
  },

  confirmText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
