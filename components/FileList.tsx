import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FileMetadata, FileFilter, FileCategory, FILE_CATEGORY_LABELS } from '../types';
import FileCard from './FileCard';
import { LoadingSpinner } from './LoadingSpinner';
interface FileListProps {
  files: FileMetadata[];
  loading?: boolean;
  onDownload: (file: FileMetadata) => void;
  onDelete?: (file: FileMetadata) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function FileList({
  files,
  loading = false,
  onDownload,
  onDelete,
  onRefresh,
  refreshing = false,
}: FileListProps) {
  const [filter, setFilter] = useState<FileFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'all'>('all');

  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(file =>
        file.originalName.toLowerCase().includes(term) ||
        file.uploaderName.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(file => file.category === selectedCategory);
    }

    // Sort by upload date (newest first)
    result.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());

    return result;
  }, [files, searchTerm, selectedCategory]);

  const categories: Array<{ key: FileCategory | 'all'; label: string }> = [
    { key: 'all', label: 'Tous' },
    { key: 'document', label: FILE_CATEGORY_LABELS.document },
    { key: 'image', label: FILE_CATEGORY_LABELS.image },
    { key: 'spreadsheet', label: FILE_CATEGORY_LABELS.spreadsheet },
    { key: 'presentation', label: FILE_CATEGORY_LABELS.presentation },
  ];

  const renderFileItem = ({ item }: { item: FileMetadata }) => (
    <FileCard
      file={item}
      onDownload={onDownload}
      onDelete={onDelete}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📁</Text>
      <Text style={styles.emptyStateTitle}>Aucun fichier trouvé</Text>
      <Text style={styles.emptyStateText}>
        {searchTerm || selectedCategory !== 'all'
          ? 'Aucun fichier ne correspond à vos critères de recherche'
          : 'Aucun fichier n\'a encore été partagé'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Chargement des fichiers..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des fichiers..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.key && styles.categoryButtonTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredFiles.length} fichier{filteredFiles.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* File List */}
      <FlatList
        data={filteredFiles}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.id}
        style={styles.fileList}
        contentContainerStyle={styles.fileListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        onRefresh={onRefresh}
        refreshing={refreshing}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  categoryFilter: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryFilterContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  resultsHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fileList: {
    flex: 1,
  },
  fileListContent: {
    paddingVertical: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
