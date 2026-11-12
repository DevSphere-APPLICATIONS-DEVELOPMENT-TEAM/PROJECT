
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
import { API_URL } from "../constants/api";
import ActionMessage from "../components/ActionMessage";

type FormErrors = {
  name?: string;
  matricNumber?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [actionMessage, setActionMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("success");

  const showFieldError = (field: keyof FormErrors, message?: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  };

  const handleRegister = async () => {
    const newErrors: FormErrors = {};

    // Validate full name
    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    }

    // Validate matric number
    if (!matricNumber.trim()) {
      newErrors.matricNumber = "Matric number is required.";
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Validate phone
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          matricNumber: matricNumber.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      });

      const data: { message?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const message = data.message || "Registration failed.";

        if (
          message.toLowerCase().includes("already") ||
          message.toLowerCase().includes("email")
        ) {
          showFieldError("email", message);
        } else {
          showFieldError("form", message);
        }

        return;
      }

      setActionMessage("Account created successfully!");
      setMessageType("success");

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error) {
      showFieldError(
        "form",
        "Unable to connect to the server. Please check your connection."
      );
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Create an account so you can{"\n"}
            explore all the features
          </Text>
        </View>

        <View style={styles.form}>
          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter your full name"
            placeholderTextColor="#B8A99F"
            value={name}
            onChangeText={(value) => {
              setName(value);
              showFieldError("name");
            }}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}

          {/* Matric Number */}
          <Text style={styles.label}>Matric Number</Text>
          <TextInput
            style={[
              styles.input,
              errors.matricNumber && styles.inputError,
            ]}
            placeholder="Enter your matric number"
            placeholderTextColor="#B8A99F"
            autoCapitalize="characters"
            value={matricNumber}
            onChangeText={(value) => {
              setMatricNumber(value);
              showFieldError("matricNumber");
            }}
          />
          {errors.matricNumber && (
            <Text style={styles.errorText}>{errors.matricNumber}</Text>
          )}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your email"
            placeholderTextColor="#B8A99F"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              showFieldError("email");
            }}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          {/* Phone Number */}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Enter your phone number"
            placeholderTextColor="#B8A99F"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              showFieldError("phone");
            }}
          />
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View
            style={[
              styles.passwordBox,
              errors.password && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#B8A99F"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                showFieldError("password");
              }}
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
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View
            style={[
              styles.passwordBox,
              errors.confirmPassword && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              placeholderTextColor="#B8A99F"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                showFieldError("confirmPassword");
              }}
            />
            <TouchableOpacity
              onPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              <Text style={styles.eye}>
                {showConfirmPassword ? "◎" : "◉"}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>
              {errors.confirmPassword}
            </Text>
          )}

          {/* Backend Error */}
          {errors.form && (
            <Text style={styles.errorText}>{errors.form}</Text>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && { opacity: 0.6 },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <ActionMessage
            message={actionMessage}
            type={messageType}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.footerLink}>Login</Text>
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
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 42,
  },
  heading: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: "#FF781F",
    fontSize: 28,
    fontWeight: "600",
  },
  subtitle: {
    color: "#29211D",
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 2,
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#29211D",
    fontSize: 11,
    marginBottom: 8,
    marginTop: 13,
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
  inputError: {
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 10,
    marginTop: 5,
    marginLeft: 2,
  },
  primaryButton: {
    height: 43,
    borderRadius: 8,
    backgroundColor: "#FF781F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 43,
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
    paddingTop: 50,
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
