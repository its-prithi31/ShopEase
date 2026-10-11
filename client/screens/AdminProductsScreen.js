import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Electronics', 'Fashion', 'Footwear', 'Home', 'Accessories'];

const AdminProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [image, setImage] = useState('');
  const [countInStock, setCountInStock] = useState('');

  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory(CATEGORIES[0]);
    setImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80');
    setCountInStock('10');
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category);
    setImage(product.image);
    setCountInStock(String(product.countInStock));
    setModalVisible(true);
  };

  const handleDelete = (id, productName) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(id);
              Alert.alert('Deleted', 'Product removed successfully.');
              fetchProducts();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleSaveProduct = async () => {
    if (!name.trim() || !description.trim() || !price || !countInStock) {
      Alert.alert('Validation Error', 'Please complete all required fields.');
      return;
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      Alert.alert('Validation Error', 'Price must be a valid non-negative number.');
      return;
    }

    if (isNaN(Number(countInStock)) || Number(countInStock) < 0) {
      Alert.alert('Validation Error', 'Stock count must be a non-negative number.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        image: image.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        countInStock: Number(countInStock),
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
        Alert.alert('Success', 'Product updated successfully.');
      } else {
        await productService.createProduct(payload);
        Alert.alert('Success', 'Product created successfully.');
      }

      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading catalog inventory..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Catalog Management</Text>
          <Text style={styles.subtitle}>{products.length} products available</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => fetchProducts(true)}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Image source={{ uri: item.image }} style={styles.thumb} />

            <View style={styles.info}>
              <Text style={styles.prodName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.prodMeta}>
                ${Number(item.price).toFixed(2)} • {item.category}
              </Text>
              <Text style={styles.prodStock}>
                Stock: {item.countInStock} units
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="pencil-outline" size={18} color="#2563EB" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item._id, item.name)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Product Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Wireless Headset"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Price ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 99.99"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Stock Count</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 20"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  value={countInStock}
                  onChangeText={setCountInStock}
                />
              </View>
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categorySelector}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catOption,
                    category === cat && styles.catOptionActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catOptionText,
                      category === cat && styles.catOptionActiveText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#94A3B8"
              value={image}
              onChangeText={setImage}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detailed description of features and specifications..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSaveProduct}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  prodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  prodMeta: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  prodStock: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  formRow: {
    flexDirection: 'row',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  catOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  catOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catOptionActiveText: {
    color: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AdminProductsScreen;
