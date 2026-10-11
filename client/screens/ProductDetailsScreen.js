import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { addToCart } = useContext(CartContext);
  const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => {
    if (product && qty < product.countInStock) {
      setQty(qty + 1);
    }
  };

  const handleDecrement = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.countInStock <= 0) return;

    addToCart(product, qty);
    Alert.alert(
      'Success',
      `Added ${qty} ${qty === 1 ? 'item' : 'items'} to your cart!`,
      [
        { text: 'Keep Shopping', style: 'cancel' },
        { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') },
      ]
    );
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const added = toggleWishlist(product);
    Alert.alert(
      added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      added
        ? `${product.name} has been added to your wishlist.`
        : `${product.name} has been removed from your wishlist.`
    );
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Comment Required', 'Please enter your thoughts in the review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await productService.createReview(product._id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (res.product) {
        setProduct(res.product);
      } else {
        await loadProduct();
      }

      setReviewComment('');
      setReviewRating(5);
      Alert.alert('🎉 Review Submitted', 'Thank you! Your verified customer review has been recorded.');
    } catch (error) {
      Alert.alert('Review Failed', error.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (!product) {
    return null;
  }

  const isOutOfStock = product.countInStock <= 0;
  const isFavorite = isInWishlist(product._id);
  const reviews = product.reviews || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{product.category}</Text>
          </View>

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.floatingWishlistBtn}
            onPress={handleToggleWishlist}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#EF4444' : '#1E293B'}
            />
          </TouchableOpacity>
        </View>

        {/* Content Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.ratingStockRow}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>{product.rating || '4.5'}</Text>
              <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
            </View>

            <View
              style={[
                styles.stockBadge,
                isOutOfStock ? styles.outOfStockBadge : styles.inStockBadge,
              ]}
            >
              <Text
                style={[
                  styles.stockBadgeText,
                  isOutOfStock ? styles.outOfStockText : styles.inStockText,
                ]}
              >
                {isOutOfStock ? 'Out of Stock' : `${product.countInStock} In Stock`}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Quantity Selector if in stock */}
          {!isOutOfStock && (
            <View style={styles.qtySection}>
              <Text style={styles.sectionTitle}>Select Quantity</Text>
              <View style={styles.qtySelector}>
                <TouchableOpacity
                  style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}
                  onPress={handleDecrement}
                  disabled={qty <= 1}
                >
                  <Ionicons name="remove" size={18} color={qty <= 1 ? '#CBD5E1' : '#1E293B'} />
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{qty}</Text>

                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    qty >= product.countInStock && styles.qtyBtnDisabled,
                  ]}
                  onPress={handleIncrement}
                  disabled={qty >= product.countInStock}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={qty >= product.countInStock ? '#CBD5E1' : '#1E293B'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Customer Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <Text style={styles.sectionTitle}>Customer Reviews ({reviews.length})</Text>
              <View style={styles.reviewScorePill}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.reviewScorePillText}>{product.rating} / 5</Text>
              </View>
            </View>

            {/* List Existing Reviews */}
            {reviews.length === 0 ? (
              <Text style={styles.noReviewsText}>
                No reviews yet. Be the first to share your experience!
              </Text>
            ) : (
              reviews.map((rev, index) => (
                <View key={rev._id || index} style={styles.reviewCard}>
                  <View style={styles.reviewerTopRow}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarLetter}>
                          {(rev.name || 'U').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewerName}>{rev.name}</Text>
                        <Text style={styles.reviewDate}>{formatDate(rev.createdAt)}</Text>
                      </View>
                    </View>

                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= Math.round(rev.rating) ? 'star' : 'star-outline'}
                          size={14}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))
            )}

            {/* Add Review Form */}
            <View style={styles.writeReviewCard}>
              <Text style={styles.writeReviewTitle}>✍️ Write a Review</Text>
              <Text style={styles.writeReviewSubtitle}>
                Rate this product and share your feedback with other shoppers
              </Text>

              {/* Star Rating Picker */}
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewRating(star)}
                    style={styles.starPickerBtn}
                  >
                    <Ionicons
                      name={star <= reviewRating ? 'star' : 'star-outline'}
                      size={28}
                      color="#F59E0B"
                    />
                  </TouchableOpacity>
                ))}
                <Text style={styles.starRatingLabel}>{reviewRating} of 5 Stars</Text>
              </View>

              {/* Comment Input */}
              <TextInput
                style={styles.commentInput}
                placeholder="What did you like or dislike about this product? How is the quality?"
                placeholderTextColor="#94A3B8"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[
                  styles.submitReviewBtn,
                  submittingReview && styles.submitReviewBtnDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
                activeOpacity={0.8}
              >
                {submittingReview ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitReviewBtnText}>Submit Customer Review</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout/Add-to-cart Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalPrice}>
            ${(Number(product.price) * qty).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addToCartButton, isOutOfStock && styles.addToCartDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          activeOpacity={0.8}
        >
          <Ionicons name="bag-check-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.addToCartText}>
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  floatingWishlistBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  detailsContainer: {
    padding: 20,
  },
  ratingStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  reviewCount: {
    fontSize: 13,
    color: '#64748B',
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inStockBadge: {
    backgroundColor: '#DCFCE7',
  },
  outOfStockBadge: {
    backgroundColor: '#FEE2E2',
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inStockText: {
    color: '#166534',
  },
  outOfStockText: {
    color: '#991B1B',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  qtySection: {
    marginTop: 18,
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  qtyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 16,
  },
  reviewsSection: {
    marginTop: 4,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reviewScorePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  noReviewsText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  reviewDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  writeReviewCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  writeReviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  writeReviewSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  starPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  starPickerBtn: {
    padding: 2,
  },
  starRatingLabel: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  submitReviewBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitReviewBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  subtotalLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  subtotalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  addToCartButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addToCartDisabled: {
    backgroundColor: '#94A3B8',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProductDetailsScreen;
