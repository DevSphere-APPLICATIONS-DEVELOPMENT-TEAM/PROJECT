
import React from "react";
import { Text, StyleSheet, View } from "react-native";

type ActionMessageProps = {
  message: string;
  type?: "success" | "error" | "info";
};

export default function ActionMessage({
  message,
  type = "success",
}: ActionMessageProps) {
  if (!message) return null;

  return (
    <View>
      <Text
        style={[
          styles.message,
          type === "success" && styles.success,
          type === "error" && styles.error,
          type === "info" && styles.info,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 11,
    marginTop: 8,
    lineHeight: 16,
  },
  success: {
    color: "#16834A",
  },
  error: {
    color: "#DC2626",
  },
  info: {
    color: "#D97706",
  },
});
