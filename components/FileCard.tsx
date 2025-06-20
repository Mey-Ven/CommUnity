import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { FileMetadata } from '../types';
import { formatFileSize, getFileIcon } from '../utils/fileValidation';
import { useAuth } from '../contexts/AuthContext';

interface FileCardProps {
  file: FileMetadata;
  onDownload: (file: FileMetadata) => void;
  onDelete?: (file: FileMetadata) => void;
  showActions?: boolean;
}

export default function FileCard({ 
  file, 
  onDownload, 
  onDelete, 
  showActions = true 
}: FileCardProps) {
  const { user } = useAuth();

  const canDelete = user && (user.role === 'admin' || user.id === file.uploaderId);

  const handleDownload = () => {
    onDownload(file);
  };

  const handleDelete = () => {
    if (!onDelete) return;

    const confirmDelete = () => {
      onDelete(file);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${file.originalName}" ?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Supprimer le fichier',
        `Êtes-vous sûr de vouloir supprimer "${file.originalName}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

const formatDate = (date: Date | string | undefined | null) => {
  if (!date) return 'Date inconnue';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.fileInfo}>
          <Text style={styles.fileIcon}>
            {getFileIcon(file.category)}
          </Text>
          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={2}>
              {file.originalName}
            </Text>
            <Text style={styles.fileSize}>
              {formatFileSize(file.size)}
            </Text>
          </View>
        </View>
        
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownload}
            >
              <Text style={styles.downloadButtonText}>⬇️</Text>
            </TouchableOpacity>
            
            {canDelete && onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.metadata}>
        <Text style={styles.uploader}>
          Uploadé par {file.uploaderName}
        </Text>
        <Text style={styles.uploadDate}>
          {formatDate(file.uploadDate)}
        </Text>
      </View>

      {file.downloads > 0 && (
        <View style={styles.downloadStats}>
          <Text style={styles.downloadCount}>
            📥 {file.downloads} téléchargement{file.downloads > 1 ? 's' : ''}
          </Text>
          {file.lastDownloaded && (
            <Text style={styles.lastDownloaded}>
              Dernier: {formatDate(file.lastDownloaded)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButton: {
    padding: 8,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  downloadButtonText: {
    fontSize: 18,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  metadata: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginBottom: 5,
  },
  uploader: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  uploadDate: {
    fontSize: 12,
    color: '#999',
  },
  downloadStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 5,
  },
  downloadCount: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  lastDownloaded: {
    fontSize: 10,
    color: '#999',
  },
});
