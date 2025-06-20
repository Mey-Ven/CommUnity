import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useSupabaseStorage } from '../hooks/useSupabaseStorage';

interface SimpleFileUploadProps {
  onUploadComplete?: (fileId: string) => void;
  onUploadError?: (error: string) => void;
}

export function SimpleFileUpload({ onUploadComplete, onUploadError }: SimpleFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { uploadFile } = useSupabaseStorage();

  const pickAndUploadFile = async () => {
    try {
      setIsUploading(true);

      // Pick file using Expo DocumentPicker
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        setIsUploading(false);
        return;
      }

      const file = result.assets[0];
      
      // Convert to File object for web compatibility
      let fileToUpload: File;
      
      if (Platform.OS === 'web') {
        // On web, the file is already a File object
        fileToUpload = file as any;
      } else {
        // On mobile, create a File-like object
        const response = await fetch(file.uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], file.name, { type: file.mimeType || 'application/octet-stream' });
      }

      // Upload the file
      const fileMetadata = await uploadFile(fileToUpload);

      Alert.alert('Success', 'File uploaded successfully to Supabase!');
      onUploadComplete?.(fileMetadata.id);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      Alert.alert('Upload Error', errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.uploadContainer}>
      <TouchableOpacity
        style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
        onPress={pickAndUploadFile}
        disabled={isUploading}
      >
        <Text style={styles.uploadButtonText}>
          {isUploading ? '📤 Uploading...' : '🗂️ Upload to Supabase (Free)'}
        </Text>
      </TouchableOpacity>
      
      {isUploading && (
        <Text style={styles.uploadingText}>
          Uploading to Supabase Storage...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  uploadContainer: {
    padding: 20,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0,
    elevation: 0,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
