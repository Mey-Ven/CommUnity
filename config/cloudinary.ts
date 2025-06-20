import { Cloudinary } from '@cloudinary/url-gen';

// Configuration Cloudinary
// Les variables d'environnement sont chargées depuis .env
const cloudinaryConfig = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dl41auqpc',
  apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '834849154812892',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'community_uploads',
};

// Instance Cloudinary pour le client
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloudName,
  },
});

// Configuration pour les uploads
export const cloudinaryUploadConfig = {
  cloudName: cloudinaryConfig.cloudName,
  apiKey: cloudinaryConfig.apiKey,
  uploadPreset: cloudinaryConfig.uploadPreset,
};

// Types de fichiers autorisés pour Cloudinary
export const CLOUDINARY_ALLOWED_FORMATS = [
  // Images
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff',
  // Documents
  'pdf', 'doc', 'docx', 'txt',
  // Feuilles de calcul
  'xls', 'xlsx', 'csv',
  // Présentations
  'ppt', 'pptx',
  // Autres
  'zip', 'rar',
];

// Taille maximale (10MB)
export const MAX_FILE_SIZE_CLOUDINARY = 10 * 1024 * 1024;

// Configuration des transformations Cloudinary
export const cloudinaryTransformations = {
  // Thumbnail pour les images
  thumbnail: {
    width: 150,
    height: 150,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  },
  
  // Preview pour les images
  preview: {
    width: 400,
    height: 300,
    crop: 'fit',
    quality: 'auto',
    format: 'auto',
  },
  
  // Optimisation automatique
  optimize: {
    quality: 'auto',
    format: 'auto',
    fetch_format: 'auto',
  },
};

// Helper pour générer des URLs optimisées
export const getOptimizedUrl = (publicId: string, transformation?: any) => {
  const cld = new Cloudinary({
    cloud: {
      cloudName: cloudinaryConfig.cloudName,
    },
  });
  
  const image = cld.image(publicId);
  
  if (transformation) {
    // Appliquer les transformations
    Object.keys(transformation).forEach(key => {
      image.addTransformation(key, transformation[key]);
    });
  }
  
  return image.toURL();
};

// Helper pour obtenir l'URL de téléchargement
export const getDownloadUrl = (publicId: string, originalName: string) => {
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/raw/upload/fl_attachment:${encodeURIComponent(originalName)}/${publicId}`;
};

// Helper pour obtenir les métadonnées d'un fichier
export const getFileMetadata = async (publicId: string) => {
  try {
    const response = await fetch(
      `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${publicId}.json`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching file metadata:', error);
    return null;
  }
};

export default cloudinaryConfig;
