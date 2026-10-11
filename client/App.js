import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
