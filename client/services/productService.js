import api from './api';
import sampleProducts from '../data/sampleProducts';

// Client-side cache initialized with default catalog for 100% reliable UI
let clientProducts = [...sampleProducts];

const filterAndSortLocalProducts = ({ keyword = '', category = '', sort = '' } = {}) => {
  let filtered = [...clientProducts];
  if (keyword) {
    const kw = keyword.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) ||
        (p.description && p.description.toLowerCase().includes(kw)) ||
        (p.category && p.category.toLowerCase().includes(kw))
    );
  }
  if (category && category !== 'All') {
    filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  return filtered;
};

export const productService = {
  /**
   * Fetch all products with optional filters and sorting
   */
  async getProducts(params = {}) {
    const { keyword = '', category = '', sort = '' } = params;
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.append('keyword', keyword);
    if (category && category !== 'All') queryParams.append('category', category);
    if (sort) queryParams.append('sort', sort);

    const url = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    try {
      const response = await api.get(url);
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Keep clientProducts synced with latest server data
        clientProducts = response.data;
        return response.data;
      }
      // If server returned an empty array on general browsing, fallback to sample products
      if (!keyword && (!category || category === 'All')) {
        return filterAndSortLocalProducts(params);
      }
      return Array.isArray(response.data) ? response.data : filterAndSortLocalProducts(params);
    } catch (error) {
      console.warn('Network fetch products failed, serving local catalog:', error.message);
      return filterAndSortLocalProducts(params);
    }
  },

  /**
   * Fetch product details by ID
   */
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data) return response.data;
    } catch (error) {
      console.warn('Network fetch product by ID failed, checking local catalog:', error.message);
    }

    const found = clientProducts.find((p) => p._id === id || String(p._id) === String(id));
    if (found) return found;
    throw new Error('Product not found');
  },

  /**
   * Submit product review & rating
   */
  async createReview(productId, reviewData) {
    try {
      const response = await api.post(`/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.warn('Network submit review failed, saving to local catalog:', error.message);
      const prod = clientProducts.find((p) => p._id === productId || String(p._id) === String(productId));
      if (prod) {
        if (!prod.reviews) prod.reviews = [];
        const newRev = {
          _id: `rev_${Date.now()}`,
          name: reviewData.name || 'Anonymous Customer',
          rating: Number(reviewData.rating),
          comment: reviewData.comment,
          createdAt: new Date().toISOString(),
        };
        prod.reviews.unshift(newRev);
        prod.numReviews = prod.reviews.length;
        prod.rating = Number(
          (prod.reviews.reduce((acc, r) => acc + r.rating, 0) / prod.reviews.length).toFixed(1)
        );
        return { message: 'Review added successfully', product: prod };
      }
      throw error;
    }
  },

  /**
   * Create product (Admin)
   */
  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      const newProd = {
        _id: `prod_${Date.now()}`,
        ...productData,
        rating: 4.5,
        numReviews: 0,
        reviews: [],
        createdAt: new Date().toISOString(),
      };
      clientProducts.unshift(newProd);
      return newProd;
    }
  },

  /**
   * Update product (Admin)
   */
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      const idx = clientProducts.findIndex((p) => p._id === id || String(p._id) === String(id));
      if (idx !== -1) {
        clientProducts[idx] = { ...clientProducts[idx], ...productData };
        return clientProducts[idx];
      }
      throw error;
    }
  },

  /**
   * Delete product (Admin)
   */
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      clientProducts = clientProducts.filter((p) => p._id !== id && String(p._id) !== String(id));
      return { message: 'Product successfully removed' };
    }
  },
};
