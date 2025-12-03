import React, { useMemo, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  Text,
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
  Pressable, // Ensure Pressable is imported
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";

// Define the width of the sliding sidebar
const SIDEBAR_WIDTH = 280;
const { width: screenWidth } = Dimensions.get("window");

interface AppHeaderProps {
  // Pass the required image source dynamically
  // Using the standard ImageSourcePropType which covers all needed source types
  logoSource: ImageSourcePropType;
  // An optional title to display if the logo isn't enough, or a secondary element
  children?: React.ReactNode;
}

// Helper Component for Sidebar Items - Defined outside AppHeader but before styles
const SidebarItem: React.FC<{
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.sidebarItem} onPress={onPress}>
    <Feather name={icon} size={18} color="#4b0082" style={styles.sidebarIcon} />
    <Text style={styles.sidebarLabel}>{label}</Text>
  </TouchableOpacity>
);

const AppHeader: React.FC<AppHeaderProps> = ({ logoSource, children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const headerPaddingTop = useMemo(() => {
    if (Platform.OS === "ios") return 60;
    // Android status bar height plus extra padding
    return (StatusBar.currentHeight || 24) + 24;
  }, []);

  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsMenuOpen(false));
  };

  const handleNavigation = (page: string) => {
    console.log(`Navigating to: ${page}`);
    closeMenu();
    // In a real project, you would use a navigation library here:
    // router.push(page);
  };

  return (
    <>
      <View style={[styles.headerContainer, { paddingTop: headerPaddingTop }]}>
        {/* Menu Button - Top Left */}
        <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
          <Feather name="menu" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Logo */}
        <Image
          source={logoSource}
          style={styles.titleLogo}
          resizeMode="contain"
        />
        {children}
      </View>

      {/* Sidebar Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop/Click outside to close */}
          <Pressable style={styles.backdrop} onPress={closeMenu} />

          {/* Animated Sidebar Panel */}
          <Animated.View
            style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
          >
            <SafeAreaView style={styles.sidebarContent}>
              {/* Profile Section (Always on top) */}
              <TouchableOpacity
                style={styles.profileSection}
                onPress={() => handleNavigation("/profile")}
              >
                <View style={styles.profileIcon}>
                  <Feather name="user" size={24} color="#fff" />
                </View>
                <Text style={styles.profileText}>My Profile</Text>
                <Feather name="chevron-right" size={20} color="#6c2eb9" />
              </TouchableOpacity>

              {/* Menu Divider */}
              <View style={styles.divider} />

              {/* Main Navigation Items (Placeholder list) */}
              <View style={styles.mainNav}>
                <SidebarItem
                  icon="home"
                  label="Dashboard"
                  onPress={() => handleNavigation("/")}
                />
                <SidebarItem
                  icon="clipboard"
                  label="Assessments"
                  onPress={() => handleNavigation("/test_management")}
                />
                <SidebarItem
                  icon="users"
                  label="User Management"
                  onPress={() => handleNavigation("/user_management")}
                />
              </View>

              {/* Spacer */}
              <View style={{ flex: 1 }} />

              {/* Bottom Menu Items */}
              <View>
                <SidebarItem
                  icon="settings"
                  label="Settings"
                  onPress={() => handleNavigation("/settings")}
                />
                <SidebarItem
                  icon="help-circle"
                  label="Help & Support"
                  onPress={() => handleNavigation("/help")}
                />
              </View>

              {/* Xebia Logo (Bottom) */}
              <View style={styles.xebiaLogoContainer}>
                <Text style={styles.poweredByText}>Powered By</Text>
                {/* Placeholder for Xebia Logo - replace with actual path if available */}
                <Image
                  source={{
                    uri: "https://placehold.co/100x30/FFFFFF/000?text=Xebia",
                  }}
                  style={styles.xebiaLogo}
                  resizeMode="contain"
                />
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    // Make the header fixed at the top
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it sits above the scrollview content
    backgroundColor: "#800080", // Purple background from your original style
    paddingBottom: 20, // Padding at the bottom of the content area
    alignItems: "center",
    justifyContent: "center",
    elevation: 8, // Higher elevation for shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    flexDirection: "row", // Align logo and menu button horizontally
    paddingHorizontal: 16,
  },
  menuButton: {
    position: "absolute",
    left: 16,
    bottom: 20,
    padding: 8,
    zIndex: 15,
  },
  titleLogo: {
    width: 280,
    height: 25,
    marginTop: 0,
  },

  // Modal & Sidebar Styles
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "#fff",
    zIndex: 20,
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sidebarContent: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  // Profile Section Styles
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f4ebff",
    borderWidth: 1,
    borderColor: "#e0d0ef",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#800080",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  profileText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4b0082",
    flex: 1,
  },

  // Menu Item Styles
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
  },
  mainNav: {
    marginBottom: 20,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 4,
    borderRadius: 10,
    // Note: React Native does not support CSS 'transition', but it remains for potential web compatibility
    // and is harmless for native builds.
  },
  sidebarIcon: {
    width: 30,
    marginRight: 10,
    textAlign: "center",
  },
  sidebarLabel: {
    fontSize: 15,
    color: "#32174d",
    fontWeight: "600",
  },

  // Xebia Logo Styles (Bottom)
  xebiaLogoContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  poweredByText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  xebiaLogo: {
    width: 100,
    height: 30,
  },
});

// Adding a dummy named export to assist module resolution in some environments
export { AppHeader };

export default AppHeader;
