// Types pour l'utilisateur
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  createdAt: Date;
}

// Types pour les messages
export interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

// Types pour l'authentification
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, isAdmin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

// Types pour la navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Chat: undefined;
  AddEmployee: undefined;
  FileUpload: undefined;
};

// Types pour les props des écrans
export interface LoginScreenProps {
  navigation: any;
}

export interface RegisterScreenProps {
  navigation: any;
}

export interface ChatScreenProps {
  navigation: any;
}

export interface AddEmployeeScreenProps {
  navigation: any;
}

// File sharing types
export interface FileMetadata {
  id: string;
  name: string;
  originalName?: string;
  type: string;
  size: number;
  category: FileCategory;
  url: string;
  storagePath?: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  uploadedAt: Date | any; // Can be serverTimestamp
  downloads: number;
  lastDownloaded?: Date;
  isPublic: boolean;
  storageProvider?: 'supabase' | 'cloudinary' | 'firebase';

  // Legacy fields for backward compatibility
  uploaderId?: string;
  uploaderName?: string;
  uploadDate?: Date;
  downloadURL?: string;

  // Supabase specific data
  supabaseData?: {
    path: string;
    fullPath: string;
    publicUrl: string;
    bucket: string;
  };

  // Cloudinary specific data (for backward compatibility)
  cloudinaryData?: {
    publicId: string;
    version: number;
    signature: string;
    width?: number;
    height?: number;
    format: string;
    resourceType: string;
    bytes: number;
    etag: string;
    placeholder?: boolean;
    url: string;
    secureUrl: string;
  };
}

export interface FileUploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'cancelled' | 'processing';
  error?: string;
  metadata?: FileMetadata;
}

export interface FileDownloadHistory {
  id: string;
  fileId: string;
  fileName: string;
  downloaderId: string;
  downloaderName: string;
  downloadDate: Date;
}

export type FileCategory = 'document' | 'image' | 'spreadsheet' | 'presentation' | 'other';

export interface FileFilter {
  category?: FileCategory;
  uploader?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export const ALLOWED_FILE_TYPES = {
  document: ['.pdf', '.doc', '.docx', '.txt'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  spreadsheet: ['.xls', '.xlsx', '.csv'],
  presentation: ['.ppt', '.pptx'],
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const FILE_CATEGORY_LABELS = {
  document: 'Documents',
  image: 'Images',
  spreadsheet: 'Feuilles de calcul',
  presentation: 'Présentations',
  other: 'Autres',
} as const;
