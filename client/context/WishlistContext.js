import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restore wishlist from AsyncStorage
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const stored = await AsyncStorage.getItem('@shopease_wishlist');
        if (stored) {
          setWishlistItems(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const saveWishlist = async (items) => {
    setWishlistItems(items);
    try {
      await AsyncStorage.setItem('@shopease_wishlist', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item._id || item.product) === productId);
  };

  const toggleWishlist = (product) => {
    const prodId = product._id || product.product;
    if (isInWishlist(prodId)) {
      const filtered = wishlistItems.filter(
        (item) => (item._id || item.product) !== prodId
      );
      saveWishlist(filtered);
      return false; // removed
    } else {
      const newItem = {
        _id: prodId,
        product: prodId,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        countInStock: product.countInStock,
        rating: product.rating,
      };
      saveWishlist([...wishlistItems, newItem]);
      return true; // added
    }
  };

  const removeFromWishlist = (productId) => {
    const filtered = wishlistItems.filter(
      (item) => (item._id || item.product) !== productId
    );
    saveWishlist(filtered);
  };

  const clearWishlist = async () => {
    setWishlistItems([]);
    try {
      await AsyncStorage.removeItem('@shopease_wishlist');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        totalWishlist: wishlistItems.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
