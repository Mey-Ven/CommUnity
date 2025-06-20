import { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { cloudinaryUploadConfig } from '../config/cloudinary';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadProgress, FileMetadata } from '../types';
import { validateFile, getFileCategory } from '../utils/fileValidation';

export function useCloudinaryUpload() {
  const [uploads, setUploads] = useState<FileUploadProgress[]>([]);
  const { user } = useAuth();

  const uploadToCloudinary = useCallback(async (file: File, uploadId: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryUploadConfig.uploadPreset);

    // Add metadata
    formData.append('context', `user_id=${user?.id}|user_name=${user?.name}`);
    formData.append('tags', `community,${getFileCategory(file.name)}`);
    formData.append('folder', 'community_files');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryUploadConfig.cloudName}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }, [user]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    // Validation du fichier
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Basic file size check (100MB limit)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum: 100MB`);
    }

    // Créer l'entrée de progression
    const uploadId = Date.now().toString();
    const uploadProgress: FileUploadProgress = {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading',
    };

    setUploads(prev => [...prev, uploadProgress]);

    try {
      // Upload vers Cloudinary
      const cloudinaryResponse = await uploadToCloudinary(file, uploadId);
      
      // Sauvegarder les métadonnées dans Firestore
      const fileMetadata: Omit<FileMetadata, 'id'> = {
        name: cloudinaryResponse.public_id,
        originalName: file.name,
        type: file.type,
        size: file.size,
        uploaderId: user.id,
        uploaderName: user.name,
        uploadDate: new Date(),
        downloadURL: cloudinaryResponse.secure_url,
        storagePath: cloudinaryResponse.public_id, // Cloudinary public_id
        downloads: 0,
        category: validation.category || getFileCategory(file.name),
      };

      const docRef = await addDoc(collection(db, 'files'), {
        ...fileMetadata,
        uploadDate: serverTimestamp(),
        cloudinaryData: {
          public_id: cloudinaryResponse.public_id,
          version: cloudinaryResponse.version,
          signature: cloudinaryResponse.signature,
          width: cloudinaryResponse.width,
          height: cloudinaryResponse.height,
          format: cloudinaryResponse.format,
          resource_type: cloudinaryResponse.resource_type,
          created_at: cloudinaryResponse.created_at,
          bytes: cloudinaryResponse.bytes,
        },
      });

      // Mettre à jour le statut
      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, status: 'completed', progress: 100 }
            : upload
        )
      );

      return docRef.id;
    } catch (error: any) {
      // Mettre à jour le statut d'erreur
      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, status: 'error', error: error.message }
            : upload
        )
      );
      throw error;
    }
  }, [user, uploadToCloudinary]);

  const cancelUpload = useCallback((uploadId: string) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status: 'cancelled' }
          : upload
      )
    );
  }, []);

  const retryUpload = useCallback(async (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload) return;

    try {
      await uploadFile(upload.file);
    } catch (error) {
      console.error('Retry upload failed:', error);
    }
  }, [uploads, uploadFile]);

  const clearCompletedUploads = useCallback(() => {
    setUploads(prev => 
      prev.filter(upload => 
        upload.status !== 'completed' && upload.status !== 'cancelled'
      )
    );
  }, []);

  const clearAllUploads = useCallback(() => {
    setUploads([]);
  }, []);

  return {
    uploads,
    uploadFile,
    cancelUpload,
    retryUpload,
    clearCompletedUploads,
    clearAllUploads,
  };
}
