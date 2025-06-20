import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useFileManager } from '../../hooks/useFileManager';
import { useSupabaseStorage } from '../../hooks/useSupabaseStorage';
import FileList from '../../components/FileList';
import { SimpleFileUpload } from '../../components/SimpleFileUpload';

import FileUploadProgressComponent from '../../components/FileUploadProgress';
import { ErrorMessage } from '../../components/ErrorMessage';
import { SuccessMessage } from '../../components/SuccessMessage';

export default function FilesScreen() {
  const { user } = useAuth();
  const { 
    files, 
    loading, 
    error, 
    downloadFile, 
    deleteFile, 
    refreshFiles,
    getFileStats 
  } = useFileManager();
  
  const {
    uploads,
    uploadFile,
    cancelUpload,
    retryUpload,
    clearCompletedUploads
  } = useSupabaseStorage();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUploadComplete = (fileId: string) => {
    setSuccessMessage('File uploaded successfully!');
    setShowSuccess(true);
    refreshFiles(); // Refresh the file list
  };

  const handleUploadError = (error: string) => {
    // Error is already handled by the SimpleFileUpload component
    console.error('Upload error:', error);
  };

  const handleDownload = async (file: any) => {
    try {
      await downloadFile(file);
    } catch (error: any) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (file: any) => {
    try {
      await deleteFile(file);
      setSuccessMessage(`File "${file.originalName}" deleted successfully!`);
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Delete error:', error);
    }
  };

  const stats = getFileStats();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Vous devez être connecté pour accéder aux fichiers</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shared Files</Text>
        <Text style={styles.headerSubtitle}>
          {stats.totalFiles} file{stats.totalFiles !== 1 ? 's' : ''} • {stats.totalDownloads} download{stats.totalDownloads !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Simple Upload Section */}
      <View style={styles.uploadSection}>
        <SimpleFileUpload
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </View>

      {/* Active Uploads */}
      {uploads.length > 0 && (
        <View style={styles.uploadsSection}>
          <View style={styles.uploadsSectionHeader}>
            <Text style={styles.uploadsSectionTitle}>Uploads en cours</Text>
            <TouchableOpacity onPress={clearCompletedUploads}>
              <Text style={styles.clearUploadsText}>Nettoyer</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.uploadsList} showsVerticalScrollIndicator={false}>
            {uploads.map((upload) => (
              <FileUploadProgressComponent
                key={upload.id}
                upload={upload}
                onCancel={cancelUpload}
                onRetry={retryUpload}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={refreshFiles}
        />
      )}

      {/* File List */}
      <FileList
        files={files}
        loading={loading}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onRefresh={refreshFiles}
        refreshing={loading}
      />



      {/* Success Message */}
      <SuccessMessage
        message={successMessage || ''}
        visible={showSuccess}
        onHide={() => setShowSuccess(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  uploadSection: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  uploadsSection: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 200,
  },
  uploadsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  uploadsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearUploadsText: {
    fontSize: 14,
    color: '#007AFF',
  },
  uploadsList: {
    paddingHorizontal: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 50,
  },
});
