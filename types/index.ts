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
