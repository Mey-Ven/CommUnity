import React, { memo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Message } from '../types';

interface OptimizedMessageProps {
  message: Message;
  isOwnMessage: boolean;
  showAnimation?: boolean;
  index?: number;
}

const OptimizedMessage: React.FC<OptimizedMessageProps> = memo(({
  message,
  isOwnMessage,
  showAnimation = true,
  index = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(showAnimation ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(showAnimation ? 20 : 0)).current;

  useEffect(() => {
    if (showAnimation) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showAnimation, index]);

  const formattedTime = message.timestamp.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {!isOwnMessage && (
        <Text style={styles.userName}>{message.userName}</Text>
      )}
      
      <Text
        style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
        ]}
        numberOfLines={0}
      >
        {message.text}
      </Text>
      
      <Text
        style={[
          styles.timestamp,
          isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
        ]}
      >
        {formattedTime}
      </Text>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Optimisation : ne re-render que si les props importantes changent
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.isOwnMessage === nextProps.isOwnMessage &&
    prevProps.showAnimation === nextProps.showAnimation
  );
});

OptimizedMessage.displayName = 'OptimizedMessage';

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: '#999',
  },
});

export default OptimizedMessage;
