import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import EmptyState from '../components/EmptyState';

const WishlistScreen = ({ navigation }) => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const handleMoveToCart = (item) => {
    if (item.countInStock <= 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }
    addToCart(item, 1);
    removeFromWishlist(item._id || item.product);
    Alert.alert(
      'Moved to Cart',
      `${item.name} has been moved from your wishlist to your cart!`,
      [
        { text: 'Keep Browsing', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]
    );
  };

  const handleClearWishlist = () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all saved items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearWishlist },
      ]
    );
  };

  if (wishlistItems.length === 0) {
    return (
      <EmptyState
        icon="heart-outline"
        title="Your Wishlist is Empty"
        message="Explore products and tap the heart icon to save items you love for later!"
        buttonText="Discover Products"
        onPress={() => navigation.navigate('Home')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item._id || item.product}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>
              Saved Items ({wishlistItems.length})
            </Text>
            <TouchableOpacity onPress={handleClearWishlist}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const isOutOfStock = item.countInStock <= 0;

          return (
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ProductDetails', {
                    productId: item._id || item.product,
                  })
                }
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
              </TouchableOpacity>

              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromWishlist(item._id || item.product)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.stockTag,
                      isOutOfStock ? styles.outStockTag : styles.inStockTag,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockTagText,
                        isOutOfStock ? styles.outStockText : styles.inStockText,
                      ]}
                    >
                      {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.moveCartBtn, isOutOfStock && styles.moveCartBtnDisabled]}
                  onPress={() => handleMoveToCart(item)}
                  disabled={isOutOfStock}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="cart-outline"
                    size={16}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.moveCartBtnText}>
                    {isOutOfStock ? 'Unavailable' : 'Move to Cart'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  removeBtn: {
    padding: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
    marginVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inStockTag: {
    backgroundColor: '#DCFCE7',
  },
  outStockTag: {
    backgroundColor: '#FEE2E2',
  },
  stockTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inStockText: {
    color: '#166534',
  },
  outStockText: {
    color: '#991B1B',
  },
  moveCartBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  moveCartBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  moveCartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default WishlistScreen;
