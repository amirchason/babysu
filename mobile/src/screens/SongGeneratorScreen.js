import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { generateSong } from '../store/slices/songsSlice';
import { theme, spacing, shadows } from '../utils/theme';

const CATEGORIES = [
  { id: 'bedtime', label: 'Bedtime', icon: 'moon', color: '#9B59B6' },
  { id: 'morning', label: 'Morning Routine', icon: 'sunny', color: '#F39C12' },
  { id: 'potty', label: 'Potty Training', icon: 'water', color: '#3498DB' },
  { id: 'food', label: 'Healthy Eating', icon: 'nutrition', color: '#27AE60' },
  { id: 'sharing', label: 'Sharing & Kindness', icon: 'heart', color: '#E74C3C' },
  { id: 'learning', label: 'Learning', icon: 'book', color: '#E67E22' },
  { id: 'siblings', label: 'Sibling Love', icon: 'people', color: '#1ABC9C' },
  { id: 'birthday', label: 'Birthday', icon: 'gift', color: '#F06292' },
];

const STYLES = [
  { id: 'lullaby', label: 'Lullaby', emoji: '🌙' },
  { id: 'upbeat', label: 'Upbeat', emoji: '🎉' },
  { id: 'calm', label: 'Calm', emoji: '☁️' },
  { id: 'playful', label: 'Playful', emoji: '🎈' },
  { id: 'educational', label: 'Educational', emoji: '📚' },
];

export default function SongGeneratorScreen({ navigation }) {
  const dispatch = useDispatch();
  const { list: children } = useSelector((state) => state.children);
  const { generating, error } = useSelector((state) => state.songs);

  const [selectedChildren, setSelectedChildren] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('lullaby');
  const [topic, setTopic] = useState('');
  const [customDetails, setCustomDetails] = useState('');

  const toggleChild = (childId) => {
    if (selectedChildren.includes(childId)) {
      setSelectedChildren(selectedChildren.filter(id => id !== childId));
    } else {
      setSelectedChildren([...selectedChildren, childId]);
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (selectedChildren.length === 0) {
      Alert.alert('Select a Child', 'Please select at least one child');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a song category');
      return;
    }
    if (!topic.trim()) {
      Alert.alert('Enter Topic', 'Please enter a topic for the song');
      return;
    }

    try {
      await dispatch(generateSong({
        childIds: selectedChildren,
        category: CATEGORIES.find(c => c.id === selectedCategory)?.label,
        topic: topic.trim(),
        style: selectedStyle,
        customDetails: customDetails.trim(),
      })).unwrap();

      Alert.alert(
        'Song Generation Started! 🎵',
        'Your song is being created. This usually takes 60-90 seconds. Check the Library to see the status!',
        [
          { text: 'View Library', onPress: () => navigation.navigate('Library') },
          { text: 'Create Another', style: 'cancel' },
        ]
      );

      // Reset form
      setSelectedChildren([]);
      setSelectedCategory(null);
      setTopic('');
      setCustomDetails('');
    } catch (error) {
      Alert.alert('Generation Failed', error.message || 'Failed to generate song. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerEmoji}>🎵</Text>
        <Text style={styles.headerTitle}>Create a Song</Text>
        <Text style={styles.headerSubtitle}>Personalized music for your little one</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Step 1: Select Child */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepTitle}>
                <Text style={styles.stepTitleText}>Select Child</Text>
                <Text style={styles.stepSubtitle}>Who is this song for?</Text>
              </View>
            </View>

            {children.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No children added yet</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Children')}
                  style={styles.emptyButton}
                >
                  Add Child
                </Button>
              </View>
            ) : (
              <View style={styles.chipContainer}>
                {children.map((child) => (
                  <Chip
                    key={child.id}
                    mode="flat"
                    selected={selectedChildren.includes(child.childId)}
                    onPress={() => toggleChild(child.childId)}
                    style={[
                      styles.chip,
                      selectedChildren.includes(child.childId) && styles.chipSelected,
                    ]}
                    selectedColor={theme.colors.primary}
                  >
                    {child.name}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Step 2: Choose Category */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepTitle}>
                <Text style={styles.stepTitleText}>Choose Category</Text>
                <Text style={styles.stepSubtitle}>What's the occasion?</Text>
              </View>
            </View>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.categoryCardSelected,
                    { borderColor: category.color },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon}
                    size={32}
                    color={selectedCategory === category.id ? category.color : '#999'}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && { color: category.color },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Step 3: Song Details */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepTitle}>
                <Text style={styles.stepTitleText}>Song Details</Text>
                <Text style={styles.stepSubtitle}>Tell us more</Text>
              </View>
            </View>

            <TextInput
              mode="outlined"
              label="Topic"
              placeholder="e.g., Going to sleep peacefully"
              value={topic}
              onChangeText={setTopic}
              style={styles.input}
              outlineColor={theme.colors.primary}
              activeOutlineColor={theme.colors.primary}
            />

            <TextInput
              mode="outlined"
              label="Custom Details (Optional)"
              placeholder="e.g., Include stars and moon, calm melody"
              value={customDetails}
              onChangeText={setCustomDetails}
              multiline
              numberOfLines={3}
              style={styles.input}
              outlineColor={theme.colors.primary}
              activeOutlineColor={theme.colors.primary}
            />
          </Card.Content>
        </Card>

        {/* Step 4: Choose Style */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepTitle}>
                <Text style={styles.stepTitleText}>Choose Style</Text>
                <Text style={styles.stepSubtitle}>What mood?</Text>
              </View>
            </View>

            <View style={styles.styleGrid}>
              {STYLES.map((style) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleButton,
                    selectedStyle === style.id && styles.styleButtonSelected,
                  ]}
                  onPress={() => setSelectedStyle(style.id)}
                >
                  <Text style={styles.styleEmoji}>{style.emoji}</Text>
                  <Text
                    style={[
                      styles.styleLabel,
                      selectedStyle === style.id && styles.styleLabelSelected,
                    ]}
                  >
                    {style.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Generate Button */}
        <Button
          mode="contained"
          onPress={handleGenerate}
          loading={generating}
          disabled={generating || selectedChildren.length === 0 || !selectedCategory || !topic.trim()}
          style={styles.generateButton}
          buttonColor={theme.colors.primary}
          contentStyle={styles.generateButtonContent}
        >
          {generating ? 'Creating Magic...' : 'Generate Song 🎵'}
        </Button>

        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error.message}</Text>
            </Card.Content>
          </Card>
        )}

        <View style={{ height: spacing.xxl }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerEmoji: {
    fontSize: 60,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: spacing.md,
    marginTop: -20,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: 16,
    ...shadows.medium,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepTitle: {
    flex: 1,
  },
  stepTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  chip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary + '20',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1.5,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  categoryCardSelected: {
    borderWidth: 3,
    backgroundColor: theme.colors.background,
  },
  categoryLabel: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleButton: {
    width: '48%',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  styleButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  styleEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  styleLabel: {
    fontSize: 14,
    color: '#666',
  },
  styleLabelSelected: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  generateButton: {
    marginTop: spacing.md,
    borderRadius: 25,
  },
  generateButtonContent: {
    paddingVertical: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: spacing.md,
  },
  emptyButton: {
    borderRadius: 20,
  },
  errorCard: {
    marginTop: spacing.md,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
});
