import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Footwear', 'Home', 'Accessories'];

const SearchBar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onClear,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search products..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, isSelected && styles.activePill]}
              onPress={() => onSelectCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.activeCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  clearButton: {
    padding: 4,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activePill: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  activeCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SearchBar;
