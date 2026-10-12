import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const SORT_OPTIONS = [
  { id: 'newest', label: '🔥 Newest' },
  { id: 'price-asc', label: '💲 Price: Low to High' },
  { id: 'price-desc', label: '💎 Price: High to Low' },
  { id: 'rating', label: '⭐ Top Rated' },
];

const HomeScreen = ({ navigation }) => {
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest');

  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await productService.getProducts({
        keyword: searchQuery,
        category: selectedCategory,
        sort: selectedSort,
      });
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      Alert.alert('Error', error.message || 'Unable to load products from server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory, selectedSort]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts();
    }, 250); // slight debounce for search input

    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    Alert.alert('Added to Cart', `${product.name} has been added to your shopping cart.`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSort('newest');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar & Category Pills */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClear={handleClearSearch}
      />

      {/* Product Sort Chips Bar */}
      <View style={styles.sortBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContent}
        >
          <Text style={styles.sortLabel}>Sort By:</Text>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = selectedSort === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortChip, isSelected && styles.sortChipActive]}
                onPress={() => setSelectedSort(opt.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.sortChipText, isSelected && styles.sortChipTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      {loading ? (
        <LoadingSpinner message="Fetching ShopEase products..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Products Found"
          message="We couldn't find any products matching your current filters."
          buttonText="Reset Filters"
          onPress={handleClearSearch}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchProducts(true)}
              colors={['#2563EB']}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerInfo}>
              <Text style={styles.resultCount}>
                Showing {products.length} {products.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetails', { productId: item._id })
              }
              onAddToCart={handleAddToCart}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  sortBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  sortContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 2,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  headerInfo: {
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default HomeScreen;
