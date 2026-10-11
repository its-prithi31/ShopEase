import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminProductsScreen from '../screens/AdminProductsScreen';
import AdminOrdersScreen from '../screens/AdminOrdersScreen';
import WishlistScreen from '../screens/WishlistScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for primary app views
const MainTabNavigator = () => {
  const { totalQty } = useContext(CartContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: '#0F172A',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'ShopEase' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'My Cart',
          tabBarBadge: totalQty > 0 ? totalQty : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#2563EB',
            fontSize: 11,
            fontWeight: '700',
          },
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#0F172A',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          headerBackTitleVisible: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // App Stack
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{ title: 'Product Details' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ title: 'Checkout & Delivery' }}
            />
            <Stack.Screen
              name="Wishlist"
              component={WishlistScreen}
              options={{ title: 'My Wishlist' }}
            />
            <Stack.Screen
              name="AdminProducts"
              component={AdminProductsScreen}
              options={{ title: 'Catalog Management' }}
            />
            <Stack.Screen
              name="AdminOrders"
              component={AdminOrdersScreen}
              options={{ title: 'All Customer Orders' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
