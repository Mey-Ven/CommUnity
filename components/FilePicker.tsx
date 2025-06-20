import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, FileCategory } from '../types';

interface FilePickerProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  acceptedTypes?: FileCategory[];
}

export default function FilePicker({ 
  onFileSelect, 
  disabled = false, 
  acceptedTypes = ['document', 'image', 'spreadsheet', 'presentation'] 
}: FilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptedExtensions = () => {
    const extensions: string[] = [];
    acceptedTypes.forEach(category => {
      extensions.push(...ALLOWED_FILE_TYPES[category]);
    });
    return extensions.join(',');
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `Le fichier est trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = acceptedTypes.some(category => 
      ALLOWED_FILE_TYPES[category].includes(fileExtension)
    );

    if (!isValidType) {
      return 'Type de fichier non supporté';
    }

    return null;
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      if (Platform.OS === 'web') {
        window.alert(validationError);
      } else {
        Alert.alert('Erreur', validationError);
      }
      return;
    }

    onFileSelect(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFilePicker = () => {
    if (Platform.OS === 'web') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      // For mobile, we would use react-native-document-picker
      Alert.alert('Info', 'Sélection de fichiers disponible sur web uniquement pour le moment');
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedExtensions()}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      )}
      
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={openFilePicker}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          📁 Sélectionner un fichier
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        Formats supportés: PDF, Word, Excel, PowerPoint, Images
      </Text>
      <Text style={styles.helpText}>
        Taille maximale: {MAX_FILE_SIZE / (1024 * 1024)}MB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#999',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
});
