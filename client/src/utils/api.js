const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

export const api = {
  getToken() {
    return localStorage.getItem('life_rpg_token');
  },

  setToken(token) {
    if (token) localStorage.setItem('life_rpg_token', token);
    else localStorage.removeItem('life_rpg_token');
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Auth endpoints
  register(payload) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },

  login(payload) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  },

  guestLogin() {
    return this.request('/auth/guest', { method: 'POST' });
  },

  forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  updateProfile(payload) {
    return this.request('/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) });
  },

  // Quests endpoints
  getQuests() {
    return this.request('/quests');
  },

  createQuest(payload) {
    return this.request('/quests', { method: 'POST', body: JSON.stringify(payload) });
  },

  updateQuest(id, payload) {
    return this.request(`/quests/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  deleteQuest(id) {
    return this.request(`/quests/${id}`, { method: 'DELETE' });
  },

  completeQuest(id) {
    return this.request(`/quests/${id}/complete`, { method: 'PATCH' });
  },

  resetRecurringQuests() {
    return this.request('/quests/reset-recurring', { method: 'POST' });
  },

  // Shop endpoints
  getShop() {
    return this.request('/shop');
  },

  buyReward(itemId) {
    return this.request('/shop/buy', { method: 'POST', body: JSON.stringify({ itemId }) });
  },

  createCustomReward(payload) {
    return this.request('/shop/custom', { method: 'POST', body: JSON.stringify(payload) });
  },

  claimCustomReward(rewardId) {
    return this.request(`/shop/custom/${rewardId}/claim`, { method: 'POST' });
  },

  deleteCustomReward(rewardId) {
    return this.request(`/shop/custom/${rewardId}`, { method: 'DELETE' });
  }
};
