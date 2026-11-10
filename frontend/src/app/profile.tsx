
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {/* Profile Information */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}></Text>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.name}></Text>
          <View style={styles.verified}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <Text style={styles.matric}>A24KE02141</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => Alert.alert("Edit Profile", "Coming soon!")}
        >
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews */}
      <View style={styles.reviewCard}>
        <Text style={styles.reviewTitle}>Review & Rating</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.greyText}>Your Rating</Text>
          <Text style={styles.rating}>4.7 ★</Text>
        </View>

        <TouchableOpacity
          onPress={() => Alert.alert("Reviews", "Coming soon!")}
        >
          <Text style={styles.seeReviews}>See all reviews →</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.reviewRow}>
          <Text style={styles.reviewer}>👨🏻 Ali</Text>
          <Text style={styles.stars}>★★★★★</Text>
        </View>
        <Text style={styles.date}>◷ 30 Oct 2026</Text>
        <Text style={styles.comment}>
          Friendly and arrived on time. Great experience!
        </Text>

        <View style={styles.divider} />

        <View style={styles.reviewRow}>
          <Text style={styles.reviewer}>👩🏻 Sarah</Text>
          <Text style={styles.stars}>★★★★☆</Text>
        </View>
        <Text style={styles.date}>◷ 1 Nov 2026</Text>
        <Text style={styles.comment}>
          Smooth journey and good communication.
        </Text>

        <TouchableOpacity
          onPress={() => Alert.alert("Reviews", "Coming soon!")}
        >
          <Text style={styles.seeReviews}>See all reviews →</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>⇥ Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE7D6",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 40,
    color: "#222",
  },
  profileSection: {
    alignItems: "center",
    marginTop: 18,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 50,
    backgroundColor: "#E9A6A0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 48,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  name: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#111",
  },
  verified: {
    backgroundColor: "#5BD65B",
    paddingHorizontal: 18,
    borderRadius: 15,
  },
  verifiedText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  matric: {
    fontWeight: "bold",
    color: "#555",
    marginTop: 3,
  },
  editButton: {
    backgroundColor: "#FF781F",
    width: "100%",
    padding: 12,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 14,
  },
  editText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    marginTop: 25,
  },
  reviewTitle: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#111",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  greyText: {
    color: "#AAA",
    fontSize: 12,
  },
  rating: {
    color: "#FF981F",
    fontSize: 16,
    fontWeight: "bold",
  },
  seeReviews: {
    color: "#FF781F",
    fontSize: 10,
    textAlign: "right",
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#DDD",
    marginVertical: 9,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reviewer: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#444",
  },
  stars: {
    color: "#FF981F",
    fontSize: 14,
  },
  date: {
    color: "#AAA",
    fontSize: 9,
    marginLeft: 18,
  },
  comment: {
    fontSize: 10,
    color: "#333",
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 22,
    marginBottom: 35,
  },
  logoutText: {
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
  },
});
