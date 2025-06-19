import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { ValidatedInput } from '../../components/ValidatedInput';
import { useFormValidation, commonValidationRules } from '../../hooks/useFormValidation';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const validationRules = {
  name: commonValidationRules.name,
  email: commonValidationRules.email,
  password: commonValidationRules.password,
  confirmPassword: {
    required: true,
    custom: (value: string) => {
      // Cette validation sera mise à jour dynamiquement
      return null;
    },
  },
  adminCode: {
    required: false,
    custom: (value: string) => {
      // Cette validation sera mise à jour dynamiquement
      return null;
    },
  },
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { errors, validateForm, validateSingleField, clearFieldError } = useFormValidation(validationRules);

  const ADMIN_CODE = 'ADMIN2024'; // Code simple pour devenir admin

  const validateConfirmPassword = (value: string): string | null => {
    if (value !== password) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  };

  const validateAdminCode = (value: string): string | null => {
    if (isAdmin && value !== ADMIN_CODE) {
      return 'Code administrateur incorrect';
    }
    return null;
  };

  const handleRegister = async () => {
    // Validation dynamique pour confirmPassword et adminCode
    validationRules.confirmPassword.custom = validateConfirmPassword;
    validationRules.adminCode.custom = validateAdminCode;
    validationRules.adminCode.required = isAdmin;

    const formData = { name, email, password, confirmPassword, adminCode };

    if (!validateForm(formData)) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name, isAdmin);
      Alert.alert(
        'Succès',
        'Compte créé avec succès !',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cette adresse email est déjà utilisée';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible';
      }

      Alert.alert('Erreur d\'inscription', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Rejoignez votre équipe</Text>

          <View style={styles.form}>
            <ValidatedInput
              label="Nom complet"
              placeholder="Entrez votre nom complet"
              value={name}
              onChangeText={setName}
              onValidate={(text) => validateSingleField('name', text)}
              error={errors.name}
              autoCapitalize="words"
              required
            />

            <ValidatedInput
              label="Email"
              placeholder="Entrez votre adresse email"
              value={email}
              onChangeText={setEmail}
              onValidate={(text) => validateSingleField('email', text)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <ValidatedInput
              label="Mot de passe"
              placeholder="Choisissez un mot de passe"
              value={password}
              onChangeText={setPassword}
              onValidate={(text) => validateSingleField('password', text)}
              error={errors.password}
              secureTextEntry
              showPasswordToggle
              autoCapitalize="none"
              required
            />

            <ValidatedInput
              label="Confirmer le mot de passe"
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onValidate={(text) => {
                validationRules.confirmPassword.custom = validateConfirmPassword;
                validateSingleField('confirmPassword', text);
              }}
              error={errors.confirmPassword}
              secureTextEntry
              showPasswordToggle
              autoCapitalize="none"
              required
            />

            <View style={styles.adminSection}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Compte administrateur</Text>
                <Switch
                  value={isAdmin}
                  onValueChange={setIsAdmin}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={isAdmin ? '#007AFF' : '#f4f3f4'}
                />
              </View>

              {isAdmin && (
                <ValidatedInput
                  label="Code administrateur"
                  placeholder="Entrez le code administrateur"
                  value={adminCode}
                  onChangeText={setAdminCode}
                  onValidate={(text) => {
                    validationRules.adminCode.custom = validateAdminCode;
                    validateSingleField('adminCode', text);
                  }}
                  error={errors.adminCode}
                  autoCapitalize="none"
                  required
                />
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={goToLogin}>
              <Text style={styles.linkText}>
                Déjà un compte ? Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  adminSection: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
