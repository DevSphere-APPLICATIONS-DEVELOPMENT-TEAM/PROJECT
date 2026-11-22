import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { API_URL } from "../constants/api";

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }; 
  const handleLogin = async () => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage("Login Failed", data.message || "Invalid email or password.");
        return;
      }

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      
      // Navigate according to account role
      if (data.user.role === "admin") {
        router.replace("/admin-dashboard");
      } else {
        router.replace("/dashboard");
      }

    } catch (error) {
      showMessage("Connection Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Login Here</Text>
          <Text style={styles.subtitle}>Welcome Back!</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#B8A99F"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && (
            <Text style={{ color: "red", fontSize: 11, marginTop: 4 }}>
              {errors.email}
            </Text>
          )}

          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordBox}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#B8A99F"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eye}>
                {showPassword ? "◎" : "◉"}
              </Text>
            </TouchableOpacity>
          </View>
          
          {errors.password && (
              <Text style={{ color: "red", fontSize: 11, marginTop: 4 }}>
                {errors.password}
              </Text>
            )}

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Log In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/register")}
          >
            <Text style={styles.footerLink}>Register</Text>
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
  },
  passwordBox: {
    height: 43,
    borderRadius: 9,
    paddingHorizontal: 12,
    backgroundColor: "#FFF4EC",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    color: "#24201D",
    fontSize: 12,
  },
  eye: {
    color: "#82766F",
    fontSize: 17,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 15,
    marginBottom: 14,
  },
  forgotText: {
    color: "#FF781F",
    fontSize: 11,
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
