import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleReset = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    // Backend reset API will be connected later.
    Alert.alert("Success", "If this email is registered, a reset link will be sent.");
    
    // Optional: send user back to login after success
    // router.push("/login");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>We'll send you a recovery link</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your registered email"
            placeholderTextColor="#B8A99F"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleReset}
          >
            <Text style={styles.primaryButtonText}>
              Send Reset Link
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Remembered your password?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE7D6",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 29,
    paddingTop: 125,
    paddingBottom: 42,
  },
  heading: {
    alignItems: "center",
    marginBottom: 92,
  },
  title: {
    color: "#FF781F",
    fontSize: 28,
    fontWeight: "600",
  },
  subtitle: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#29211D",
    fontSize: 11,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    height: 43,
    borderRadius: 9,
    paddingHorizontal: 12,
    backgroundColor: "#FFF4EC",
    color: "#24201D",
    fontSize: 12,
    marginBottom: 24, // Added spacing before the button
  },
  primaryButton: {
    height: 43,
    borderRadius: 8,
    backgroundColor: "#FF781F",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 90,
  },
  footerText: {
    color: "#51443D",
    fontSize: 11,
  },
  footerLink: {
    color: "#FF781F",
    fontSize: 11,
    fontWeight: "600",
  },
});