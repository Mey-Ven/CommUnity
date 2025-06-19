import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { Message } from '../types';

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  showPreview: boolean;
}

export const useNotifications = (
  messages: Message[],
  currentUserId: string | null,
  isAppActive: boolean = true
) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    vibration: true,
    showPreview: true,
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<Date>(new Date());
  const previousMessagesLength = useRef(messages.length);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Calculer le nombre de messages non lus
  const calculateUnreadCount = useCallback(() => {
    const unread = messages.filter(
      message => 
        message.timestamp > lastReadTimestamp &&
        message.userId !== currentUserId
    ).length;
    
    setUnreadCount(unread);
    return unread;
  }, [messages, lastReadTimestamp, currentUserId]);

  // Marquer les messages comme lus
  const markAsRead = useCallback(() => {
    setLastReadTimestamp(new Date());
    setUnreadCount(0);
  }, []);

  // Afficher une notification
  const showNotification = useCallback((message: Message) => {
    if (!settings.enabled || message.userId === currentUserId) {
      return;
    }

    // Notification web
    if (Platform.OS === 'web' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const notification = new Notification(
          `Nouveau message de ${message.userName}`,
          {
            body: settings.showPreview ? message.text : 'Nouveau message reçu',
            icon: '/icon.png', // Assurez-vous d'avoir une icône
            tag: 'community-message',
            requireInteraction: false,
          }
        );

        // Auto-fermer après 5 secondes
        setTimeout(() => notification.close(), 5000);
      }
    }

    // Vibration (mobile)
    if (settings.vibration && Platform.OS !== 'web') {
      // Note: Vous devrez installer expo-haptics pour cela
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Son (vous pouvez ajouter expo-av pour jouer un son)
    if (settings.sound) {
      // Audio.Sound.createAsync({ uri: 'notification.mp3' }).then(({ sound }) => {
      //   sound.playAsync();
      // });
    }
  }, [settings, currentUserId]);

  // Demander la permission pour les notifications
  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS === 'web' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }, []);

  // Écouter les nouveaux messages
  useEffect(() => {
    if (messages.length > previousMessagesLength.current) {
      const newMessages = messages.slice(previousMessagesLength.current);
      
      newMessages.forEach(message => {
        // Ne pas notifier si l'app est active et l'utilisateur regarde
        if (!isAppActive) {
          showNotification(message);
        }
      });
    }
    
    previousMessagesLength.current = messages.length;
    calculateUnreadCount();
  }, [messages, showNotification, isAppActive, calculateUnreadCount]);

  // Gérer le changement d'état de l'app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // L'app devient active, marquer comme lu après un délai
        if (notificationTimeout.current) {
          clearTimeout(notificationTimeout.current);
        }
        
        notificationTimeout.current = setTimeout(() => {
          markAsRead();
        }, 2000); // Marquer comme lu après 2 secondes
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [markAsRead]);

  // Mettre à jour les paramètres
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Obtenir le badge count pour l'icône de l'app
  const getBadgeCount = useCallback(() => {
    return Math.min(unreadCount, 99); // Limiter à 99
  }, [unreadCount]);

  // Notifications de mention (si l'utilisateur est mentionné)
  const checkForMentions = useCallback((message: Message, userName: string) => {
    const mentionPattern = new RegExp(`@${userName}`, 'i');
    return mentionPattern.test(message.text);
  }, []);

  return {
    settings,
    unreadCount,
    updateSettings,
    markAsRead,
    requestNotificationPermission,
    getBadgeCount,
    checkForMentions,
    showNotification,
  };
};

// Hook pour les notifications push (à implémenter avec expo-notifications)
export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);

  const registerForPushNotificationsAsync = useCallback(async () => {
    // Cette fonction devrait utiliser expo-notifications
    // pour enregistrer l'appareil pour les notifications push
    
    // Exemple d'implémentation :
    /*
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    }
    
    setExpoPushToken(token);
    return token;
    */
    
    return null;
  }, []);

  const sendPushNotification = useCallback(async (
    token: string,
    title: string,
    body: string,
    data?: any
  ) => {
    // Envoyer une notification push via l'API Expo
    /*
    const message = {
      to: token,
      sound: 'default',
      title,
      body,
      data,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    */
  }, []);

  return {
    expoPushToken,
    notification,
    registerForPushNotificationsAsync,
    sendPushNotification,
  };
};
