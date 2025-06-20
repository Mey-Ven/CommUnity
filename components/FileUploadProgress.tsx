import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { FileUploadProgress } from '../types';

interface FileUploadProgressProps {
  upload: FileUploadProgress;
  onCancel?: (uploadId: string) => void;
  onRetry?: (uploadId: string) => void;
}

export default function FileUploadProgressComponent({ 
  upload, 
  onCancel, 
  onRetry 
}: FileUploadProgressProps) {
  const getStatusColor = () => {
    switch (upload.status) {
      case 'uploading':
        return '#007AFF';
      case 'completed':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      case 'cancelled':
        return '#8E8E93';
      default:
        return '#007AFF';
    }
  };

  const getStatusText = () => {
    switch (upload.status) {
      case 'uploading':
        return `Upload en cours... ${Math.round(upload.progress)}%`;
      case 'completed':
        return 'Upload terminé ✓';
      case 'error':
        return `Erreur: ${upload.error || 'Upload échoué'}`;
      case 'cancelled':
        return 'Upload annulé';
      default:
        return 'En attente...';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.fileName} numberOfLines={1}>
          {upload.file.name}
        </Text>
        <Text style={styles.fileSize}>
          {formatFileSize(upload.file.size)}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${upload.progress}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      <View style={styles.actions}>
        {upload.status === 'uploading' && onCancel && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancel(upload.id)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}

        {upload.status === 'error' && onRetry && (
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={() => onRetry(upload.id)}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  retryButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
