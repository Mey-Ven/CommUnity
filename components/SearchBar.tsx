import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  isVisible: boolean;
  onToggle: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = 'Rechercher dans les messages...',
  isVisible,
  onToggle,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const slideAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isVisible]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setIsSearching(text.length > 0);
    
    if (text.length > 2) {
      onSearch(text);
    } else if (text.length === 0) {
      onClear();
    }
  }, [onSearch, onClear]);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsSearching(false);
    onClear();
    inputRef.current?.focus();
  }, [onClear]);

  const handleClose = useCallback(() => {
    setQuery('');
    setIsSearching(false);
    onClear();
    onToggle();
  }, [onClear, onToggle]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 60],
          }),
          opacity: slideAnim,
        },
      ]}
    >
      <View style={styles.searchContainer}>
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder={placeholder}
          placeholderTextColor="#999"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        
        {isSearching && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButton: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
