import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { cloudinaryUploadConfig } from '../config/cloudinary';
import { useAuth } from '../contexts/AuthContext';
import { FileMetadata, FileDownloadHistory } from '../types';

export function useFileManager() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load files from Firestore
  useEffect(() => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }

    const filesQuery = query(
      collection(db, 'files'),
      orderBy('uploadDate', 'desc')
    );

    const unsubscribe = onSnapshot(
      filesQuery,
      (snapshot) => {
        const filesData: FileMetadata[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          filesData.push({
            id: doc.id,
            ...data,
            uploadDate: data.uploadDate?.toDate() || new Date(),
            lastDownloaded: data.lastDownloaded?.toDate(),
          } as FileMetadata);
        });
        setFiles(filesData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error loading files:', error);
        setError('Erreur lors du chargement des fichiers');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Download file
  const downloadFile = useCallback(async (file: FileMetadata) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      // Track download
      await Promise.all([
        // Update file download count
        updateDoc(doc(db, 'files', file.id), {
          downloads: increment(1),
          lastDownloaded: serverTimestamp(),
        }),
        
        // Add download history
        addDoc(collection(db, 'downloadHistory'), {
          fileId: file.id,
          fileName: file.originalName,
          downloaderId: user.id,
          downloaderName: user.name,
          downloadDate: serverTimestamp(),
        }),
      ]);

      // Trigger download
      if (typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = file.downloadURL;
        link.download = file.originalName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Erreur lors du téléchargement');
    }
  }, [user]);

  // Delete file from Cloudinary
  const deleteFromCloudinary = useCallback(async (publicId: string) => {
    try {
      // Pour supprimer de Cloudinary, nous devons faire un appel à l'API
      // Ceci nécessite normalement une signature côté serveur pour la sécurité
      // Pour l'instant, nous ne supprimons que de Firestore
      console.log('Cloudinary deletion would require server-side implementation for:', publicId);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }
  }, []);

  // Delete file
  const deleteFile = useCallback(async (file: FileMetadata) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    // Check permissions
    const canDelete = user.role === 'admin' || user.id === file.uploaderId;
    if (!canDelete) {
      throw new Error('Vous n\'avez pas les permissions pour supprimer ce fichier');
    }

    try {
      // Delete from Cloudinary (optionnel - nécessite une implémentation côté serveur)
      await deleteFromCloudinary(file.storagePath);

      // Delete from Firestore
      await deleteDoc(doc(db, 'files', file.id));

      // Note: Download history is kept for audit purposes
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Erreur lors de la suppression');
    }
  }, [user, deleteFromCloudinary]);

  // Get files by uploader
  const getFilesByUploader = useCallback((uploaderId: string) => {
    return files.filter(file => file.uploaderId === uploaderId);
  }, [files]);

  // Get files by category
  const getFilesByCategory = useCallback((category: string) => {
    return files.filter(file => file.category === category);
  }, [files]);

  // Search files
  const searchFiles = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return files.filter(file => 
      file.originalName.toLowerCase().includes(term) ||
      file.uploaderName.toLowerCase().includes(term)
    );
  }, [files]);

  // Get file statistics
  const getFileStats = useCallback(() => {
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalDownloads = files.reduce((sum, file) => sum + file.downloads, 0);
    
    const categoryStats = files.reduce((stats, file) => {
      stats[file.category] = (stats[file.category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    return {
      totalFiles,
      totalSize,
      totalDownloads,
      categoryStats,
    };
  }, [files]);

  // Refresh files
  const refreshFiles = useCallback(() => {
    setLoading(true);
    // The useEffect will handle the refresh via the real-time listener
  }, []);

  return {
    files,
    loading,
    error,
    downloadFile,
    deleteFile,
    getFilesByUploader,
    getFilesByCategory,
    searchFiles,
    getFileStats,
    refreshFiles,
  };
}
