import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";

export default function BackButton() {
  const router = useRouter();
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile");
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleBack}
    >
      <Text style={styles.arrow}>‹</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 32,
    color: "#FF781F",
    lineHeight: 36,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    marginTop: -8,
    marginLeft: -2,
  },
});