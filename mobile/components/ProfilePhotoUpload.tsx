import { API_BASE_URL } from '../../config/api';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { uploadProfilePhoto } from '../../utils/cloudinaryService';
import { useAuthStore } from '../../store/authStore';

export default function ProfilePhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState(null);
  const { token, user, updateUser } = useAuthStore();

  const handleUploadPhoto = async () => {
    try {
      setUploading(true);

      const uploadedURL = await uploadProfilePhoto(token);

      if (uploadedURL) {
        setPhotoURL(uploadedURL);

        // Update user profile with new photo URL
        const response = await fetch(`${API_BASE_URL}/user/profile/photo`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ photoURL: uploadedURL }),
        });

        const data = await response.json();

        if (data.success) {
          updateUser({ photoURL: uploadedURL });
          Alert.alert('Success', 'Profile photo updated!');
        }
      }

    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="items-center p-4">
      <TouchableOpacity
        onPress={handleUploadPhoto}
        disabled={uploading}
        className="relative"
      >
        {photoURL || user?.photoURL ? (
          <Image
            source={{ uri: photoURL || user?.photoURL }}
            className="w-32 h-32 rounded-full"
          />
        ) : (
          <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-gray-500 text-lg">📷</Text>
          </View>
        )}

        {uploading && (
          <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
            <ActivityIndicator color="white" />
          </View>
        )}

        <View className="absolute bottom-0 right-0 bg-blue-500 w-10 h-10 rounded-full items-center justify-center">
          <Text className="text-white text-xl">✏️</Text>
        </View>
      </TouchableOpacity>

      <Text className="mt-4 text-gray-600">
        {uploading ? 'Uploading...' : 'Tap to change photo'}
      </Text>
    </View>
  );
}
