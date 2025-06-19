import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { SuccessMessage } from '../../components/SuccessMessage';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot,
  doc,
  setDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

export default function AdminScreen() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersData: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            email: data.email,
            name: data.name,
            role: data.role,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        setEmployees(usersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        setInitialLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setError('Impossible de charger la liste des utilisateurs.');
        setInitialLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addEmployee = async () => {
    if (!newEmployeeName.trim() || !newEmployeeEmail.trim() || !newEmployeePassword.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (newEmployeePassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmployeeEmail)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmployeeEmail.trim(),
        newEmployeePassword
      );
      const firebaseUser = userCredential.user;

      // Créer le document utilisateur dans Firestore
      const userData = {
        name: newEmployeeName.trim(),
        email: newEmployeeEmail.trim(),
        role: 'employee',
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Réinitialiser les champs
      setNewEmployeeName('');
      setNewEmployeeEmail('');
      setNewEmployeePassword('');

      // Message de succès
      setSuccessMessage(`Employé ${newEmployeeName.trim()} ajouté avec succès !`);
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Erreur ajout employé:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'ajout de l\'employé';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cette adresse email est déjà utilisée';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const retryLoadUsers = () => {
    setError(null);
    setInitialLoading(true);
  };

  const renderEmployee = ({ item }: { item: User }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeEmail}>{item.email}</Text>
        <Text style={styles.employeeRole}>
          {item.role === 'admin' ? 'Administrateur' : 'Employé'}
        </Text>
      </View>
      <View style={styles.employeeDate}>
        <Text style={styles.dateText}>
          Ajouté le {item.createdAt.toLocaleDateString('fr-FR')}
        </Text>
      </View>
    </View>
  );

  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Accès refusé</Text>
        </View>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>
            🔒 Seuls les administrateurs peuvent accéder à cette page.
          </Text>
        </View>
      </View>
    );
  }

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Administration</Text>
        </View>
        <LoadingSpinner text="Chargement des utilisateurs..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administration</Text>
        <Text style={styles.headerSubtitle}>
          Gestion des employés • {employees.length} utilisateurs
        </Text>
      </View>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={retryLoadUsers}
        />
      )}

      <View style={styles.addEmployeeSection}>
        <Text style={styles.sectionTitle}>Ajouter un employé</Text>

        <TextInput
          style={styles.input}
          placeholder="Nom complet"
          value={newEmployeeName}
          onChangeText={setNewEmployeeName}
          autoCapitalize="words"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={newEmployeeEmail}
          onChangeText={setNewEmployeeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe temporaire (min. 6 caractères)"
          value={newEmployeePassword}
          onChangeText={setNewEmployeePassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={addEmployee}
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner size="small" color="white" />
          ) : (
            <Text style={styles.addButtonText}>Ajouter l'employé</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.employeesSection}>
        <Text style={styles.sectionTitle}>
          Liste des utilisateurs ({employees.length})
        </Text>

        {employees.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucun utilisateur trouvé
            </Text>
          </View>
        ) : (
          <FlatList
            data={employees}
            renderItem={renderEmployee}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <SuccessMessage
        message={successMessage || ''}
        visible={showSuccess}
        onHide={() => setShowSuccess(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  addEmployeeSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeesSection: {
    margin: 15,
    marginTop: 0,
  },
  employeeCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  employeeInfo: {
    marginBottom: 8,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  employeeRole: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  employeeDate: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#ff3333',
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
