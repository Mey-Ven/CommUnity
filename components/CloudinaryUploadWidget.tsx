import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { cloudinaryUploadConfig, CLOUDINARY_ALLOWED_FORMATS } from '../config/cloudinary';
import { useAuth } from '../contexts/AuthContext';

interface CloudinaryUploadWidgetProps {
  onUploadSuccess: (result: any) => void;
  onUploadError: (error: any) => void;
  disabled?: boolean;
  buttonText?: string;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function CloudinaryUploadWidget({
  onUploadSuccess,
  onUploadError,
  disabled = false,
  buttonText = '📁 Sélectionner un fichier'
}: CloudinaryUploadWidgetProps) {
  const { user } = useAuth();
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Charger le script Cloudinary seulement sur web
    if (Platform.OS === 'web' && !window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      script.onload = () => {
        initializeWidget();
      };
      document.head.appendChild(script);
    } else if (Platform.OS === 'web' && window.cloudinary) {
      initializeWidget();
    }
  }, []);

  const initializeWidget = () => {
    if (!window.cloudinary || !user) return;

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudinaryUploadConfig.cloudName,
        uploadPreset: cloudinaryUploadConfig.uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFileSize: 10000000, // 10MB
        maxImageFileSize: 10000000,
        maxVideoFileSize: 10000000,
        maxRawFileSize: 10000000,
        clientAllowedFormats: CLOUDINARY_ALLOWED_FORMATS,
        cropping: false,
        folder: 'community_files',
        publicId: `${user.id}_${Date.now()}`,
        context: {
          user_id: user.id,
          user_name: user.name,
          upload_date: new Date().toISOString(),
        },
        tags: ['community', 'user_upload'],
        resourceType: 'auto',
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#007AFF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#007AFF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          },
          fonts: {
            default: null,
            "'Fira Sans', sans-serif": {
              url: 'https://fonts.googleapis.com/css?family=Fira+Sans',
              active: true
            }
          }
        },
        text: {
          en: {
            or: 'ou',
            back: 'Retour',
            advanced: 'Avancé',
            close: 'Fermer',
            no_results: 'Aucun résultat',
            search_placeholder: 'Rechercher des fichiers',
            about_uw: 'À propos du widget d\'upload',
            search: {
              placeholder: 'Rechercher des fichiers',
              reset: 'Réinitialiser la recherche'
            },
            menu: {
              files: 'Mes fichiers',
              web: 'Adresse web',
              camera: 'Caméra'
            },
            selection_counter: {
              selected: 'Sélectionné'
            },
            actions: {
              upload: 'Uploader',
              next: 'Suivant',
              clear_all: 'Tout effacer',
              log_out: 'Se déconnecter'
            },
            notifications: {
              general_error: 'Une erreur est survenue',
              general_prompt: 'Êtes-vous sûr?',
              limit_reached: 'Limite atteinte',
              invalid_add_url: 'URL invalide',
              invalid_public_id: 'ID public invalide',
              no_results: 'Aucun résultat trouvé'
            }
          }
        }
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          onUploadError(error);
          return;
        }

        if (result && result.event === 'success') {
          console.log('Cloudinary upload success:', result.info);
          onUploadSuccess(result.info);
        }
      }
    );
  };

  const openWidget = () => {
    if (Platform.OS !== 'web') {
      // Pour mobile, utiliser le FilePicker existant
      onUploadError(new Error('Widget Cloudinary disponible sur web uniquement'));
      return;
    }

    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      onUploadError(new Error('Widget Cloudinary non initialisé'));
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={openWidget}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          {buttonText}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        Formats supportés: PDF, Word, Excel, PowerPoint, Images
      </Text>
      <Text style={styles.helpText}>
        Taille maximale: 10MB • Powered by Cloudinary
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
