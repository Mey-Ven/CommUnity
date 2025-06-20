import { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { supabase, STORAGE_BUCKET, FILE_UPLOAD_CONFIG } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadProgress, FileMetadata } from '../types';
import { validateFile, getFileCategory } from '../utils/fileValidation';
import { Platform } from 'react-native';

export function useSupabaseStorage() {
  const [uploads, setUploads] = useState<FileUploadProgress[]>([]);
  const { user } = useAuth();

  // Validate file before upload
  const validateFileForUpload = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > FILE_UPLOAD_CONFIG.maxFileSize) {
      return {
        isValid: false,
        error: `File too large. Maximum size: ${FILE_UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    if (!FILE_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !FILE_UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
        return {
          isValid: false,
          error: 'File type not supported'
        };
      }
    }

    return { isValid: true };
  }, []);

  // Upload file to Supabase Storage
  const uploadToSupabase = useCallback(async (file: File, uploadId: string): Promise<any> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Create unique file path: userId/timestamp_filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: urlData.publicUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
  }, [user]);

  // Main upload function
  const uploadFile = useCallback(async (file: File): Promise<FileMetadata> => {
    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    // Validate file
    const validation = validateFileForUpload(file);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid file');
    }

    const uploadId = Date.now().toString();
    
    // Add to uploads list
    setUploads(prev => [...prev, {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      // Update progress
      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, progress: 20 }
            : upload
        )
      );

      // Upload to Supabase Storage
      const supabaseResponse = await uploadToSupabase(file, uploadId);
      
      // Update progress
      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, progress: 80, status: 'processing' }
            : upload
        )
      );

      // Create metadata for Firestore
      const fileMetadata: Omit<FileMetadata, 'id'> = {
        name: supabaseResponse.fileName,
        originalName: supabaseResponse.originalName,
        size: supabaseResponse.size,
        type: supabaseResponse.type,
        category: getFileCategory(supabaseResponse.originalName),
        url: supabaseResponse.publicUrl,
        storagePath: supabaseResponse.path,
        uploadedBy: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        uploadedAt: serverTimestamp(),
        downloads: 0,
        isPublic: true,
        storageProvider: 'supabase',
        supabaseData: {
          path: supabaseResponse.path,
          fullPath: supabaseResponse.fullPath,
          publicUrl: supabaseResponse.publicUrl,
          bucket: STORAGE_BUCKET,
        }
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'files'), fileMetadata);
      
      const finalMetadata: FileMetadata = {
        id: docRef.id,
        ...fileMetadata,
        uploadedAt: new Date() // For immediate display
      };

      // Update status to completed
      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, progress: 100, status: 'completed', metadata: finalMetadata }
            : upload
        )
      );

      return finalMetadata;

    } catch (error) {
      console.error('Upload error:', error);
      
      // Update error status
      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : upload
        )
      );
      
      throw error;
    }
  }, [user, uploadToSupabase, validateFileForUpload]);

  // Delete file from Supabase Storage
  const deleteFile = useCallback(async (fileMetadata: FileMetadata): Promise<void> => {
    if (!user || !fileMetadata.supabaseData?.path) {
      throw new Error('Cannot delete file');
    }

    try {
      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([fileMetadata.supabaseData.path]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      // Note: Firestore deletion should be handled by the calling component
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }, [user]);

  // Cancel upload
  const cancelUpload = useCallback((uploadId: string) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status: 'cancelled' }
          : upload
      )
    );
  }, []);

  // Retry upload
  const retryUpload = useCallback(async (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload) return;

    try {
      await uploadFile(upload.file);
    } catch (error) {
      console.error('Retry upload failed:', error);
    }
  }, [uploads, uploadFile]);

  // Clear completed uploads
  const clearCompletedUploads = useCallback(() => {
    setUploads(prev => 
      prev.filter(upload => 
        upload.status !== 'completed' && upload.status !== 'cancelled'
      )
    );
  }, []);

  // Clear all uploads
  const clearAllUploads = useCallback(() => {
    setUploads([]);
  }, []);

  return {
    uploads,
    uploadFile,
    deleteFile,
    cancelUpload,
    retryUpload,
    clearCompletedUploads,
    clearAllUploads,
  };
}
