import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadProgress, FileMetadata } from '../types';
import { validateFile, generateUniqueFileName, getFileCategory } from '../utils/fileValidation';

export function useFileUpload() {
  const [uploads, setUploads] = useState<FileUploadProgress[]>([]);
  const { user } = useAuth();

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate unique file name
    const uniqueFileName = generateUniqueFileName(file.name, user.id);
    const storagePath = `files/${user.id}/${uniqueFileName}`;
    
    // Create upload progress entry
    const uploadId = Date.now().toString();
    const uploadProgress: FileUploadProgress = {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading',
    };

    setUploads(prev => [...prev, uploadProgress]);

    try {
      // Create storage reference
      const storageRef = ref(storage, storagePath);
      
      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Update progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploads(prev => 
              prev.map(upload => 
                upload.id === uploadId 
                  ? { ...upload, progress }
                  : upload
              )
            );
          },
          (error) => {
            // Handle error
            setUploads(prev => 
              prev.map(upload => 
                upload.id === uploadId 
                  ? { ...upload, status: 'error', error: error.message }
                  : upload
              )
            );
            reject(error);
          },
          async () => {
            try {
              // Upload completed successfully
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Save file metadata to Firestore
              const fileMetadata: Omit<FileMetadata, 'id'> = {
                name: uniqueFileName,
                originalName: file.name,
                type: file.type,
                size: file.size,
                uploaderId: user.id,
                uploaderName: user.name,
                uploadDate: new Date(),
                downloadURL,
                storagePath,
                downloads: 0,
                category: validation.category || getFileCategory(file.name),
              };

              const docRef = await addDoc(collection(db, 'files'), {
                ...fileMetadata,
                uploadDate: serverTimestamp(),
              });

              // Update upload status
              setUploads(prev => 
                prev.map(upload => 
                  upload.id === uploadId 
                    ? { ...upload, status: 'completed', progress: 100 }
                    : upload
                )
              );

              resolve(docRef.id);
            } catch (error) {
              setUploads(prev => 
                prev.map(upload => 
                  upload.id === uploadId 
                    ? { ...upload, status: 'error', error: 'Erreur lors de la sauvegarde' }
                    : upload
                )
              );
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, status: 'error', error: 'Erreur lors de l\'upload' }
            : upload
        )
      );
      throw error;
    }
  }, [user]);

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
