// Backend API Client for NestJS Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper to make authenticated requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth API
export const auth = {
  async signup(email, username, password) {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  async login(emailOrUsername, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  async getMe() {
    return apiRequest('/auth/me');
  },

  logout() {
    localStorage.removeItem('authToken');
  },
};

// Relationships API
export const relationships = {
  async follow(userId) {
    return apiRequest(`/users/${userId}/follow`, { method: 'POST' });
  },

  async getFollowers(userId) {
    return apiRequest(`/users/${userId}/followers`);
  },

  async getFollowing(userId) {
    return apiRequest(`/users/${userId}/following`);
  },

  async sendFriendRequest(userId) {
    return apiRequest(`/users/${userId}/friend-requests`, { method: 'POST' });
  },

  async acceptFriendRequest(requestId) {
    return apiRequest(`/friend-requests/${requestId}/accept`, { method: 'POST' });
  },

  async declineFriendRequest(requestId) {
    return apiRequest(`/friend-requests/${requestId}/decline`, { method: 'POST' });
  },

  async getFriends(userId) {
    return apiRequest(`/users/${userId}/friends`);
  },

  async getPendingRequests() {
    return apiRequest('/friend-requests/pending');
  },
};

// Subscriptions API
export const subscriptions = {
  async createCheckout(creatorId, tier = 'PREMIUM_1000', priceCents = 100000) {
    return apiRequest(`/users/${creatorId}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify({ tier, priceCents }),
    });
  },

  async getStatus(creatorId) {
    return apiRequest(`/users/${creatorId}/subscriptions/me`);
  },

  async getMySubscriptions() {
    return apiRequest('/subscriptions/me');
  },

  async getMySubscribers() {
    return apiRequest('/subscriptions/subscribers');
  },

  async cancel(creatorId) {
    return apiRequest(`/users/${creatorId}/subscriptions`, { method: 'DELETE' });
  },
};

// Posts API
export const posts = {
  async create(postData) {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  async getFeed(limit = 50, offset = 0) {
    return apiRequest(`/posts/feed?limit=${limit}&offset=${offset}`);
  },

  async getPost(postId) {
    return apiRequest(`/posts/${postId}`);
  },

  async getUserPosts(userId, limit = 20, offset = 0) {
    return apiRequest(`/posts/user/${userId}?limit=${limit}&offset=${offset}`);
  },

  async like(postId) {
    return apiRequest(`/posts/${postId}/like`, { method: 'POST' });
  },

  async delete(postId) {
    return apiRequest(`/posts/${postId}`, { method: 'DELETE' });
  },
};

// Stats API
export const stats = {
  async getUserStats(userId) {
    return apiRequest(`/stats/users/${userId}`);
  },

  async getRevenueStats(userId) {
    return apiRequest(`/stats/users/${userId}/revenue`);
  },

  async getDashboardStats() {
    return apiRequest('/stats/dashboard');
  },
};

// Default export with all modules
const api = {
  auth,
  relationships,
  subscriptions,
  posts,
  stats,
};

export default api;
