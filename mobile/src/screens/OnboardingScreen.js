import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, spacing } from '../utils/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    emoji: '🎵',
    title: 'Personalized Songs',
    description: 'Create unique songs with your child\'s name for special moments',
  },
  {
    emoji: '✨',
    title: 'AI-Powered Magic',
    description: 'Our AI generates beautiful, child-friendly music in seconds',
  },
  {
    emoji: '❤️',
    title: 'Make Parenting Easier',
    description: 'From bedtime routines to potty training, we\'ve got a song for that',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    navigation.replace('Login');
  };

  const slide = slides[currentSlide];

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttons}>
        {currentSlide < slides.length - 1 && (
          <Button
            mode="text"
            onPress={handleSkip}
            textColor="#FFFFFF"
            style={styles.skipButton}
          >
            Skip
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
          buttonColor="#FFFFFF"
          textColor={theme.colors.primary}
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </Button>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emoji: {
    fontSize: 100,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 26,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  buttons: {
    paddingHorizontal: spacing.xl,
  },
  skipButton: {
    marginBottom: spacing.sm,
  },
  nextButton: {
    borderRadius: 25,
  },
});
