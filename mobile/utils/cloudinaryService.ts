// Cloudinary Upload Service for React Native
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

const API_URL = 'http://192.168.0.100:3000/api'; // Update with your backend URL

/**
 * Request permissions for camera and media library
 */
export const requestMediaPermissions = async () => {
  const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
  const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  return cameraPermission.granted && mediaPermission.granted;
};

/**
 * Pick and upload profile photo
 */
export const uploadProfilePhoto = async (authToken) => {
  try {
    // Request permissions
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant camera and media library permissions');
      return null;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return null;

    // Create FormData
    const formData = new FormData();
    formData.append('photo', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });

    // Upload to backend
    const response = await fetch(`${API_URL}/upload/profile-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.photoURL;
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('Upload profile photo error:', error);
    Alert.alert('Upload Failed', error.message || 'Failed to upload photo');
    return null;
  }
};

/**
 * Take photo with camera and upload
 */
export const takeAndUploadPhoto = async (authToken, folder = 'general') => {
  try {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant camera permissions');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) return null;

    const formData = new FormData();
    formData.append('image', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    const response = await fetch(`${API_URL}/upload/image?folder=${folder}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('Camera upload error:', error);
    Alert.alert('Upload Failed', error.message);
    return null;
  }
};

/**
 * Upload multiple images (for products, galleries, etc.)
 */
export const uploadMultipleImages = async (authToken, folder = 'general', maxImages = 10) => {
  try {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant media library permissions');
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxImages,
      quality: 0.8,
    });

    if (result.canceled) return [];

    const formData = new FormData();
    result.assets.forEach((asset, index) => {
      formData.append('images', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `image_${index}.jpg`,
      });
    });

    const response = await fetch(`${API_URL}/upload/images?folder=${folder}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.images.map(img => img.url);
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('Upload multiple images error:', error);
    Alert.alert('Upload Failed', error.message);
    return [];
  }
};

/**
 * Upload single image
 */
export const uploadSingleImage = async (authToken, folder = 'general') => {
  try {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant media library permissions');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return null;

    const formData = new FormData();
    formData.append('image', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    const response = await fetch(`${API_URL}/upload/image?folder=${folder}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('Upload single image error:', error);
    Alert.alert('Upload Failed', error.message);
    return null;
  }
};

/**
 * Upload video
 */
export const uploadVideo = async (authToken, folder = 'videos', onProgress) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return null;

    const formData = new FormData();
    formData.append('video', {
      uri: result.assets[0].uri,
      type: 'video/mp4',
      name: result.assets[0].name || 'video.mp4',
    });

    const response = await fetch(`${API_URL}/upload/video?folder=${folder}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return {
        url: data.data.url,
        duration: data.data.duration,
      };
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    console.error('Upload video error:', error);
    Alert.alert('Upload Failed', error.message);
    return null;
  }
};

export default {
  requestMediaPermissions,
  uploadProfilePhoto,
  takeAndUploadPhoto,
  uploadMultipleImages,
  uploadSingleImage,
  uploadVideo,
};
