import { useState, useMemo, useCallback } from 'react';
import { Message } from '../types';

export interface SearchResult {
  message: Message;
  matchedText: string;
  highlightedText: string;
}

export const useMessageSearch = (messages: Message[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fonction pour surligner le texte trouvé
  const highlightText = useCallback((text: string, query: string): string => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '**$1**'); // Utilise ** pour marquer le texte surligné
  }, []);

  // Recherche dans les messages
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    messages.forEach(message => {
      const messageText = message.text.toLowerCase();
      const userName = message.userName.toLowerCase();

      // Recherche dans le texte du message
      if (messageText.includes(query)) {
        results.push({
          message,
          matchedText: message.text,
          highlightedText: highlightText(message.text, searchQuery),
        });
      }
      // Recherche dans le nom d'utilisateur
      else if (userName.includes(query)) {
        results.push({
          message,
          matchedText: message.userName,
          highlightedText: highlightText(message.userName, searchQuery),
        });
      }
    });

    // Trier par pertinence (messages les plus récents en premier)
    return results.sort((a, b) => 
      b.message.timestamp.getTime() - a.message.timestamp.getTime()
    );
  }, [messages, searchQuery, highlightText]);

  // Filtrer les messages affichés
  const filteredMessages = useMemo(() => {
    if (!isSearching || !searchQuery) {
      return messages;
    }
    return searchResults.map(result => result.message);
  }, [messages, searchResults, isSearching, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  // Statistiques de recherche
  const searchStats = useMemo(() => {
    if (!isSearching || !searchQuery) {
      return null;
    }

    return {
      totalResults: searchResults.length,
      query: searchQuery,
      hasResults: searchResults.length > 0,
    };
  }, [searchResults, isSearching, searchQuery]);

  return {
    searchQuery,
    searchResults,
    filteredMessages,
    isSearching,
    searchStats,
    handleSearch,
    clearSearch,
  };
};

// Hook pour la recherche avancée avec filtres
export const useAdvancedMessageSearch = (messages: Message[]) => {
  const [filters, setFilters] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    userId: null as string | null,
    messageType: 'all' as 'all' | 'text' | 'file',
  });

  const basicSearch = useMessageSearch(messages);

  // Appliquer les filtres avancés
  const advancedFilteredMessages = useMemo(() => {
    let filtered = basicSearch.filteredMessages;

    // Filtre par date
    if (filters.dateFrom) {
      filtered = filtered.filter(msg => 
        msg.timestamp >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(msg => 
        msg.timestamp <= filters.dateTo!
      );
    }

    // Filtre par utilisateur
    if (filters.userId) {
      filtered = filtered.filter(msg => 
        msg.userId === filters.userId
      );
    }

    // Filtre par type de message
    if (filters.messageType === 'file') {
      filtered = filtered.filter(msg => msg.fileUrl);
    } else if (filters.messageType === 'text') {
      filtered = filtered.filter(msg => !msg.fileUrl);
    }

    return filtered;
  }, [basicSearch.filteredMessages, filters]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      userId: null,
      messageType: 'all',
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filters.dateFrom || filters.dateTo || filters.userId || filters.messageType !== 'all';
  }, [filters]);

  return {
    ...basicSearch,
    filteredMessages: advancedFilteredMessages,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
  };
};
