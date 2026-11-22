import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import BackButton from "../components/BackButton";
import LogoutButton from "../components/LogoutButton";

type Application = {
  _id: string;
  userId: {
    name: string;
    email: string;
    matricNumber: string;
    phone: string;
  };
  vehicleModel: string;
  vehicleColor: string;
  plateNumber: string;
  licenseNumber: string;
  status: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const showMessage = (message: string) => {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("Admin Dashboard", message);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        showMessage("Please log in again.");
        return;
      }

      const response = await fetch(
        `${API_URL}/drivers/applications/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load applications.");
      }

      setApplications(data.applications || []);
    } catch (error: any) {
      showMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    router.replace("/login");
  };

  const handleDecision = async (
    applicationId: string,
    decision: "approve" | "reject"
  ) => {
    try {
      if (decision === "reject" && !remarks[applicationId]?.trim()) {
        showMessage("Please enter a rejection reason.");
        return;
      }

      setProcessing(applicationId);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/drivers/${applicationId}/${decision}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminRemarks: remarks[applicationId] || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Action failed.");
      }

      showMessage(data.message);

      setApplications((previous) =>
        previous.filter((item) => item._id !== applicationId)
      );
    } catch (error: any) {
      showMessage(error.message || "Something went wrong.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton />

        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          Manage student driver applications
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadApplications}
        >
          <Text style={styles.refreshText}>Refresh Applications</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          Pending Applications ({applications.length})
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#F59E0B" />
        ) : applications.length === 0 ? (
          <Text style={styles.emptyText}>
            No pending driver applications.
          </Text>
        ) : (
          applications.map((item) => (
            <View key={item._id} style={styles.card}>
              <Text style={styles.name}>
                {item.userId?.name || "Unknown Student"}
              </Text>

              <Text style={styles.detail}>
                Matric No: {item.userId?.matricNumber || "-"}
              </Text>
              <Text style={styles.detail}>
                Email: {item.userId?.email || "-"}
              </Text>
              <Text style={styles.detail}>
                Phone: {item.userId?.phone || "-"}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.vehicleTitle}>Vehicle Information</Text>
              <Text style={styles.detail}>
                Model: {item.vehicleModel}
              </Text>
              <Text style={styles.detail}>
                Color: {item.vehicleColor}
              </Text>
              <Text style={styles.detail}>
                Plate Number: {item.plateNumber}
              </Text>
              <Text style={styles.detail}>
                License Number: {item.licenseNumber}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Rejection reason (required to reject)"
                value={remarks[item._id] || ""}
                onChangeText={(value) =>
                  setRemarks((previous) => ({
                    ...previous,
                    [item._id]: value,
                  }))
                }
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.approveButton}
                  disabled={processing === item._id}
                  onPress={() => handleDecision(item._id, "approve")}
                >
                  <Text style={styles.buttonText}>
                    {processing === item._id ? "Processing..." : "Approve"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectButton}
                  disabled={processing === item._id}
                  onPress={() => handleDecision(item._id, "reject")}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <LogoutButton />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9ED",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#292524",
    marginTop: 20,
  },
  subtitle: {
    color: "#78716C",
    marginTop: 5,
  },
  refreshButton: {
    backgroundColor: "#F59E0B",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  refreshText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 15,
    color: "#292524",
  },
  emptyText: {
    textAlign: "center",
    color: "#78716C",
    marginTop: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F3E5C8",
  },
  name: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#292524",
    marginBottom: 10,
  },
  detail: {
    fontSize: 14,
    color: "#57534E",
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#E7E5E4",
    marginVertical: 15,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D6D3D1",
    borderRadius: 9,
    padding: 12,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#16A34A",
    padding: 13,
    borderRadius: 9,
    alignItems: "center",
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    padding: 13,
    borderRadius: 9,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  logoutButton: {
  backgroundColor: "#292524",
  padding: 12,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 10,
},

logoutText: {
  color: "#FFFFFF",
  fontWeight: "bold",
},
});
