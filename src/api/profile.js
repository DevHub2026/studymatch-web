import api from './axiosInstance';

export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const response = await api.post('/profile/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Failed to update password:', error);
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete('/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to delete account:', error);
    throw error;
  }
};