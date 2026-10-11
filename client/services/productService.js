import api from './api';

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
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch product details by ID
   */
  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Submit product review & rating
   */
  async createReview(productId, reviewData) {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Create product (Admin)
   */
  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  /**
   * Update product (Admin)
   */
  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete product (Admin)
   */
  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
