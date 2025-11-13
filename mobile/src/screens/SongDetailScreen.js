import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { theme, spacing } from '../utils/theme';

export default function SongDetailScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SongDetailScreen</Text>
      <Text style={styles.subtitle}>Coming soon! 🚀</Text>
      {navigation.goBack && (
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: spacing.xl,
  },
});
