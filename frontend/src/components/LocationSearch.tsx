
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { API_URL } from "../constants/api";

export interface LocationResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onSelect: (location: LocationResult) => void;
}

export default function LocationSearch({
  label,
  value,
  placeholder,
  onChangeText,
  onSelect,
}: LocationSearchProps) {
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/locations/search?q=${encodeURIComponent(value.trim())}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Search failed");
        }

        if (active) {
          setSuggestions(data.locations || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        if (active) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [value]);

  const handleSelect = (location: LocationResult) => {
    onSelect(location);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onChangeText={(text) => {
            onChangeText(text);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (value.trim().length >= 2) {
              setShowSuggestions(true);
            }
          }}
        />

        {loading && (
          <ActivityIndicator size="small" color="#F28A24" />
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) =>
              `${item.latitude}-${item.longitude}-${index}`
            }
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.locationName}>
                  {item.name}
                </Text>

                <Text style={styles.locationAddress}>
                  {item.address}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    zIndex: 100,
    elevation: 20,
    position: "relative",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 14,
    color: "#333",
  },
  suggestionContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    maxHeight: 220,
    overflow: "hidden",
    elevation: 4,
  },
  suggestionItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  locationName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  locationAddress: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
});
