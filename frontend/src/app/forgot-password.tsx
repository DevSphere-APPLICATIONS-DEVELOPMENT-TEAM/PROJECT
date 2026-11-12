
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import ActionMessage from "../components/ActionMessage";
import {
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "../services/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [actionMessage, setActionMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("success");

  const [resendCountdown, setResendCountdown] = useState(0);

  // Resend OTP countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const showMessage = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setActionMessage(message);
    setMessageType(type);
  };

  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!email.trim()) {
      showMessage("Please enter your email address.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);
    setActionMessage("");

    try {
      const data = await forgotPassword(email.trim());

      setStep(2);
      setOtp("");
      setResendCountdown(50);

      showMessage(
        data.message || "OTP sent successfully! Check your email.",
        "success"
      );
    } catch (error: any) {
      showMessage(
        error.message || "Unable to send OTP. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      showMessage("Please enter the verification code.", "error");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      showMessage("Please enter a valid 6-digit OTP.", "error");
      return;
    }

    setLoading(true);
    setActionMessage("");

    try {
      const data = await verifyResetOTP(email.trim(), otp.trim());

      setStep(3);

      showMessage(
        data.message || "OTP verified successfully!",
        "success"
      );
    } catch (error: any) {
      showMessage(
        error.message || "Invalid OTP. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCountdown > 0 || loading) return;

    setLoading(true);
    setActionMessage("");

    try {
      const data = await forgotPassword(email.trim());

      setOtp("");
      setResendCountdown(50);

      showMessage(
        data.message || "A new OTP has been sent to your email.",
        "success"
      );
    } catch (error: any) {
      showMessage(
        error.message || "Unable to resend OTP. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword) {
      showMessage("Please enter your new password.", "error");
      return;
    }

    if (newPassword.length < 8) {
      showMessage(
        "Password must be at least 8 characters.",
        "error"
      );
      return;
    }

    if (!confirmPassword) {
      showMessage("Please confirm your password.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    setActionMessage("");

    try {
      const data = await resetPassword(email.trim(), newPassword);

      showMessage(
        data.message || "Your password has been changed successfully!",
        "success"
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1800);
    } catch (error: any) {
      showMessage(
        error.message || "Unable to reset password. Please try again.",
        "error"
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
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (step === 1) {
              router.back();
            } else {
              setStep(step - 1);
              setActionMessage("");
            }
          }}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        {/* Heading */}
        <View style={styles.heading}>
          <Text style={styles.title}>Forgot Password?</Text>

          <Text style={styles.subtitle}>
            {step === 1 &&
              "Enter your email to receive a verification code."}

            {step === 2 &&
              "Enter the 6-digit OTP sent to your email."}

            {step === 3 &&
              "Create a new password for your account."}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.steps}>
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={[
                styles.stepCircle,
                step >= item && styles.activeStep,
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  step >= item && styles.activeStepNumber,
                ]}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.form}>

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <>
              <Text style={styles.label}>Email Address</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your registered email"
                placeholderTextColor="#B8A99F"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setActionMessage("");
                }}
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Send OTP
                  </Text>
                )}
              </TouchableOpacity>

              <ActionMessage
                message={actionMessage}
                type={messageType}
              />
            </>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <>
              <Text style={styles.label}>Verification Code</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#B8A99F"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(value) => {
                  setOtp(value);
                  setActionMessage("");
                }}
              />

              <ActionMessage
                message={actionMessage}
                type={messageType}
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Verify OTP
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendLabel}>
                  Didn't receive the code?
                </Text>

                {resendCountdown > 0 ? (
                  <Text style={styles.countdown}>
                    Resend in {resendCountdown}s
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={loading}
                  >
                    <Text style={styles.resendText}>
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <>
              <Text style={styles.label}>New Password</Text>

              <View style={styles.passwordBox}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#B8A99F"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    setActionMessage("");
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

              <Text style={styles.label}>Confirm Password</Text>

            <View style={styles.passwordBox}>
            <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                placeholderTextColor="#B8A99F"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={(value) => {
                setConfirmPassword(value);
                setActionMessage("");
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

              <Text style={styles.passwordHint}>
                Password must contain at least 8 characters.
              </Text>

              <ActionMessage
                message={actionMessage}
                type={messageType}
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
    paddingTop: 65,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 45,
  },
  backText: {
    color: "#FF781F",
    fontSize: 16,
    fontWeight: "600",
  },
  heading: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    color: "#FF781F",
    fontSize: 27,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "#51443D",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
  steps: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 35,
    marginBottom: 35,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#D6B9A7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4EC",
  },
  activeStep: {
    backgroundColor: "#FF781F",
    borderColor: "#FF781F",
  },
  stepNumber: {
    color: "#82766F",
    fontSize: 12,
    fontWeight: "600",
  },
  activeStepNumber: {
    color: "#FFFFFF",
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#29211D",
    fontSize: 12,
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    height: 45,
    borderRadius: 9,
    paddingHorizontal: 12,
    backgroundColor: "#FFF4EC",
    color: "#24201D",
    fontSize: 13,
  },
  passwordBox: {
    height: 45,
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
    fontSize: 13,
  },
  eye: {
    color: "#82766F",
    fontSize: 17,
  },
  passwordHint: {
    color: "#82766F",
    fontSize: 10,
    marginTop: 8,
  },
  primaryButton: {
    height: 45,
    borderRadius: 8,
    backgroundColor: "#FF781F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 22,
    gap: 5,
  },
  resendLabel: {
    color: "#51443D",
    fontSize: 11,
  },
  countdown: {
    color: "#82766F",
    fontSize: 11,
    fontWeight: "600",
  },
  resendText: {
    color: "#FF781F",
    fontSize: 11,
    fontWeight: "700",
  },
});
