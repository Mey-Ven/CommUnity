import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create a minimal client configuration to avoid web compatibility issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
export const STORAGE_BUCKET = 'community-files';

// File upload configuration
export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: [
    // Images
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    
    // Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    
    // Presentations
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text files
    'text/plain',
    'text/csv',
    'application/rtf',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    
    // Other
    'application/json',
    'application/xml',
  ],
  allowedExtensions: [
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
    
    // Documents  
    'pdf', 'doc', 'docx',
    
    // Spreadsheets
    'xls', 'xlsx', 'csv',
    
    // Presentations
    'ppt', 'pptx',
    
    // Text
    'txt', 'rtf',
    
    // Archives
    'zip', 'rar', '7z',
    
    // Other
    'json', 'xml',
  ],
};
