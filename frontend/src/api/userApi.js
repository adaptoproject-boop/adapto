import axios from 'axios';

const API_URL = 'http://localhost:5612/api';

/**
 * Update the user's difficulty level based on selected age group.
 * @param {string} level - one of 'Easy', 'Medium', 'Hard'
 * @param {string} token - JWT token for authentication (optional, taken from userInfo if not provided)
 */
export const updateUserLevel = async (level, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await axios.put(`${API_URL}/users/update-level`, { level }, { headers });
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user level:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to update level' };
  }
};
