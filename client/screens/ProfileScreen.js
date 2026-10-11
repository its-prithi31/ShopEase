import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import { BASE_API_URL } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { totalWishlist } = useContext(WishlistContext);

  const [apiUrl, setApiUrl] = useState(BASE_API_URL);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  useEffect(() => {
    const loadCustomUrl = async () => {
      const stored = await AsyncStorage.getItem('@shopease_custom_api_url');
      if (stored) setApiUrl(stored);
      else setApiUrl(BASE_API_URL);
    };
    loadCustomUrl();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of ShopEase?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSaveApiUrl = async () => {
    if (!tempUrl.trim()) {
      await AsyncStorage.removeItem('@shopease_custom_api_url');
      setApiUrl(BASE_API_URL);
    } else {
      await AsyncStorage.setItem('@shopease_custom_api_url', tempUrl.trim());
      setApiUrl(tempUrl.trim());
    }
    setModalVisible(false);
    Alert.alert('Success', 'API URL updated successfully.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>

          <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@shopease.com'}</Text>

          <View
            style={[
              styles.roleBadge,
              isAdmin ? styles.adminBadge : styles.customerBadge,
            ]}
          >
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={14}
              color={isAdmin ? '#B45309' : '#1D4ED8'}
            />
            <Text
              style={[
                styles.roleText,
                isAdmin ? styles.adminText : styles.customerText,
              ]}
            >
              {isAdmin ? 'Store Administrator' : 'Standard Customer'}
            </Text>
          </View>
        </View>

        {/* Admin Tools (Visible only to Admin users) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Admin Management</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AdminProducts')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="cube-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Manage Catalog Products</Text>
                <Text style={styles.menuSubtitle}>Add, update or remove store items</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AdminOrders')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="clipboard-outline" size={20} color="#D97706" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Manage All Orders</Text>
                <Text style={styles.menuSubtitle}>Update delivery & payment statuses</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account & Orders</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Wishlist')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="heart" size={20} color="#EF4444" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Wishlist</Text>
              <Text style={styles.menuSubtitle}>
                {totalWishlist} {totalWishlist === 1 ? 'item' : 'items'} saved for later
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="receipt-outline" size={20} color="#475569" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>My Order History</Text>
              <Text style={styles.menuSubtitle}>Track recent shipments & purchases</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setTempUrl(apiUrl);
              setModalVisible(true);
            }}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="server-outline" size={20} color="#475569" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Server Network Endpoint</Text>
              <Text style={styles.menuSubtitle} numberOfLines={1}>{apiUrl}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Network Config Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Configure API URL</Text>
            <Text style={styles.modalDescription}>
              If testing on a physical phone via Expo Go, enter your PC's local IP address (e.g. http://10.66.106.119:5000/api):
            </Text>

            <TextInput
              style={styles.modalInput}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="http://192.168.1.X:5000/api"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveApiUrl}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  adminBadge: {
    backgroundColor: '#FEF3C7',
  },
  customerBadge: {
    backgroundColor: '#EFF6FF',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  adminText: {
    color: '#92400E',
  },
  customerText: {
    color: '#1D4ED8',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 18,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ProfileScreen;
