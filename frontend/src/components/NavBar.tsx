import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

type Tab = {
  key: string; 
  label: string;
  icon: string;
  route?: string; 
  soonName?: string; 
};

const TABS: Tab[] = [
  { key: "home", label: "Home", icon: "⌂", route: "/dashboard" },
  { key: "activity", label: "Activity", icon: "◷", soonName: "Search" },
  { key: "publish", label: "Publish", icon: "＋", route: "/publish-ride" },
  { key: "messages", label: "Messages", icon: "✉", soonName: "Messages" },
  { key: "profile", label: "Profile", icon: "☻", route: "/profile" },
];

export default function NavBar({ active }: { active: string }) {
  const router = useRouter();

  const comingSoon = (feature: string) => {
    Alert.alert(feature, "This feature will be available in Sprint 2.");
  };

  return (
    <View style={styles.bottomNav}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => {
              if (tab.route) {
                if (!isActive) router.push(tab.route as any);
              } else {
                comingSoon(tab.soonName || tab.label);
              }
            }}
          >
            <Text
              style={[
                isActive ? styles.navIconActive : styles.navIcon,
                !isActive && { opacity: 0.6 },
              ]}
            >
              {tab.icon}
            </Text>
            <Text style={isActive ? styles.navTextActive : styles.navText}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  navItem: {
    alignItems: "center",
    flex: 1,
  },

  navIcon: {
    fontSize: 22,
    height: 28,
    lineHeight: 28,
    textAlign: "center",
    color: "#888",
 },
 navIconActive: {
    fontSize: 22,
    height: 28,
    lineHeight: 28,
    textAlign: "center",
    color: "#F28A24",
 },

  navText: {
    fontSize: 13,
    color: "#888",
    marginTop: 3,
  },

  navTextActive: {
    fontSize: 13,
    color: "#F28A24",
    fontWeight: "bold",
    marginTop: 3,
  },
});
