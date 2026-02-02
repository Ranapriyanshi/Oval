import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ThreeDSceneProps {
  modelPath?: string;
  backgroundColor?: string;
}

/**
 * 3D Scene Component for rendering 3D illustrations
 * This component serves as a canvas for the 3D illustration-driven design system
 * 
 * NOTE: 3D rendering will be implemented in a later phase.
 * For now, this is a placeholder that can display 3D asset placeholders.
 */
const ThreeDScene: React.FC<ThreeDSceneProps> = ({
  modelPath,
  backgroundColor = '#ffffff',
}) => {
  // TODO: Implement 3D rendering with expo-gl and three.js
  // This will be added when 3D assets are ready
  // For now, this is a placeholder component

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.placeholderText}>3D Scene Placeholder</Text>
      {modelPath && (
        <Text style={styles.modelPath}>Model: {modelPath}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modelPath: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

export default ThreeDScene;
