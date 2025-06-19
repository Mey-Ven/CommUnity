import { useState, useEffect, useMemo, useCallback } from 'react';
import { Message } from '../types';

interface UseOptimizedMessagesProps {
  messages: Message[];
  pageSize?: number;
  maxMessages?: number;
}

export const useOptimizedMessages = ({
  messages,
  pageSize = 20,
  maxMessages = 100,
}: UseOptimizedMessagesProps) => {
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Optimisation : limiter le nombre de messages affichés
  const optimizedMessages = useMemo(() => {
    // Garder seulement les messages les plus récents
    const recentMessages = messages.slice(-maxMessages);
    return recentMessages;
  }, [messages, maxMessages]);

  // Pagination des messages
  const loadMoreMessages = useCallback(() => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const currentLength = displayedMessages.length;
      const nextMessages = optimizedMessages.slice(0, currentLength + pageSize);
      setDisplayedMessages(nextMessages);
      setIsLoadingMore(false);
    }, 300); // Simule un délai de chargement
  }, [displayedMessages.length, optimizedMessages, pageSize, isLoadingMore]);

  // Initialiser avec les premiers messages
  useEffect(() => {
    const initialMessages = optimizedMessages.slice(0, pageSize);
    setDisplayedMessages(initialMessages);
  }, [optimizedMessages, pageSize]);

  // Vérifier s'il y a plus de messages à charger
  const hasMoreMessages = displayedMessages.length < optimizedMessages.length;

  // Grouper les messages par date pour optimiser l'affichage
  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    
    displayedMessages.forEach(message => {
      const dateKey = message.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  }, [displayedMessages]);

  // Optimisation : mémoriser les messages formatés
  const formattedMessages = useMemo(() => {
    return displayedMessages.map(message => ({
      ...message,
      formattedTime: message.timestamp.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      formattedDate: message.timestamp.toLocaleDateString('fr-FR'),
    }));
  }, [displayedMessages]);

  return {
    displayedMessages: formattedMessages,
    groupedMessages,
    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
    totalMessages: optimizedMessages.length,
  };
};

// Hook pour optimiser le rendu des éléments de liste
export const useMessageItemMemo = () => {
  const renderMessageItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      // Ce callback sera mémorisé pour éviter les re-renders inutiles
      return { item, index };
    },
    []
  );

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 80, // Hauteur estimée d'un message
      offset: 80 * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback(
    (item: Message) => item.id,
    []
  );

  return {
    renderMessageItem,
    getItemLayout,
    keyExtractor,
  };
};

// Hook pour la gestion de la mémoire
export const useMemoryOptimization = () => {
  const [memoryWarning, setMemoryWarning] = useState(false);

  useEffect(() => {
    // Simuler la détection d'utilisation mémoire élevée
    const checkMemory = () => {
      // En production, vous pourriez utiliser des métriques réelles
      const isHighMemory = performance.memory?.usedJSHeapSize > 50 * 1024 * 1024; // 50MB
      setMemoryWarning(isHighMemory);
    };

    const interval = setInterval(checkMemory, 10000); // Vérifier toutes les 10 secondes
    return () => clearInterval(interval);
  }, []);

  const clearCache = useCallback(() => {
    // Nettoyer le cache si nécessaire
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('messages')) {
            caches.delete(name);
          }
        });
      });
    }
    setMemoryWarning(false);
  }, []);

  return {
    memoryWarning,
    clearCache,
  };
};
