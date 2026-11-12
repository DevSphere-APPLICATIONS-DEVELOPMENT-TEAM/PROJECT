
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function LogoutButton() {
  const router = useRouter();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const confirmLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "token",
        "user",
        "profileImage",
      ]);

      setLogoutModalVisible(false);
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setLogoutModalVisible(true)}
      >
        <Text style={styles.logoutText}>⇥  Log Out</Text>
      </TouchableOpacity>

      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>⇥</Text>
            </View>

            <Text style={styles.modalTitle}>Log Out?</Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to log out of your RYDE account?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmText}>Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "#FFD5CE",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
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
