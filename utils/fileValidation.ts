import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, FileCategory } from '../types';
import { CLOUDINARY_ALLOWED_FORMATS, MAX_FILE_SIZE_CLOUDINARY } from '../config/cloudinary';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  category?: FileCategory;
}

export function validateFile(file: File): FileValidationResult {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'Aucun fichier sélectionné' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return { 
      isValid: false, 
      error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB` 
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: 'Le fichier est vide' };
  }

  // Get file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || fileExtension === '.') {
    return { isValid: false, error: 'Extension de fichier manquante' };
  }

  // Determine file category and validate
  let category: FileCategory | undefined;
  let isValidType = false;

  for (const [cat, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (extensions.includes(fileExtension)) {
      category = cat as FileCategory;
      isValidType = true;
      break;
    }
  }

  if (!isValidType) {
    const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat().join(', ');
    return { 
      isValid: false, 
      error: `Type de fichier non supporté. Extensions autorisées: ${allowedExtensions}` 
    };
  }

  return { isValid: true, category };
}

export function getFileCategory(fileName: string): FileCategory {
  const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase();
  
  for (const [category, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (extensions.includes(fileExtension)) {
      return category as FileCategory;
    }
  }
  
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(category: FileCategory): string {
  switch (category) {
    case 'document':
      return '📄';
    case 'image':
      return '🖼️';
    case 'spreadsheet':
      return '📊';
    case 'presentation':
      return '📽️';
    default:
      return '📁';
  }
}

export function isImageFile(fileName: string): boolean {
  const imageExtensions = ALLOWED_FILE_TYPES.image;
  const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(fileExtension);
}

export function generateUniqueFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");

  return `${userId}_${timestamp}_${randomString}_${nameWithoutExtension}.${extension}`;
}

export function validateFileForCloudinary(file: File): FileValidationResult {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'Aucun fichier sélectionné' };
  }

  // Check file size for Cloudinary
  if (file.size > MAX_FILE_SIZE_CLOUDINARY) {
    const maxSizeMB = MAX_FILE_SIZE_CLOUDINARY / (1024 * 1024);
    return {
      isValid: false,
      error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: 'Le fichier est vide' };
  }

  // Get file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (!fileExtension) {
    return { isValid: false, error: 'Extension de fichier manquante' };
  }

  // Check if format is supported by Cloudinary
  if (!CLOUDINARY_ALLOWED_FORMATS.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Format non supporté par Cloudinary. Formats autorisés: ${CLOUDINARY_ALLOWED_FORMATS.join(', ')}`
    };
  }

  // Determine category
  const category = getFileCategory(file.name);

  return { isValid: true, category };
}

export function getCloudinaryResourceType(fileName: string): 'image' | 'video' | 'raw' {
  const extension = fileName.split('.').pop()?.toLowerCase();

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(extension || '')) {
    return 'image';
  }

  // Videos (si supportés)
  if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
    return 'video';
  }

  // Tous les autres fichiers (documents, etc.)
  return 'raw';
}
